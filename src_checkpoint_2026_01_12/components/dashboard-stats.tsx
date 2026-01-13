import { createClient } from '@/lib/supabase/server'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import InventoryIcon from '@mui/icons-material/Inventory'
import FolderIcon from '@mui/icons-material/Folder'

export async function DashboardStats() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: items } = await supabase.from('items').select('id, current_value, purchase_price')
    const { count: collectionCount } = await supabase
        .from('collections')
        .select('id', { count: 'exact', head: true })

    const totalItems = items?.length || 0
    const totalValue = items?.reduce((acc, item) => acc + (item.current_value || item.purchase_price || 0), 0) || 0

    const stats = [
        {
            label: 'Total Value',
            value: `$${totalValue.toLocaleString()}`,
            icon: AttachMoneyIcon,
            color: '#10B981',
            bgColor: 'rgba(16, 185, 129, 0.1)'
        },
        {
            label: 'Total Items',
            value: totalItems.toLocaleString(),
            icon: InventoryIcon,
            color: '#6366F1',
            bgColor: 'rgba(99, 102, 241, 0.1)'
        },
        {
            label: 'Collections',
            value: (collectionCount || 0).toLocaleString(),
            icon: FolderIcon,
            color: '#F59E0B',
            bgColor: 'rgba(245, 158, 11, 0.1)'
        }
    ]

    return (
        <div className="grid grid-3" style={{ marginBottom: 'var(--space-12)' }}>
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <div
                        key={stat.label}
                        className="card"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-4)'
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius-lg)',
                            background: stat.bgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Icon style={{ fontSize: '24px', color: stat.color }} />
                        </div>

                        <div>
                            <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-1)' }}>
                                {stat.label}
                            </p>
                            <h3 style={{
                                fontSize: '2rem',
                                fontWeight: 700,
                                margin: 0,
                                lineHeight: 1
                            }}>
                                {stat.value}
                            </h3>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
