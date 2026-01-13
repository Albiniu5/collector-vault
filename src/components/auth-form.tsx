'use client'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EmailIcon from '@mui/icons-material/Email'
import GoogleIcon from '@mui/icons-material/Google'
import CircularProgress from '@mui/material/CircularProgress'

export function AuthForm() {
    const supabase = createClient()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mode, setMode] = useState<'login' | 'signup'>('login')
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                setMessage({ text: 'Check your email to confirm your account', type: 'success' })
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.refresh()
                router.push('/')
            }
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' })
            setIsLoading(false)
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="btn btn-secondary"
                style={{ width: '100%' }}
            >
                {isLoading ? <CircularProgress size={20} style={{ marginRight: '8px' }} /> : <GoogleIcon style={{ fontSize: '20px' }} />}
                Continue with Google
            </button>

            <div style={{ position: 'relative', margin: 'var(--space-4) 0' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: '100%', borderTop: '1px solid var(--border-color)' }} />
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <span style={{
                        background: 'var(--surface-primary)',
                        padding: '0 var(--space-3)',
                        fontSize: '0.875rem',
                        color: 'var(--text-tertiary)'
                    }}>
                        Or continue with email
                    </span>
                </div>
            </div>

            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="input"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="input"
                    />
                </div>

                {message && (
                    <div className="card" style={{
                        padding: 'var(--space-3)',
                        background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        border: `1px solid ${message.type === 'error' ? 'var(--accent-error)' : 'var(--accent-success)'}`
                    }}>
                        <p style={{
                            fontSize: '0.875rem',
                            color: message.type === 'error' ? 'var(--accent-error)' : 'var(--accent-success)',
                            margin: 0
                        }}>
                            {message.text}
                        </p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                >
                    {isLoading && <CircularProgress size={20} style={{ color: 'white' }} />}
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
            </form>

            <div style={{ textAlign: 'center' }}>
                <button
                    onClick={() => {
                        setMode(mode === 'login' ? 'signup' : 'login')
                        setMessage(null)
                    }}
                    className="btn btn-ghost btn-sm"
                >
                    {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
            </div>
        </div>
    )
}
