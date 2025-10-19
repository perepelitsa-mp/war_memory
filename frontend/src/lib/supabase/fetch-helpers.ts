/**
 * Provides a fetch implementation that rewrites Supabase REST URLs when the
 * services are exposed directly (without the default `/rest/v1` prefix).
 */

const STRIP_REST_PREFIX_ENV = process.env.SUPABASE_STRIP_REST_PREFIX ?? 'auto'

function shouldStripRestPrefix(baseUrl: string): boolean {
  if (STRIP_REST_PREFIX_ENV === 'false') {
    return false
  }
  if (STRIP_REST_PREFIX_ENV === 'true') {
    return true
  }

  try {
    const parsed = new URL(baseUrl)
    const port =
      parsed.port ||
      (parsed.protocol === 'https:' ? '443' : parsed.protocol === 'http:' ? '80' : '')
    const isLoopback =
      parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
        || parsed.hostname === '[::1]'
    const isKnownPostgrestPort = port === '3001' || port === '54321'

    return isLoopback && isKnownPostgrestPort
  } catch (_error) {
    return false
  }
}


export function createSupabaseFetch(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, '')
  const restPrefix = `${normalized}/rest/v1`

  if (!shouldStripRestPrefix(normalized)) {
    return undefined
  }

  const rewriteUrl = (url: string) => {
    if (!url.startsWith(restPrefix)) {
      return null
    }

    return `${normalized}${url.slice(restPrefix.length)}`
  }

  return async function supabaseFetch(input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string' || input instanceof URL) {
      const rewritten = rewriteUrl(input.toString())
      if (rewritten) {
        return fetch(rewritten, init)
      }

      return fetch(input as any, init)
    }

    const request = input as Request
    const rewritten = rewriteUrl(request.url)
    if (rewritten) {
      const newRequest = new Request(rewritten, request)
      return fetch(newRequest)
    }

    return fetch(request, init)
  }
}
