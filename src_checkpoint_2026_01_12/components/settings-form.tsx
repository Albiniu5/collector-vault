'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/settings/actions'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface Profile {
    brickset_api_key?: string
    bricklink_consumer_key?: string
    bricklink_consumer_secret?: string
    bricklink_token_value?: string
    bricklink_token_secret?: string
    currency?: string
}

export function SettingsForm({ initialProfile }: { initialProfile: Profile }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true)
        setError('')
        setIsSaved(false)

        const result = await updateProfile(formData)

        setIsLoading(false)
        if (result.error) {
            setError(result.error)
        } else {
            setIsSaved(true)
            setTimeout(() => setIsSaved(false), 3000)
        }
    }

    return (
        <form action={handleSubmit}>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>General Settings</h3>
                <div style={{ maxWidth: '300px' }}>
                    <label className="text-xs uppercase font-semibold text-secondary mb-1 block">Currency</label>
                    <select
                        name="currency"
                        defaultValue={initialProfile.currency || 'USD'}
                        className="input-premium"
                        style={{ width: '100%', cursor: 'pointer' }}
                    >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                    </select>
                    <p className="text-xs text-tertiary mt-2">
                        This currency will be used for all price estimates and totals.
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Brickset Integration</h3>
                <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
                    Needed for detailed part counts and metadata (if Rebrickable is inactive).
                </p>
                <div>
                    <label className="text-xs uppercase font-semibold text-secondary mb-1 block">Brickset API Key</label>
                    <input
                        name="brickset_api_key"
                        defaultValue={initialProfile.brickset_api_key || ''}
                        className="input-premium"
                        placeholder="Paste your key here..."
                        style={{ fontFamily: 'monospace' }}
                    />
                    <p className="text-xs text-tertiary mt-2">
                        Get it here: <a href="https://brickset.com/tools/webservices/requestkey" target="_blank" className="underline hover:text-primary">Request Key</a>
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>BrickLink API Keys</h3>
                <p className="text-sm text-secondary" style={{ marginBottom: 'var(--space-4)' }}>
                    Enter your OAuth tokens from the BrickLink API settings page.
                </p>

                <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
                    <div>
                        <label className="text-xs uppercase font-semibold text-secondary mb-1 block">Consumer Key</label>
                        <input
                            name="bricklink_consumer_key"
                            defaultValue={initialProfile.bricklink_consumer_key || ''}
                            className="input-premium"
                            style={{ fontFamily: 'monospace' }}
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-semibold text-secondary mb-1 block">Consumer Secret</label>
                        <input
                            name="bricklink_consumer_secret"
                            type="password"
                            defaultValue={initialProfile.bricklink_consumer_secret || ''}
                            className="input-premium"
                            style={{ fontFamily: 'monospace' }}
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-semibold text-secondary mb-1 block">Token Value</label>
                        <input
                            name="bricklink_token_value"
                            defaultValue={initialProfile.bricklink_token_value || ''}
                            className="input-premium"
                            style={{ fontFamily: 'monospace' }}
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase font-semibold text-secondary mb-1 block">Token Secret</label>
                        <input
                            name="bricklink_token_secret"
                            type="password"
                            defaultValue={initialProfile.bricklink_token_secret || ''}
                            className="input-premium"
                            style={{ fontFamily: 'monospace' }}
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className={`btn ${isSaved ? 'btn-ghost' : 'btn-primary'}`}
                disabled={isLoading}
                style={{
                    color: isSaved ? 'var(--accent-success)' : undefined,
                    transition: 'all 0.2s ease',
                    width: '100%',
                    justifyContent: 'center'
                }}
            >
                {isSaved ? <CheckCircleIcon style={{ marginRight: '8px' }} /> : <SaveIcon style={{ fontSize: '18px', marginRight: 'var(--space-2)' }} />}
                {isSaved ? 'Keys Saved' : isLoading ? 'Saving...' : 'Save API Keys'}
            </button>

            {error && (
                <p style={{ color: 'var(--accent-error)', marginTop: 'var(--space-2)', fontSize: '0.875rem' }}>
                    {error}
                </p>
            )}
        </form>
    )
}
