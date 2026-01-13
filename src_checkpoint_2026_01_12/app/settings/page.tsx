import { getProfile } from './actions'
import { SettingsForm } from '@/components/settings-form'
import Link from 'next/link'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export default async function SettingsPage() {
    const profile = await getProfile()

    return (
        <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <Link href="/" className="btn btn-ghost" style={{ marginBottom: 'var(--space-4)', paddingLeft: 0 }}>
                    <ArrowBackIcon style={{ fontSize: '18px', marginRight: 'var(--space-2)' }} />
                    Back to Dashboard
                </Link>
                <h1>Settings</h1>
                <p className="text-secondary">Manage your integrations and preferences.</p>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>Integrations</h2>
                <SettingsForm initialProfile={profile || {}} />
            </div>
        </div>
    )
}
