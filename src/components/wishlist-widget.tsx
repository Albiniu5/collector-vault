'use client'

import React from 'react'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import AddIcon from '@mui/icons-material/Add'

export function WishlistWidget() {
    return (
        <div className="card" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '200px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-4)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div style={{
                        padding: '6px',
                        borderRadius: '8px',
                        background: 'var(--surface-tertiary)',
                        display: 'flex'
                    }}>
                        <StarBorderIcon style={{ fontSize: '20px', color: 'var(--text-secondary)' }} />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Wishlist</h3>
                </div>
                <button className="btn btn-ghost btn-icon">
                    <AddIcon fontSize="small" />
                </button>
            </div>

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-tertiary)',
                background: 'var(--surface-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-color)',
                padding: 'var(--space-4)'
            }}>
                <span style={{ fontSize: '0.875rem' }}>Your wishlist is empty</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Add items you want to track</span>
            </div>
        </div>
    )
}
