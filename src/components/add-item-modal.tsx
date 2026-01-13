'use client'

import { useState, useEffect, useRef } from 'react'
import { lookupItem, addItem, lookupCoinDetails } from '@/app/items/actions'
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
    const [results, setResults] = useState<any[]>([]) // For multi-result layout
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

    const [showAdvanced, setShowAdvanced] = useState(false)
    const [advancedFields, setAdvancedFields] = useState({
        country: '',
        year: '',
        material: '',
        mintmark: ''
    })

    const handleSearch = async (e?: React.FormEvent, searchQuery: string = query) => {
        e?.preventDefault()

        // Build effective query
        let effectiveQuery = searchQuery
        if (showAdvanced && collectionType === 'coins') {
            const parts = [
                advancedFields.country,
                advancedFields.year,
                advancedFields.material,
                advancedFields.mintmark,
                searchQuery
            ].filter(Boolean)
            effectiveQuery = parts.join(' ')
        }

        if (!effectiveQuery.trim()) return

        setIsSearching(true)
        setError('')
        setPreview(null)
        setResults([]) // Reset previous results
        setPrice('')

        const formData = new FormData()
        formData.append('type', collectionType)
        formData.append('query', effectiveQuery) // Send the combined query
        // We could send individual fields if the backend supported precise filtering, 
        // but constructing a strong query string is often better for Numista's text search.

        try {
            const res = await lookupItem(formData)
            if (res.error) {
                setError(res.error)
            } else if (res.results) {
                // New Path: Multiple Results Found
                setResults(res.results)
            } else {
                // Classic Path: Single Result (e.g. Lego / fallback)
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

    const openFullSearch = () => {
        const params = new URLSearchParams()
        params.set('q', query)
        params.set('type', collectionType)
        params.set('collectionId', collectionId)
        close()
        router.push(`/search?${params.toString()}`)
    }

    const selectResult = async (numistaId: number) => {
        setIsSearching(true)
        const res = await lookupCoinDetails(numistaId)
        setIsSearching(false)

        if (res.error) {
            setError(res.error)
        } else {
            setResults([]) // Clear list to show preview
            setPreview(res.data)
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
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
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
                                        background: 'var(--surface-secondary)',
                                        color: 'var(--text-primary)',
                                        width: '100%'
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

                            <button
                                type="button"
                                onClick={openFullSearch}
                                title="Open Full Page Search"
                                className="btn btn-secondary hover-scale"
                                style={{
                                    height: '72px',
                                    width: '72px',
                                    borderRadius: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: 'var(--shadow-lg)'
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>⤢</span>
                            </button>
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

                    {/* Advanced Search Toggle (Coins Only) */}
                    {collectionType === 'coins' && (
                        <div className="mb-6 px-2">
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="text-secondary text-xs uppercase font-bold tracking-wider hover:text-primary transition-colors flex items-center gap-1"
                            >
                                {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                                <span style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                            </button>

                            {/* Advanced Fields Grid */}
                            {showAdvanced && (
                                <div className="grid grid-cols-2 gap-3 mt-3 animate-fade-in-down">
                                    <input
                                        placeholder="Country (e.g. USA)"
                                        value={advancedFields.country}
                                        onChange={e => setAdvancedFields(prev => ({ ...prev, country: e.target.value }))}
                                        style={{
                                            background: 'var(--surface-secondary)',
                                            border: '1px solid var(--border-color)',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <input
                                        placeholder="Year (e.g. 1965)"
                                        value={advancedFields.year}
                                        onChange={e => setAdvancedFields(prev => ({ ...prev, year: e.target.value }))}
                                        style={{
                                            background: 'var(--surface-secondary)',
                                            border: '1px solid var(--border-color)',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <input
                                        placeholder="Material (e.g. Silver)"
                                        value={advancedFields.material}
                                        onChange={e => setAdvancedFields(prev => ({ ...prev, material: e.target.value }))}
                                        style={{
                                            background: 'var(--surface-secondary)',
                                            border: '1px solid var(--border-color)',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <input
                                        placeholder="Mintmark (e.g. D)"
                                        value={advancedFields.mintmark}
                                        onChange={e => setAdvancedFields(prev => ({ ...prev, mintmark: e.target.value }))}
                                        style={{
                                            background: 'var(--surface-secondary)',
                                            border: '1px solid var(--border-color)',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Multiple Results Grid */}
                    {results.length > 0 && !preview && (
                        <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', minHeight: 0 }}>
                            <h3 className="text-secondary text-xs uppercase font-bold tracking-wider mb-3 px-2 flex-shrink-0">
                                Found {results.length} Matches
                            </h3>
                            <div className="grid grid-cols-2 gap-3" style={{
                                overflowY: 'auto',
                                paddingRight: '4px',
                                paddingBottom: '20px',
                                flex: 1 // Fill remaining space
                            }}>
                                {results.map((item) => (
                                    <div
                                        key={item.numista_id}
                                        onClick={() => selectResult(item.numista_id)}
                                        className="card hover-scale"
                                        style={{
                                            padding: '12px',
                                            cursor: 'pointer',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--surface-secondary)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            gap: '8px',
                                            height: 'fit-content' // Don't stretch vertically
                                        }}
                                    >
                                        <div style={{
                                            width: '60px', height: '60px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            background: 'var(--surface-tertiary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div className="text-xs text-secondary">No Img</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm line-clamp-2 leading-tight" style={{ color: 'var(--text-primary)' }}>{item.name}</div>
                                            <div className="text-xs text-secondary mt-1">{item.country} • {item.year}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Result Card (Single Preview) */}
                    {preview && (
                        <div className="card animate-fade-in-up" style={{
                            border: 'none',
                            background: 'var(--surface-secondary)',
                            padding: 0,
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-xl)'
                        }}>
                            {/* Error Message */}
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
                                            readOnly
                                            disabled
                                            className="input-premium"
                                            style={{
                                                paddingLeft: '32px',
                                                fontSize: '1.5rem',
                                                fontWeight: 700,
                                                height: '64px',
                                                background: 'var(--surface-tertiary)',
                                                cursor: 'not-allowed',
                                                opacity: 0.8,
                                                color: 'var(--text-secondary)'
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
