'use client'

import { useState, useEffect, useRef } from 'react'
import { lookupItem, addItem } from '@/app/items/actions'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import CircularProgress from '@mui/material/CircularProgress'
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export function AddItemModal({ collectionId, collectionType, currencyCode = 'USD' }: { collectionId: string, collectionType: string, currencyCode?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isVisible, setIsVisible] = useState(false) // For animation state
    const [query, setQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [preview, setPreview] = useState<any>(null)
    const [error, setError] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // Animation Logic
    useEffect(() => {
        if (isOpen) {
            // Small delay to allow render before transitioning in
            requestAnimationFrame(() => setIsVisible(true))
            if (inputRef.current) setTimeout(() => inputRef.current?.focus(), 300)
        } else {
            setIsVisible(false)
        }
    }, [isOpen])

    const searchParams = useSearchParams()
    useEffect(() => {
        if (searchParams.get('action') === 'add') {
            // Remove the param so it doesn't re-open on refresh
            const url = new URL(window.location.href)
            url.searchParams.delete('action')
            window.history.replaceState({}, '', url.toString())

            setIsOpen(true)
        }
    }, [searchParams])

    const close = () => {
        setIsVisible(false)
        setTimeout(() => {
            setIsOpen(false)
            setQuery('')
            setPreview(null)
            setError('')
            setIsSuccess(false)
        }, 300) // Match transition duration
    }

    const [price, setPrice] = useState<string>('')

    // Live Search Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 3 && isOpen) {
                handleSearch(undefined, query)
            }
        }, 600) // Slightly longer bounce for smoother feel

        return () => clearTimeout(timer)
    }, [query, isOpen])

    const handleSearch = async (e?: React.FormEvent, searchQuery: string = query) => {
        e?.preventDefault()
        if (!searchQuery.trim()) return

        setIsSearching(true)
        setError('')
        setPreview(null)
        setPrice('')

        const formData = new FormData()
        formData.append('type', collectionType)
        formData.append('query', searchQuery)

        try {
            const res = await lookupItem(formData)
            if (res.error) {
                setError(res.error)
            } else {
                setPreview(res.data)
                // Set initial price if available
                if (res.data && 'price_estimate' in res.data && res.data.price_estimate) {
                    setPrice(res.data.price_estimate.toString())
                }
            }
        } catch (err) {
            setError('Failed to search. Please try again.')
        } finally {
            setIsSearching(false)
        }
    }

    const handleAdd = async () => {
        if (!preview) return

        // Include the user-edited price
        const itemWithPrice = {
            ...preview,
            current_value: price ? parseFloat(price) : null
        }

        const res = await addItem(collectionId, itemWithPrice)

        if (res?.error) {
            setError(res.error)
        } else {
            setIsSuccess(true)
            router.refresh()

            // Close after success animation
            setTimeout(() => {
                close()
            }, 1000)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-primary"
                style={{
                    borderRadius: 'var(--radius-full)',
                    padding: 'var(--space-3) var(--space-5)',
                    boxShadow: 'var(--shadow-lg)'
                }}
            >
                <AddIcon style={{ fontSize: '20px' }} />
                <span style={{ fontWeight: 600 }}>Add Item</span>
            </button>
        )
    }

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
            {/* Backdrop */}
            <div
                onClick={close}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.3s ease-out'
                }}
            />

            {/* Drawer */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    maxWidth: '550px',
                    background: 'var(--surface-primary)',
                    boxShadow: 'var(--shadow-2xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: 'var(--space-8)',
                    paddingBottom: '0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-6)'
                }}>
                    <div>
                        <div className="text-secondary text-xs uppercase font-bold tracking-wider mb-2">New Entry</div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>Add to Collection</h2>
                    </div>
                    <button
                        onClick={close}
                        className="btn btn-ghost btn-icon"
                        style={{ borderRadius: 'var(--radius-full)', width: '48px', height: '48px' }}
                    >
                        <CloseIcon style={{ fontSize: '24px' }} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: 'var(--space-8)', overflowY: 'auto' }}>

                    {/* Search Field */}
                    <form onSubmit={handleSearch} style={{ marginBottom: 'var(--space-8)', marginTop: 'var(--space-2)' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={collectionType === 'lego' ? "Type Set Number (e.g. 75192)" : "Search by Name..."}
                                className="input-premium"
                                style={{
                                    height: '72px',
                                    fontSize: '1.25rem',
                                    paddingLeft: 'var(--space-6)',
                                    borderRadius: '24px',
                                    boxShadow: 'var(--shadow-lg)',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--surface-secondary)'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                right: 'var(--space-6)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: isSearching ? 'var(--accent-primary)' : 'var(--text-tertiary)'
                            }}>
                                {isSearching ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    <SearchIcon style={{ fontSize: '28px' }} />
                                )}
                            </div>
                        </div>
                        {error && (
                            <div className="animate-fade-in" style={{
                                marginTop: 'var(--space-4)',
                                padding: 'var(--space-3) var(--space-4)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--accent-error)',
                                borderRadius: '12px',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <CloseIcon style={{ fontSize: '16px' }} />
                                {error}
                            </div>
                        )}
                    </form>

                    {/* Result Card */}
                    {preview && (
                        <div className="card animate-fade-in-up" style={{
                            border: 'none',
                            background: 'var(--surface-secondary)',
                            padding: 0,
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-xl)'
                        }}>
                            {/* Image Header */}
                            <div style={{
                                height: '240px',
                                position: 'relative',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 'var(--space-8)'
                            }}>
                                {preview.image_url || preview.set_img_url ? (
                                    <img
                                        src={preview.image_url || preview.set_img_url}
                                        alt={preview.name}
                                        style={{
                                            maxHeight: '100%',
                                            maxWidth: '100%',
                                            objectFit: 'contain',
                                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))'
                                        }}
                                    />
                                ) : (
                                    <div style={{ color: 'var(--text-tertiary)', textAlign: 'center' }}>
                                        <ImageNotSupportedIcon style={{ fontSize: '48px', marginBottom: '8px' }} />
                                        <div className="text-sm">No Preview Image</div>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: 'var(--space-6)' }}>
                                <div className="text-secondary text-xs uppercase font-bold mb-2">
                                    {preview.year ? `${preview.year} • ` : ''}
                                    {preview.num_parts ? `${preview.num_parts} Parts` : ''}
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--space-6)', lineHeight: 1.2 }}>
                                    {preview.name}
                                </h3>

                                {/* Condition & Price */}
                                <div style={{ marginBottom: 'var(--space-8)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <label className="text-secondary text-xs uppercase font-bold">Estimated Value</label>
                                        {preview.price_source === 'bricklink' && (
                                            <div style={{ display: 'flex', background: 'var(--surface-tertiary)', borderRadius: '8px', padding: '2px' }}>
                                                {['New', 'Used'].map((cond) => {
                                                    const targetPrice = cond === 'New' ? (preview.price_new || 0) : (preview.price_used || 0)
                                                    const isActive = Math.abs(parseFloat(price || '0') - targetPrice) < 0.01;

                                                    return (
                                                        <button
                                                            key={cond}
                                                            onClick={() => setPrice(targetPrice.toString())}
                                                            style={{
                                                                padding: '4px 12px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 700,
                                                                borderRadius: '6px',
                                                                border: 'none',
                                                                background: isActive ? 'var(--surface-primary)' : 'transparent',
                                                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {cond}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>$</span>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="0.00"
                                            className="input-premium"
                                            style={{
                                                paddingLeft: '32px',
                                                fontSize: '1.5rem',
                                                fontWeight: 700,
                                                height: '64px'
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-tertiary mt-2">
                                        {preview.price_source === 'bricklink'
                                            ? "Source: BrickLink 6-month Sales Avg"
                                            : "Value estimated from similar items"}
                                    </p>
                                </div>

                                <button
                                    onClick={handleAdd}
                                    className="btn btn-primary"
                                    disabled={isSuccess}
                                    style={{
                                        width: '100%',
                                        height: '56px',
                                        justifyContent: 'center',
                                        fontSize: '1.125rem',
                                        background: isSuccess ? 'var(--accent-success)' : 'var(--accent-primary)',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {isSuccess ? (
                                        <>
                                            <CheckCircleIcon style={{ marginRight: '8px' }} />
                                            Added Successfully
                                        </>
                                    ) : (
                                        <>
                                            <AddIcon style={{ marginRight: '8px' }} />
                                            Add to Collection
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
