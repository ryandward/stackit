/*
 * API client. Single point where invite-token header is attached and
 * where the `/api` prefix is added. Components call api.get('/tenants/...')
 * without thinking about either.
 */

const INVITE_KEY = 'stackit-invite'

export function getInviteToken(): string | null {
  try {
    return localStorage.getItem(INVITE_KEY)
  } catch {
    return null
  }
}

export function setInviteToken(token: string): void {
  try {
    localStorage.setItem(INVITE_KEY, token)
  } catch {
    /* ignore */
  }
}

export function clearInviteToken(): void {
  try {
    localStorage.removeItem(INVITE_KEY)
  } catch {
    /* ignore */
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {}
  const token = getInviteToken()
  if (token) headers['X-Invite-Token'] = token
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const init: RequestInit = { method, headers }
  if (body !== undefined) init.body = JSON.stringify(body)

  const r = await fetch(`/api${path}`, init)

  if (r.status === 401) {
    clearInviteToken()
    throw new Error('Invite token invalid or missing.')
  }
  if (!r.ok) {
    throw new Error(`HTTP ${r.status}`)
  }
  return (await r.json()) as T
}

export const api = {
  get:  <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
}
