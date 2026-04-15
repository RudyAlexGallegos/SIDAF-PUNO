// 🚀 FRONTEND PERFORMANCE OPTIMIZATION
// archivo: frontend/lib/api-optimized.ts
// Wrapper para mejorar performance con caching local

import { useEffect, useState } from 'react'

const CACHE_DURATION = {
  ARBITROS: 60 * 60 * 1000,      // 1 hora
  EQUIPOS: 60 * 60 * 1000,       // 1 hora
  CAMPEONATOS: 30 * 60 * 1000,   // 30 minutos
  DESIGNACIONES: 15 * 60 * 1000, // 15 minutos
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<any>>()

/**
 * Obtener datos con caché local
 * @param key Clave única
 * @param fetcher Función para obtener datos
 * @param duration Duración del caché en ms
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  duration: number = 60000
): Promise<T> {
  // Verificar si existe en caché y no ha expirado
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < duration) {
    return cached.data as T
  }

  // Obtener datos frescos
  const data = await fetcher()
  
  // Guardar en caché
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })

  return data
}

/**
 * Hook para usar datos con caché y revalidación
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  duration: number
): T | null {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWithCache(key, fetcher, duration)
      .then(setData)
      .finally(() => setLoading(false))
  }, [key])

  return data
}

/**
 * Limpiar caché cuando sea necesario
 */
export function invalidateCache(key?: string) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}
