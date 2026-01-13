import { AuthForm } from '@/components/auth-form'
import LockIcon from '@mui/icons-material/Lock'

export default function LoginPage() {
    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
            padding: 'var(--space-4)'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '420px',
                padding: 'var(--space-8)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto var(--space-4)'
                    }}>
                        <LockIcon style={{ color: 'white', fontSize: '32px' }} />
                    </div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                        Vault
                    </h1>
                    <p className="text-secondary">
                        Sign in to your collection manager
                    </p>
                </div>

                <AuthForm />
            </div>
        </div>
    )
}
