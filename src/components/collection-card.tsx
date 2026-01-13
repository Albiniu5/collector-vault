'use client'

import Link from 'next/link'
import FolderIcon from '@mui/icons-material/Folder'
import ExtensionIcon from '@mui/icons-material/Extension'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import AddIcon from '@mui/icons-material/Add'

interface CollectionCardProps {
    data?: any
    currency?: string
    variant?: 'default' | 'ghost'
    ghostType?: string
}

export function CollectionCard({ data, currency = 'USD', variant = 'default', ghostType }: CollectionCardProps) {

    // GHOST VARIANT
    if (variant === 'ghost') {
        const typeLabel = ghostType ? ghostType.charAt(0).toUpperCase() + ghostType.slice(1) : 'Collection'
        return (
            <Link
                href={`/?new=collection&type=${ghostType}`}
                className="card animate-fade-in-up group"
                style={{
                    background: 'var(--surface-primary)',
                    border: '1px dashed var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-8)',
                    cursor: 'pointer',
                    opacity: 0.8,
                    transition: 'all 0.2s',
                    minHeight: '260px',
                    textDecoration: 'none',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div style={{
                    width: '64px', height: '64px',
                    borderRadius: '50%',
                    background: 'var(--surface-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 'var(--space-4)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.2s',
                    color: 'var(--text-primary)'
                }} className="group-hover:scale-110">
                    <AddIcon style={{ fontSize: '32px' }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Add {typeLabel}</h3>
                <p className="text-secondary text-sm mt-2 text-center">Empty slot available</p>
            </Link>
        )
    }

    // REGULAR VARIANT
    if (!data) return null

    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(data.totalValue || 0)

    const getIcon = (type: string) => {
        const style = { color: '#FFFFFF' }
        switch (type?.toLowerCase()) {
            case 'lego': return <ExtensionIcon style={style} />
            case 'coins': return <MonetizationOnIcon style={style} />
            case 'books': return <MenuBookIcon style={style} />
            case 'antiques': return <HourglassEmptyIcon style={style} />
            default: return <Inventory2Icon style={style} />
        }
    }

    // UPDATED IMAGES - Proven IDs
    const getBackgroundImage = (type: string) => {
        switch (type?.toLowerCase()) {
            // Lego: Standard colorful bricks
            case 'lego': return 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&q=80&w=800'
            // Coins: Clear scattered coins
            case 'coins': return 'https://images.unsplash.com/photo-1574607383476-f517f26ba415?auto=format&fit=crop&q=80&w=800'
            // Books: Library shelves
            case 'books': return 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800'
            // Antiques: Pocket watch/Vintage
            case 'antiques': return 'https://images.unsplash.com/photo-1509226388665-24c6dd2ba4b6?auto=format&fit=crop&q=80&w=800'
            // Default: Abstract dark geometric
            default: return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'
        }
    }

    return (
        <Link href={`/collections/${data.id}`} className="group" style={{ textDecoration: 'none' }}>
            <div className="card animate-fade-in-up" style={{
                position: 'relative',
                border: 'none',
                padding: 0,
                overflow: 'hidden',
                height: '100%',
                minHeight: '260px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                borderRadius: '24px',
                backgroundColor: '#1a1a1a' // Fallback color if image loads slow/fails
            }}>
                {/* Background Image Layer */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${getBackgroundImage(data.type)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                        zIndex: 0
                    }}
                    className="group-hover:scale-110"
                />

                {/* Gradient Overlay - Adjusted for visibility */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    // Top is semi-transparent black (30%), Bottom is heavy black (85%) for text legibility
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.85) 100%)',
                    zIndex: 1
                }} />

                {/* Content Layer */}
                <div style={{ position: 'relative', padding: '24px', width: '100%', zIndex: 10 }}>

                    {/* Top Icon Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '-160px', // Adjusted to correspond to card height
                        left: '24px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(8px)',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        {getIcon(data.type)}
                        <span style={{
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}>
                            {data.type}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        marginBottom: '4px',
                        lineHeight: 1.2,
                        color: '#FFFFFF', // Hardcoded White
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        {data.name}
                    </h3>

                    <div className="flex items-end gap-2 mb-6">
                        <span style={{ color: '#FFFFFF', fontSize: '1.5rem', fontWeight: 700 }}>
                            {data.itemCount}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase' }}>
                            items
                        </span>
                    </div>

                    {/* Value Badge */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div>
                            <div style={{
                                fontSize: '0.65rem',
                                textTransform: 'uppercase',
                                fontWeight: 700,
                                color: 'rgba(255,255,255,0.6)',
                                letterSpacing: '0.05em',
                                marginBottom: '2px'
                            }}>
                                Est. Value
                            </div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF' }}>{formattedValue}</div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
