'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AppsIcon from '@mui/icons-material/Apps'
import PublicIcon from '@mui/icons-material/Public'
import Link from 'next/link'

interface Item {
    id: string
    name: string
    description: string | null
    image_url: string | null
    purchase_price: number | null
    current_value: number | null
    external_id: string | null
    metadata: any
    collection_id: string
}

export function ItemDetailView({ item, currencyCode }: { item: Item, currencyCode: string }) {
    const router = useRouter()
    const metadata = item.metadata || {}

    const formatPrice = (value: number | null) => {
        if (value === null) return '—'
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: currencyCode,
        })
    }

    // Helper to render a metadata badge
    const MetaBadge = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
        }}>
            <Icon style={{ color: 'var(--text-secondary)', fontSize: '20px' }} />
            <div>
                <div className="text-secondary text-xs uppercase font-bold" style={{ fontSize: '0.65rem' }}>{label}</div>
                <div style={{ fontWeight: 600 }}>{value}</div>
            </div>
        </div>
    )

    return (
        <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>

            {/* Nav */}
            <button
                onClick={() => router.back()}
                className="btn btn-ghost"
                style={{ marginBottom: 'var(--space-6)', paddingLeft: 0 }}
            >
                <ArrowBackIcon style={{ fontSize: '18px', marginRight: 'var(--space-2)' }} />
                Back to Collection
            </button>

            <div className="grid grid-2" style={{ gap: 'var(--space-8)', alignItems: 'start' }}>

                {/* Left Column: Image */}
                <div className="card" style={{
                    padding: 'var(--space-8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white', // Force white/neutral for image clarity
                    minHeight: '400px'
                }}>
                    {item.image_url ? (
                        <img
                            src={item.image_url}
                            alt={item.name}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '500px',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
                            }}
                        />
                    ) : (
                        <div className="text-tertiary flex flex-col items-center">
                            <ImageNotSupportedIcon style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }} />
                            <span>No Image Available</span>
                        </div>
                    )}
                </div>

                {/* Right Column: Details */}
                <div>
                    <div style={{ marginBottom: 'var(--space-2)' }}>
                        <span style={{
                            background: 'var(--surface-tertiary)',
                            color: 'var(--text-secondary)',
                            padding: '4px 10px',
                            borderRadius: '100px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.05em'
                        }}>
                            {item.external_id ? `SET #${item.external_id}` : 'ITEM'}
                        </span>
                    </div>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 'var(--space-6)' }}>
                        {item.name}
                    </h1>

                    {/* Stats Grid */}
                    <div className="grid grid-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                        <div className="card" style={{ padding: 'var(--space-4)', background: 'var(--surface-secondary)' }}>
                            <div className="text-secondary text-xs uppercase font-bold mb-1">Current Value</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                                {formatPrice(item.current_value)}
                            </div>
                        </div>
                        <div className="card" style={{ padding: 'var(--space-4)', background: 'var(--surface-secondary)' }}>
                            <div className="text-secondary text-xs uppercase font-bold mb-1">Purchase Price</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {formatPrice(item.purchase_price)}
                            </div>
                        </div>
                    </div>

                    {/* Metadata Badges */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: 'var(--space-3)',
                        marginBottom: 'var(--space-8)'
                    }}>
                        {metadata.year && (
                            <MetaBadge icon={CalendarTodayIcon} label="Year" value={metadata.year} />
                        )}
                        {metadata.num_parts > 0 && (
                            <MetaBadge icon={AppsIcon} label="Pieces" value={metadata.num_parts.toLocaleString()} />
                        )}
                        {metadata.country && (
                            <MetaBadge icon={PublicIcon} label="Country" value={metadata.country} />
                        )}
                        {/* Can add more badges here dynamically */}
                    </div>

                    {/* External Links */}
                    {item.external_id && (
                        <div style={{ marginBottom: 'var(--space-8)' }}>
                            <a
                                href={`https://www.bricklink.com/v2/catalog/catalogitem.page?S=${item.external_id.replace('-1', '')}#T=P`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary"
                                style={{ display: 'inline-flex' }}
                            >
                                View on BrickLink ↗
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
