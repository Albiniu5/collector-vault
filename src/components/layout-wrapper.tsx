'use client'

import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/sidebar'
import { QuickActionModal } from '@/components/quick-action-modal'
import { useEffect, useState, Suspense } from 'react'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const [collections, setCollections] = useState<any[]>([])
    const supabase = createClient()

    // Paths that should not have sidebar
    const authPaths = ['/login', '/signup', '/auth']
    const isAuthPage = authPaths.some(path => pathname?.startsWith(path))

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            setUser(currentUser)

            if (currentUser) {
                const { data } = await supabase
                    .from('collections')
                    .select('id, name, type, subdivision')
                    .order('created_at', { ascending: false })
                setCollections(data || [])
            }
        }

        fetchData()

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchData()
        })

        return () => subscription.unsubscribe()
    }, [])

    if (isAuthPage || !user) {
        return <>{children}</>
    }

    return (
        <div className="app-layout">
            <Sidebar collections={collections} userEmail={user.email} />
            <main className="main-content">
                {children}
            </main>
            <Suspense fallback={null}>
                <QuickActionModal collections={collections} />
            </Suspense>
        </div>
    )
}
