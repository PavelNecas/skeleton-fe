import { ElasticClient } from '@skeleton-fe/sdk-elastic'

let instance: ElasticClient | null = null

/**
 * Returns the singleton ElasticClient instance.
 * Reads connection details from environment variables.
 */
export function getElasticClient(): ElasticClient {
  if (!instance) {
    instance = new ElasticClient({
      url: process.env.ELASTICSEARCH_URL ?? 'http://elasticsearch:9200',
      username: process.env.ELASTICSEARCH_USERNAME ?? '',
      password: process.env.ELASTICSEARCH_PASSWORD ?? '',
    })
  }
  return instance
}
