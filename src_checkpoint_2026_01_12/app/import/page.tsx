import { createClient } from '@/lib/supabase/server'
import ImportPage from '@/components/import-page'
import { redirect } from 'next/navigation'

export default async function Page() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const { data: collections } = await supabase.from('collections').select('id, name, type')

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] container py-12">
            <h1 className="text-3xl font-bold mb-2">Import Items</h1>
            <p className="text-muted-foreground mb-8">Bulk add items from CSV or Spreadsheets.</p>

            <ImportPage collections={collections || []} />
        </div>
    )
}
