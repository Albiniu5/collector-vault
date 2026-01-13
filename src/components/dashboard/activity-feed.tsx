'use client'

import React from 'react'

interface ActivityItem {
    id: string
    name: string
    collectionName: string
    type: string
    timestamp: string
    value?: number
}

interface ActivityFeedProps {
    items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
    if (!items || items.length === 0) return null

    return (
        <div className="card animate-fade-in" style={{
            marginTop: 'var(--space-12)',
            padding: 'var(--space-6)',
            background: 'var(--surface-primary)',
            border: '1px solid var(--border-color)',
            maxWidth: '600px' // Keep it from getting too wide if full width
        }}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4">
                Recent Activity
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-0)' }}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1
                    const date = new Date(item.timestamp).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric'
                    })

                    return (
                        <div key={item.id} style={{
                            display: 'flex',
                            gap: 'var(--space-4)',
                            position: 'relative',
                            paddingBottom: isLast ? 0 : 'var(--space-6)'
                        }}>
                            {/* Process Line */}
                            {!isLast && (
                                <div style={{
                                    position: 'absolute',
                                    left: '6px',
                                    top: '24px',
                                    bottom: 0,
                                    width: '2px',
                                    background: 'var(--border-color)'
                                }}></div>
                            )}

                            {/* Dot */}
                            <div style={{
                                width: '14px', height: '14px',
                                borderRadius: '50%',
                                background: 'var(--accent-primary)',
                                border: '2px solid var(--surface-primary)',
                                marginTop: '4px',
                                zIndex: 1
                            }}></div>

                            {/* Content */}
                            <div>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                                    Added <strong>{item.name}</strong> to {item.collectionName}
                                </p>
                                <p className="text-secondary text-xs">
                                    {new Date(item.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
