import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { esSearch, esSearchOne } from '../elastic-edge'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  vi.stubEnv('ELASTICSEARCH_URL', 'http://es-test:9200')
  vi.stubEnv('ELASTICSEARCH_USERNAME', 'user')
  vi.stubEnv('ELASTICSEARCH_PASSWORD', 'pass')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

function makeEsResponse<T>(hits: T[]) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ hits: { hits: hits.map((_source) => ({ _source })) } }),
  }
}

describe('esSearch', () => {
  it('posts to the correct endpoint with auth header', async () => {
    mockFetch.mockResolvedValueOnce(makeEsResponse([{ id: 1 }]))

    const query = { query: { match_all: {} } }
    await esSearch('my_index', query)

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('http://es-test:9200/my_index/_search')
    expect(options.method).toBe('POST')
    expect((options.headers as Record<string, string>)['Authorization']).toBe(
      `Basic ${btoa('user:pass')}`,
    )
    expect(options.body).toBe(JSON.stringify(query))
  })

  it('returns mapped _source items', async () => {
    mockFetch.mockResolvedValueOnce(makeEsResponse([{ id: 1 }, { id: 2 }]))

    const results = await esSearch<{ id: number }>('my_index', {})
    expect(results).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' })

    await expect(esSearch('bad_index', {})).rejects.toThrow('ES fetch error: 404 Not Found')
  })

  it('returns empty array when hits is empty', async () => {
    mockFetch.mockResolvedValueOnce(makeEsResponse([]))
    const results = await esSearch('my_index', {})
    expect(results).toEqual([])
  })
})

describe('esSearchOne', () => {
  it('returns first result', async () => {
    mockFetch.mockResolvedValueOnce(makeEsResponse([{ id: 42 }, { id: 99 }]))
    const result = await esSearchOne<{ id: number }>('my_index', {})
    expect(result).toEqual({ id: 42 })
  })

  it('returns null when no results', async () => {
    mockFetch.mockResolvedValueOnce(makeEsResponse([]))
    const result = await esSearchOne('my_index', {})
    expect(result).toBeNull()
  })
})
