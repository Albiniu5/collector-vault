import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { DashboardStats } from '@/components/dashboard-stats'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    return (
        <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
            <header style={{ marginBottom: 'var(--space-8)' }}>
                <Link href="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-4)', paddingLeft: 0 }}>
                    <ArrowBackIcon style={{ fontSize: '16px' }} /> Dashboard
                </Link>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 'var(--space-2)' }}>
                    Analytics & Insights
                </h1>
                <p className="text-secondary">
                    Deep dive into your portfolio performance
                </p>
            </header>

            {/* Re-use the nice stats */}
            <DashboardStats />

            {/* Placeholder Charts */}
            <div className="grid grid-2" style={{ marginTop: 'var(--space-8)' }}>
                <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <h3 className="text-secondary font-bold text-sm uppercase tracking-wider mb-4">Portfolio Growth</h3>
                    {/* Fake Chart Visual */}
                    <div style={{ width: '100%', height: '150px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '0 20px' }}>
                        {[40, 60, 45, 70, 85, 80, 95].map((h, i) => (
                            <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--surface-tertiary)', borderRadius: '4px', position: 'relative' }}>
                                {i === 6 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'var(--accent-primary)', opacity: 0.5, borderRadius: '4px' }}></div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <h3 className="text-secondary font-bold text-sm uppercase tracking-wider mb-4">Category Distribution</h3>
                    <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '20px solid var(--surface-tertiary)', borderTopColor: 'var(--accent-warning)', borderRightColor: 'var(--accent-primary)', transform: 'rotate(-45deg)' }}></div>
                </div>
            </div>

            <div className="card" style={{ marginTop: 'var(--space-6)', textAlign: 'center', padding: 'var(--space-12)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>Advanced Analytics Coming Soon</h3>
                <p className="text-secondary">Using Gemini AI to predict value trends for your specific items.</p>
            </div>
        </div>
    )
}
