'use client'

import React from 'react'

interface OverviewProps {
    totalItems: number
    totalValue: number
    currency: string
}

export function OverviewStrip({ totalItems, totalValue, currency }: OverviewProps) {
    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(totalValue)

    return (
        <div className="animate-fade-in-down" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)'
        }}>
            {/* Total Value Card */}
            <div className="card" style={{
                background: 'linear-gradient(135deg, var(--surface-secondary) 0%, var(--surface-tertiary) 100%)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}>
                <span className="text-secondary text-xs uppercase font-bold tracking-wider">Portfolio Value</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formattedValue}
                </span>
                <span className="text-xs text-success flex items-center gap-1">
                    ↑ 2.4% <span className="text-tertiary">this week</span>
                </span>
            </div>

            {/* Total Items Card */}
            <div className="card" style={{
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}>
                <span className="text-secondary text-xs uppercase font-bold tracking-wider">Total Items</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {totalItems}
                </span>
                <span className="text-xs text-tertiary">
                    across all vaults
                </span>
            </div>

            {/* Quick Actions Placeholder (Integration Point) */}
            <div className="card" style={{
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: 0.8
            }}
            // Link to Quick Action
            >
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>➕</span>
                    <span className="font-bold text-sm">Quick Add</span>
                </div>
            </div>
        </div>
    )
}
