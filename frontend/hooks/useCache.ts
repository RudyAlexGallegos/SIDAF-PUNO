import { useEffect, useState } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

const CACHE_PREFIX = 'sidaf_cache_'

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number // Default: 5 minutes
    skipCache?: boolean
  }
): {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
} {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const ttl = options?.ttl ?? 5 * 60 * 1000 // 5 minutes default
  const cacheKey = CACHE_PREFIX + key

  const getCachedData = (): T | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null

      const entry: CacheEntry<T> = JSON.parse(cached)
      const isExpired = Date.now() - entry.timestamp > entry.ttl
      
      if (isExpired) {
        localStorage.removeItem(cacheKey)
        return null
      }

      return entry.data
    } catch {
      return null
    }
  }

  const setCachedData = (value: T) => {
    if (typeof window === 'undefined') return
    
    try {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
      }
      localStorage.setItem(cacheKey, JSON.stringify(entry))
    } catch {
      console.error('Failed to cache data')
    }
  }

  const refetch = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await fetcher()
      setData(result)
      setCachedData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      // Try cache first
      const cached = getCachedData()
      if (cached && !options?.skipCache) {
        setData(cached)
        setIsLoading(false)
        return
      }

      // Fetch fresh data
      await refetch()
    }

    fetchData()
  }, [key])

  return { data, isLoading, error, refetch }
}
