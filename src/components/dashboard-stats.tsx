import { createClient } from '@/lib/supabase/server'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import InventoryIcon from '@mui/icons-material/Inventory'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

export async function DashboardStats() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: items } = await supabase.from('items').select('id, name, current_value, purchase_price')

    // Calculate Stats
    const totalItems = items?.length || 0
    const totalValue = items?.reduce((acc, item) => acc + (item.current_value || item.purchase_price || 0), 0) || 0

    // Find most valuable item
    const mostValuable = items?.reduce((prev, current) => {
        const prevVal = prev.current_value || prev.purchase_price || 0
        const currentVal = current.current_value || current.purchase_price || 0
        return (prevVal > currentVal) ? prev : current
    }, items[0] || null)

    const mostValuablePrice = mostValuable ? (mostValuable.current_value || mostValuable.purchase_price || 0) : 0

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-12)'
        }}>

            {/* Total Value Card */}
            <div className="card" style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--surface-primary) 0%, var(--surface-secondary) 100%)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--accent-warning)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <TrendingUpIcon style={{ fontSize: '16px' }} />
                        <span>Total Portfolio Value</span>
                    </div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                        ${totalValue.toLocaleString()}
                    </div>
                </div>
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '100px',
                    height: '100px',
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(0,0,0,0) 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }} />
            </div>

            {/* Most Valuable Item */}
            {mostValuable && (
                <div className="card" style={{
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <AutoAwesomeIcon style={{ fontSize: '16px' }} />
                            <span>Top Asset</span>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {mostValuable.name}
                        </div>
                        <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            ${mostValuablePrice.toLocaleString()}
                        </div>
                    </div>
                </div>
            )}

            {/* Total Items */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-tertiary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
                            <InventoryIcon style={{ fontSize: '16px' }} />
                            <span>Total Items</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, color: 'var(--text-primary)' }}>
                            {totalItems.toLocaleString()}
                        </div>
                    </div>
                    {/* Tiny visual graph or extra stats could go here */}
                </div>
            </div>

        </div>
    )
}
