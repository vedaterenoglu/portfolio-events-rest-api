export interface ThrottlingConfig {
  name: string
  ttl: number
  limit: number
}

export const getThrottlingConfig = (): ThrottlingConfig[] => {
  const environment = process.env.NODE_ENV || 'development'

  switch (environment) {
    case 'production':
      return [
        { name: 'short', ttl: 1000, limit: 3 },
        { name: 'long', ttl: 60000, limit: 100 },
      ]
    case 'test':
      return [] // No throttling in test environment
    case 'development':
    default:
      return [
        { name: 'short', ttl: 1000, limit: 50 },
        { name: 'long', ttl: 60000, limit: 1000 },
      ]
  }
}
