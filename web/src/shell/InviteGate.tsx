import { useState, useEffect, type ReactNode, type FormEvent } from 'react'
import { getInviteToken, setInviteToken } from '../lib/api'

export function InviteGate({ children }: { children: ReactNode }) {
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    // URL-param shortcut: visiting ?token=XYZ stores the token and
    // strips it from the URL so the gate never asks again on this
    // device. Lets a demo link be a single click with no typing.
    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get('token')
    if (fromUrl) {
      setInviteToken(fromUrl.trim())
      params.delete('token')
      const clean =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : '') +
        window.location.hash
      window.history.replaceState({}, '', clean)
    }

    setHasToken(getInviteToken() !== null)
    const onCleared = () => {
      setHasToken(false)
      setInput('')
    }
    window.addEventListener('stackit:invite-cleared', onCleared)
    return () => window.removeEventListener('stackit:invite-cleared', onCleared)
  }, [])

  if (hasToken === null) return null

  if (!hasToken) {
    const submit = (e: FormEvent) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed) return
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
            onChange={e => setInput(e.target.value)}
            placeholder="invite code"
          />
          <button type="submit" className="button" data-variant="primary">
            Continue
          </button>
        </form>
      </div>
    )
  }

  return <>{children}</>
}
