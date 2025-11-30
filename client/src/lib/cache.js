/**
 * Smart localStorage cache with DATA-BASED invalidation
 * Cache is only invalidated when underlying data changes, not by time
 */

const CACHE_PREFIX = 'skytrack_cache_'

/**
 * Generate a hash from data to detect changes
 * @param {any} data - Data to hash
 * @returns {string} - Hash string
 */
export function generateDataHash(data) {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(36)
}

/**
 * Get cached data only if the data hash matches (data hasn't changed)
 * @param {string} key - Cache key
 * @param {string} currentDataHash - Hash of current source data
 * @returns {any|null} - Cached result or null if data changed
 */
export function getCache(key, currentDataHash) {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key)
    if (!item) return null
    
    const { data, dataHash, cachedAt } = JSON.parse(item)
    
    // Only return cached data if the source data hasn't changed
    if (dataHash === currentDataHash) {
      return data
    }
    
    // Data has changed, cache is invalid
    console.log(`Cache miss for ${key}: data changed`)
    return null
  } catch (e) {
    console.warn('Cache read error:', e)
    return null
  }
}

/**
 * Set cache with data hash for smart invalidation
 * @param {string} key - Cache key
 * @param {any} data - AI result data to cache
 * @param {string} dataHash - Hash of the source data used to generate this result
 */
export function setCache(key, data, dataHash) {
  try {
    const item = {
      data,
      dataHash,
      cachedAt: new Date().toISOString()
    }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item))
  } catch (e) {
    console.warn('Cache write error:', e)
  }
}

/**
 * Clear specific cache
 * @param {string} key - Cache key to clear
 */
export function clearCache(key) {
  try {
    localStorage.removeItem(CACHE_PREFIX + key)
  } catch (e) {
    console.warn('Cache clear error:', e)
  }
}

/**
 * Clear all SkyTrack caches
 */
export function clearAllCache() {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key))
  } catch (e) {
    console.warn('Cache clear all error:', e)
  }
}

/**
 * Get cache metadata (for debugging/display)
 * @param {string} key - Cache key
 * @returns {object|null} - Cache metadata
 */
export function getCacheInfo(key) {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key)
    if (!item) return null
    
    const { cachedAt, dataHash } = JSON.parse(item)
    
    return {
      cachedAt,
      dataHash,
      ageMinutes: Math.round((Date.now() - new Date(cachedAt).getTime()) / 60000)
    }
  } catch (e) {
    return null
  }
}

// Cache keys constants
export const CACHE_KEYS = {
  AI_STATUS: 'ai_status',
  AI_INSIGHTS: 'ai_insights',
  AI_TASKS: 'ai_tasks',
  MANAGER_SUMMARY: 'manager_summary',
  MANAGER_RETRO: 'manager_retro',
  MANAGER_PROJECTS: 'manager_projects'
}
