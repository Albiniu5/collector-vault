'use client'

import { useState, useEffect, useRef } from 'react'
import { lookupItem, addItem } from '@/app/items/actions'
import { useRouter } from 'next/navigation'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import checkIcon from '@mui/icons-material/Check'
import CircularProgress from '@mui/material/CircularProgress'
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export function AddItemModal({ collectionId, collectionType, currencyCode = 'USD' }: { collectionId: string, collectionType: string, currencyCode?: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [preview, setPreview] = useState<any>(null)
    const [error, setError] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    const [price, setPrice] = useState<string>('')

    // Live Search Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 3 && isOpen) {
                handleSearch(undefined, query)
            }
        }, 500)

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
        formData.append('type', collectionType === 'lego' ? 'lego' : 'generic')
        formData.append('query', searchQuery)

        try {
            const res = await lookupItem(formData)
            if (res.error) {
                setError(res.error)
            } else {
                setPreview(res.data)
                // Set initial price if available
                if (res.data.price_estimate !== undefined && res.data.price_estimate !== null) {
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
                setIsOpen(false)
                setIsSuccess(false)
                setPreview(null)
                setQuery('')
                setPrice('')
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
                className="backdrop-enter"
                onClick={() => setIsOpen(false)}
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)'
                }}
            />

            {/* Drawer */}
            <div
                className="drawer-enter"
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    maxWidth: '500px',
                    background: 'var(--surface-primary)',
                    boxShadow: 'var(--shadow-2xl)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: 'var(--space-6)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Add to Collection</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="btn btn-ghost btn-icon"
                        style={{ borderRadius: 'var(--radius-full)' }}
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: 'var(--space-6)', overflowY: 'auto' }}>

                    {/* Search Field */}
                    <form onSubmit={handleSearch} style={{ marginBottom: 'var(--space-8)' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: 'var(--space-3)',
                            color: 'var(--text-secondary)'
                        }}>
                            {collectionType === 'lego' ? 'ENTER SET NUMBER' : 'SEARCH ITEM NAME'}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                ref={inputRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={collectionType === 'lego' ? "Search Set No. (e.g. 42056)" : "Search Item Name..."}
                                className="input-premium"
                                style={{
                                    height: '56px',
                                    fontSize: '1rem',
                                    paddingLeft: 'var(--space-4)',
                                    borderRadius: '12px',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                right: 'var(--space-4)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-tertiary)'
                            }}>
                                {isSearching ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    <SearchIcon style={{ cursor: 'pointer' }} onClick={() => handleSearch()} />
                                )}
                            </div>
                        </div>
                        {error && (
                            <p style={{ color: 'var(--accent-error)', marginTop: 'var(--space-2)', fontSize: '0.875rem' }}>
                                {error}
                            </p>
                        )}
                    </form>

                    {/* Result Card */}
                    {preview && (
                        <div className="card animate-fade-in" style={{
                            border: '1px solid var(--border-color)',
                            background: 'var(--surface-secondary)',
                            padding: 0,
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: 'var(--space-8)',
                                display: 'flex',
                                justifyContent: 'center',
                                background: 'var(--surface-primary)',
                                borderBottom: '1px solid var(--border-color)'
                            }}>
                                {preview.image_url || preview.set_img_url ? (
                                    <img
                                        src={preview.image_url || preview.set_img_url}
                                        alt={preview.name}
                                        style={{
                                            maxHeight: '200px',
                                            maxWidth: '100%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        height: '150px',
                                        width: '150px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--surface-tertiary)',
                                        borderRadius: 'var(--radius-lg)'
                                    }}>
                                        <ImageNotSupportedIcon style={{ fontSize: '48px', color: 'var(--text-tertiary)' }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: 'var(--space-6)' }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>
                                    {preview.name}
                                </h3>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 'var(--space-4)',
                                    marginBottom: 'var(--space-6)'
                                }}>
                                    <div>
                                        <div className="text-secondary text-xs uppercase" style={{ marginBottom: '4px' }}>Year</div>
                                        <div className="font-semibold">{preview.year || 'Unknown'}</div>
                                    </div>
                                    {preview.num_parts > 0 && (
                                        <div>
                                            <div className="text-secondary text-xs uppercase" style={{ marginBottom: '4px' }}>Parts</div>
                                            <div className="font-semibold">{preview.num_parts}</div>
                                        </div>
                                    )}
                                    {preview.country && (
                                        <div>
                                            <div className="text-secondary text-xs uppercase" style={{ marginBottom: '4px' }}>Country</div>
                                            <div className="font-semibold">{preview.country}</div>
                                        </div>
                                    )}
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label className="text-secondary text-xs uppercase" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                Estimated Value
                                                {preview.price_source === 'bricklink' && (
                                                    <span style={{
                                                        background: 'var(--accent-success)',
                                                        color: '#fff',
                                                        fontSize: '0.6rem',
                                                        padding: '1px 4px',
                                                        borderRadius: '4px',
                                                        fontWeight: 700
                                                    }}>
                                                        VERIFIED
                                                    </span>
                                                )}
                                            </label>

                                            {/* BrickLink Link */}
                                            {collectionType === 'lego' && preview.set_num && (
                                                <a
                                                    href={`https://www.bricklink.com/v2/catalog/catalogitem.page?S=${preview.set_num.replace('-1', '')}#T=P`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs hover:text-white flex items-center gap-1"
                                                    style={{
                                                        color: 'var(--accent-primary)',
                                                        textDecoration: 'none',
                                                        fontWeight: 500,
                                                        transition: 'color 0.2s'
                                                    }}
                                                >
                                                    Check BrickLink ↗
                                                </a>
                                            )}
                                        </div>

                                        {/* Condition Toggle */}
                                        {preview.price_source === 'bricklink' && (
                                            <div style={{
                                                display: 'flex',
                                                background: 'var(--surface-tertiary)',
                                                padding: '2px',
                                                borderRadius: '6px',
                                                marginBottom: '8px',
                                                width: 'fit-content'
                                            }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const p = preview.price_new || 0
                                                        setPrice(p.toString())
                                                    }}
                                                    style={{
                                                        padding: '4px 12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        borderRadius: '4px',
                                                        background: parseFloat(price) === (preview.price_new || 0) ? 'var(--surface-primary)' : 'transparent',
                                                        color: parseFloat(price) === (preview.price_new || 0) ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                        boxShadow: parseFloat(price) === (preview.price_new || 0) ? 'var(--shadow-sm)' : 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    New
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const p = preview.price_used || 0
                                                        setPrice(p.toString())
                                                    }}
                                                    style={{
                                                        padding: '4px 12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        borderRadius: '4px',
                                                        background: parseFloat(price) === (preview.price_used || 0) ? 'var(--surface-primary)' : 'transparent',
                                                        color: parseFloat(price) === (preview.price_used || 0) ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                        boxShadow: parseFloat(price) === (preview.price_used || 0) ? 'var(--shadow-sm)' : 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    Used
                                                </button>
                                            </div>
                                        )}

                                        {/* Styled Price Display/Input */}
                                        {preview.price_source === 'bricklink' ? (
                                            <div style={{
                                                fontSize: '1.5rem',
                                                fontWeight: 700,
                                                color: 'var(--text-primary)',
                                                padding: 'var(--space-2) 0',
                                                borderBottom: '1px solid var(--border-color)',
                                                marginBottom: 'var(--space-2)'
                                            }}>
                                                {parseFloat(price).toLocaleString('en-US', { style: 'currency', currency: currencyCode })}
                                            </div>
                                        ) : (
                                            <input
                                                type="number"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                placeholder="0.00"
                                                className="input-premium"
                                                style={{
                                                    padding: 'var(--space-2) var(--space-4)',
                                                    fontSize: '1rem',
                                                }}
                                            />
                                        )}

                                        <p className="text-xs text-tertiary mt-2">
                                            {preview.price_source === 'bricklink'
                                                ? `*Avg 6-month sales by Qty (${parseFloat(price) === (preview.price_new || 0) ? 'New' : 'Used'})`
                                                : '*Estimate based on part count, year, and theme.'}
                                        </p>
                                    </div>
                                </div>

                                {isSuccess ? (
                                    <button
                                        className="btn"
                                        style={{
                                            width: '100%',
                                            background: 'var(--accent-success)',
                                            color: 'white',
                                            justifyContent: 'center'
                                        }}
                                        disabled
                                    >
                                        <CheckCircleIcon style={{ marginRight: '8px' }} />
                                        Added to Collection
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAdd}
                                        className="btn btn-primary"
                                        style={{ width: '100%', justifyContent: 'center' }}
                                    >
                                        <AddIcon style={{ marginRight: '8px' }} />
                                        {preview && preview.num_parts > 0
                                            ? `Add Item • ${preview.num_parts.toLocaleString()} pcs`
                                            : 'Add Item'
                                        }
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
