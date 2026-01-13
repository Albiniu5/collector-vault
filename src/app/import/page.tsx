import { createClient } from '@/lib/supabase/server'
import { ImportWizard } from '@/components/import/import-wizard'
import { redirect } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Link from 'next/link'

export default async function Page() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const { data: collections } = await supabase.from('collections').select('id, name, type, subdivision')

    return (
        <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
            <header style={{ marginBottom: 'var(--space-8)' }}>
                <Link href="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)', paddingLeft: 0 }}>
                    <ArrowBackIcon style={{ fontSize: '16px' }} /> Cancel Import
                </Link>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 'var(--space-2)' }}>
                    Import Items
                </h1>
                <p className="text-secondary">
                    Bulk add items to your vaults from CSV
                </p>
            </header>

            <ImportWizard collections={collections || []} />
        </div>
    )
}
