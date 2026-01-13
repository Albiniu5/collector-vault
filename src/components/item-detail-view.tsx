'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AppsIcon from '@mui/icons-material/Apps'
import PublicIcon from '@mui/icons-material/Public'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import Link from 'next/link'
import { updateItem, refreshItemMetadata } from '@/app/items/actions'
import { generateItemDescription } from '@/app/items/ai-actions'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'

interface Item {
    id: string
    name: string
    description: string | null
    image_url: string | null
    purchase_price: number | null
    current_value: number | null
    price_alert_threshold: number | null
    external_id: string | null
    metadata: any
    collection_id: string
}

export function ItemDetailView({ item, currencyCode }: { item: Item, currencyCode: string }) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: item.name,
        current_value: item.current_value?.toString() || '',
        purchase_price: item.purchase_price?.toString() || '',
        description: item.description || '',
        price_alert_threshold: item.price_alert_threshold?.toString() || ''
    })
    const [isSaving, setIsSaving] = useState(false)

    const metadata = item.metadata || {}
    const isModified = metadata.is_manually_modified

    const formatPrice = (value: number | null) => {
        if (value === null) return '—'
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: currencyCode,
        })
    }

    const handleSave = async () => {
        setIsSaving(true)
        const result = await updateItem(item.id, {
            name: formData.name,
            current_value: formData.current_value ? parseFloat(formData.current_value) : null,
            purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
            description: formData.description,
            price_alert_threshold: formData.price_alert_threshold ? parseFloat(formData.price_alert_threshold) : null
        })

        if (result.success) {
            setIsEditing(false)
            router.refresh()
        } else {
            alert(`Failed to save changes: ${result.error}`)
        }
        setIsSaving(false)
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

    const handleRefresh = async () => {
        if (confirm('Refresh metadata from Brickset/BrickLink? This will update prices and details.')) {
            setIsSaving(true)
            try {
                const result = await refreshItemMetadata(item.id)
                if (result.error) {
                    alert(result.error)
                } else {
                    router.refresh()
                }
            } catch (e) {
                alert('Failed to refresh data')
            }
            setIsSaving(false)
        }
    }

    const [aiDescription, setAiDescription] = useState<string | null>(null)
    const [aiError, setAiError] = useState<string | null>(null)

    React.useEffect(() => {
        const fetchAI = async () => {
            if (item.name && !isEditing) {
                const ctx = `Item: ${item.name}, Year: ${item.metadata?.year || ''}, Theme: ${item.metadata?.theme || ''}`
                const res = await generateItemDescription(item.name, ctx)
                if (res.text) {
                    setAiDescription(res.text)
                } else if (res.error) {
                    setAiError(res.error)
                }
            }
        }
        fetchAI()
    }, [item.name, isEditing])

    const [layoutMode, setLayoutMode] = useState<'standard' | 'showcase'>('standard')

    // --- Layouts ---

    const StandardLayout = () => (
        <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)', maxWidth: '1200px' }}>
            {/* Standard Nav & Content... (Existing Code Structure) */}
            {/* Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                <button
                    onClick={() => router.back()}
                    className="btn btn-ghost"
                    style={{ paddingLeft: 0, color: 'var(--text-secondary)' }}
                >
                    <ArrowBackIcon style={{ fontSize: '18px', marginRight: 'var(--space-2)' }} />
                    Back
                </button>

                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    {/* View Switcher */}
                    <div style={{
                        background: 'var(--surface-secondary)',
                        padding: '4px',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        gap: '2px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <button
                            onClick={() => setLayoutMode('standard')}
                            style={{
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-full)',
                                background: layoutMode === 'standard' ? 'white' : 'transparent',
                                boxShadow: layoutMode === 'standard' ? 'var(--shadow-xs)' : 'none',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: layoutMode === 'standard' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                                transition: 'all 0.2s ease',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Standard
                        </button>
                        <button
                            onClick={() => setLayoutMode('showcase')}
                            style={{
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-full)',
                                background: layoutMode === 'showcase' ? 'var(--gray-800)' : 'transparent',
                                boxShadow: layoutMode === 'showcase' ? 'var(--shadow-xs)' : 'none',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: layoutMode === 'showcase' ? 'white' : 'var(--text-tertiary)',
                                transition: 'all 0.2s ease',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Showcase
                        </button>
                    </div>

                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-secondary"
                            style={{ gap: 'var(--space-2)' }}
                        >
                            <EditIcon style={{ fontSize: '18px' }} />
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="btn btn-ghost"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn btn-primary"
                                disabled={isSaving}
                                style={{ gap: 'var(--space-2)' }}
                            >
                                {isSaving ? '...' : <SaveIcon style={{ fontSize: '18px' }} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Hero Section (Standard) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: 'var(--space-12)',
                marginBottom: 'var(--space-12)',
                alignItems: 'start'
            }}>

                {/* Left: Enhanced Image Showcase */}
                <div style={{
                    background: 'white',
                    borderRadius: 'var(--radius-2xl)',
                    padding: 'var(--space-8)',
                    boxShadow: 'var(--shadow-lg)',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {item.image_url ? (
                        <img
                            src={item.image_url}
                            alt={item.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))',
                                transform: 'scale(1)',
                                transition: 'transform 0.5s ease'
                            }}
                            className="hover:scale-105"
                        />
                    ) : (
                        <div className="text-tertiary flex flex-col items-center opacity-50">
                            <ImageNotSupportedIcon style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }} />
                            <span>No Image Available</span>
                        </div>
                    )}
                </div>

                {/* Right: Product Info & Core Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

                    {/* Header: Badges & Title */}
                    <div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                            <span style={{
                                background: 'var(--surface-tertiary)',
                                color: 'var(--text-secondary)',
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase'
                            }}>
                                {item.external_id ? `SET #${item.external_id}` : 'ITEM'}
                            </span>
                            {isModified && (
                                <span style={{
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    color: 'var(--accent-warning)',
                                    padding: '6px 12px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    textTransform: 'uppercase'
                                }}>
                                    <EditIcon style={{ fontSize: '12px' }} />
                                    Manually Edited
                                </span>
                            )}
                        </div>

                        {isEditing ? (
                            <input
                                className="input"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, width: '100%' }}
                            />
                        ) : (
                            <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)' }}>
                                {item.name}
                            </h1>
                        )}
                    </div>

                    {/* Price Section */}
                    <div style={{ paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>Current Value</div>
                        {isEditing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-tertiary)' }}>$</span>
                                <input
                                    type="number"
                                    value={formData.current_value}
                                    onChange={e => setFormData({ ...formData, current_value: e.target.value })}
                                    className="input"
                                    style={{ fontSize: '2.5rem', fontWeight: 800, width: '200px' }}
                                />
                            </div>
                        ) : (
                            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                                {formatPrice(item.current_value)}
                            </div>
                        )}
                        {item.purchase_price && (
                            <div style={{ marginTop: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Purchased for <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatPrice(item.purchase_price)}</span>
                            </div>
                        )}
                    </div>

                    {/* AI Insight - Integrated text */}
                    {(aiDescription || aiError) && (
                        <div style={{
                            background: 'var(--surface-secondary)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-5)',
                            borderLeft: '4px solid var(--accent-primary)'
                        }}>
                            {aiError ? (
                                <div style={{ color: 'var(--accent-error)', fontSize: '0.9rem' }}>{aiError}</div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                        <AutoAwesomeIcon style={{ fontSize: '14px' }} />
                                        Fun Fact
                                    </div>
                                    <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                        "{aiDescription}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick Stats Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                        {metadata.year && (
                            <div style={{ flex: 1, minWidth: '80px' }}>
                                <div className="text-secondary text-xs uppercase font-bold text-tertiary mb-1">Year</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{metadata.year}</div>
                            </div>
                        )}
                        {metadata.num_parts > 0 && (
                            <div style={{ flex: 1, minWidth: '80px' }}>
                                <div className="text-secondary text-xs uppercase font-bold text-tertiary mb-1">Pieces</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{metadata.num_parts.toLocaleString('en-US')}</div>
                            </div>
                        )}
                        {metadata.theme && (
                            <div style={{ flex: 2, minWidth: '120px' }}>
                                <div className="text-secondary text-xs uppercase font-bold text-tertiary mb-1">Theme</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{metadata.theme}</div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Detailed Specifications via Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>

                {/* Specs Card */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Specifications</h3>
                        <button onClick={handleRefresh} disabled={isSaving} className="btn btn-ghost btn-sm text-xs">Refresh</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <div className="text-secondary text-xs uppercase font-bold text-tertiary">Set Number</div>
                            <div className="font-semibold">{item.external_id}</div>
                        </div>
                        <div>
                            <div className="text-secondary text-xs uppercase font-bold text-tertiary">PPP</div>
                            <div className="font-semibold">
                                {item.metadata?.rrp?.US
                                    ? `${((item.metadata.rrp.US / (item.metadata.num_parts || 1)) * 100).toFixed(1)}¢`
                                    : '--'
                                }
                            </div>
                        </div>
                        {item.metadata?.theme_group && (
                            <div>
                                <div className="text-secondary text-xs uppercase font-bold text-tertiary">Group</div>
                                <div className="font-semibold">{item.metadata.theme_group}</div>
                            </div>
                        )}
                        {item.metadata?.subtheme && (
                            <div>
                                <div className="text-secondary text-xs uppercase font-bold text-tertiary">Subtheme</div>
                                <div className="font-semibold">{item.metadata.subtheme}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Details / External */}
                <div className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Notes</h3>
                        {isEditing ? (
                            <textarea
                                className="input"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Notes..."
                                style={{ width: '100%', minHeight: '80px' }}
                            />
                        ) : (
                            <p className="text-secondary" style={{ fontStyle: item.description ? 'normal' : 'italic' }}>
                                {item.description || "No notes."}
                            </p>
                        )}
                    </div>

                    {item.external_id && (
                        <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
                            <a
                                href={`https://www.bricklink.com/v2/catalog/catalogitem.page?S=${item.external_id.replace('-1', '')}#T=P`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'space-between' }}
                            >
                                <span>BrickLink</span>
                                <span>↗</span>
                            </a >
                        </div >
                    )}
                </div>

            </div>
        </div>
    )

    const ShowcaseLayout = () => {
        // Futuristic Dark Mode Layout
        return (
            <div className="animate-fade-in" style={{
                background: '#09090b', // Deep rich black
                minHeight: '100vh',
                color: '#fafafa',
                fontFamily: "'Inter', sans-serif",
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Nav & Toggle (Overlay) */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px', display: 'flex', justifyContent: 'space-between', zIndex: 50 }}>
                    <button onClick={() => router.back()} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowBackIcon /> Back
                    </button>

                    <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '4px', borderRadius: '99px', display: 'flex', gap: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button onClick={() => setLayoutMode('standard')} style={{ padding: '6px 16px', borderRadius: '99px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.8rem' }}>Standard</button>
                        <button onClick={() => setLayoutMode('showcase')} style={{ padding: '6px 16px', borderRadius: '99px', border: 'none', background: 'white', color: 'black', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>Showcase</button>
                    </div>
                </div>

                {/* Hero Section */}
                <div style={{
                    height: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    background: 'radial-gradient(circle at center, #27272a 0%, #09090b 70%)'
                }}>
                    {/* Glowing Product Image */}
                    <div style={{
                        position: 'relative',
                        zIndex: 10,
                        width: '80%',
                        maxWidth: '800px',
                        transform: 'translateY(20px)',
                        animation: 'driveIn 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}>
                        {item.image_url && (
                            <img
                                src={item.image_url}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    filter: 'drop-shadow(0 50px 80px rgba(0,0,0,0.5))',
                                    transform: 'scale(1.1)'
                                }}
                            />
                        )}
                    </div>

                    {/* Text Overlay */}
                    <div style={{ position: 'absolute', bottom: '10%', textAlign: 'center', zIndex: 20 }}>
                        <h1 style={{
                            fontSize: '4rem',
                            fontWeight: 200,
                            letterSpacing: '-0.02em',
                            background: 'linear-gradient(to bottom, #fff, #a1a1aa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '16px'
                        }}>
                            {item.name}
                        </h1>
                        <p style={{ fontSize: '1.5rem', color: '#a1a1aa', fontWeight: 300 }}>
                            {formatPrice(item.current_value)}
                        </p>
                    </div>
                </div>

                {/* Feature Strip (Glassmorphism) */}
                <div style={{
                    padding: '80px 24px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    gap: '24px'
                }}>
                    {[
                        { label: 'Year', value: metadata.year || 'Unknown', icon: CalendarTodayIcon },
                        { label: 'Piece Count', value: metadata.num_parts?.toLocaleString() || '-', icon: AppsIcon },
                        { label: 'Theme', value: metadata.theme || '-', icon: PublicIcon },
                    ].map((stat, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(20px)',
                            padding: '32px',
                            borderRadius: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            transition: 'transform 0.3s ease',
                            cursor: 'default'
                        }} className="hover:bg-white/5 hover:scale-105">
                            <stat.icon style={{ fontSize: '32px', marginBottom: '16px', color: '#3b82f6' }} />
                            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '4px' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.875rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* AI Story Section */}
                {aiDescription && (
                    <div style={{ maxWidth: '800px', margin: '0 auto 100px', textAlign: 'center', padding: '0 24px' }}>
                        <AutoAwesomeIcon style={{ fontSize: '32px', color: '#3b82f6', marginBottom: '24px' }} />
                        <p style={{ fontSize: '1.5rem', lineHeight: 1.6, color: '#e4e4e7', fontStyle: 'italic', opacity: 0.9 }}>
                            “{aiDescription}”
                        </p>
                    </div>
                )}
            </div>
        )
    }

    return layoutMode === 'standard' ? <StandardLayout /> : <ShowcaseLayout />
}
