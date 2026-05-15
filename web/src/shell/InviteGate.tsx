import { useState, useEffect, type ReactNode, type FormEvent } from 'react'
import { getInviteToken, setInviteToken } from '../lib/api'

async function verify(token: string): Promise<boolean> {
  const r = await fetch('/api/verify', {
    headers: { 'X-Invite-Token': token },
  })
  return r.ok
}

export function InviteGate({ children }: { children: ReactNode }) {
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function init() {
      // URL-param shortcut: visiting ?token=XYZ verifies the token, stores
      // it on success, and strips it from the URL either way.
      const params = new URLSearchParams(window.location.search)
      const fromUrl = params.get('token')
      if (fromUrl) {
        const trimmed = fromUrl.trim()
        const ok = await verify(trimmed)
        if (ok) setInviteToken(trimmed)
        params.delete('token')
        const clean =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : '') +
          window.location.hash
        window.history.replaceState({}, '', clean)
      }

      if (!cancelled) setHasToken(getInviteToken() !== null)
    }

    void init()

    const onCleared = () => {
      setHasToken(false)
      setInput('')
    }
    window.addEventListener('stackit:invite-cleared', onCleared)
    return () => {
      cancelled = true
      window.removeEventListener('stackit:invite-cleared', onCleared)
    }
  }, [])

  if (hasToken === null) return null

  if (!hasToken) {
    const submit = async (e: FormEvent) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed || submitting) return
      setSubmitting(true)
      setError(null)
      const ok = await verify(trimmed)
      setSubmitting(false)
      if (!ok) {
        setError('That invite code is not valid.')
        return
      }
      setInviteToken(trimmed)
      setHasToken(true)
    }
    return (
      <div className="invite-gate">
        <form onSubmit={submit}>
          <h1>stackit</h1>
          <p>Private preview. Enter your invite code to continue.</p>
          <input
            type="text"
            autoFocus
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            value={input}
            onChange={e => {
              setInput(e.target.value)
              if (error) setError(null)
            }}
            placeholder="invite code"
            disabled={submitting}
          />
          {error ? <p className="invite-gate__error">{error}</p> : null}
          <button
            type="submit"
            className="button"
            data-variant="primary"
            disabled={submitting}
          >
            {submitting ? 'Verifying' : 'Continue'}
          </button>
        </form>
      </div>
    )
  }

  return <>{children}</>
}
