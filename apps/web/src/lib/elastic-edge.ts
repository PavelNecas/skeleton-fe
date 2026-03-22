/**
 * Lightweight Elasticsearch fetch helper for Edge Runtime (Next.js middleware).
 * Cannot use @elastic/elasticsearch (Node.js http module) — uses native fetch instead.
 */

interface EsSearchResponse<T> {
  hits: {
    hits: Array<{ _source: T }>
  }
}

function getEsConfig(): { url: string; authHeader: string } {
  const url = process.env.ELASTICSEARCH_URL ?? 'http://elasticsearch:9200'
  const username = process.env.ELASTICSEARCH_USERNAME ?? ''
  const password = process.env.ELASTICSEARCH_PASSWORD ?? ''
  const authHeader = `Basic ${btoa(`${username}:${password}`)}`
  return { url, authHeader }
}

export async function esSearch<T>(index: string, query: object): Promise<T[]> {
  const { url, authHeader } = getEsConfig()
  const endpoint = `${url}/${index}/_search`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(query),
  })

  if (!response.ok) {
    throw new Error(`ES fetch error: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as EsSearchResponse<T>
  return data.hits.hits.map((hit) => hit._source)
}

export async function esSearchOne<T>(index: string, query: object): Promise<T | null> {
  const results = await esSearch<T>(index, query)
  return results[0] ?? null
}
