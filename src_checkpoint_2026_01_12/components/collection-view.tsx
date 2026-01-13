'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AddItemModal } from './add-item-modal'
import { deleteItems, deleteLastAdded } from '@/app/items/delete-actions'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Link from 'next/link'

interface Item {
    id: string
    name: string
    image_url: string | null
    purchase_price: number | null
    current_value: number | null
    external_id: string | null
    created_at: string
}

interface Collection {
    id: string
    name: string
    type: string
    description: string | null
}

export function CollectionView({ collection, items, currencyCode }: { collection: Collection, items: Item[], currencyCode: string }) {
    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode)
        setSelectedIds(new Set())
    }

    const toggleSelectAll = () => {
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(items.map(item => item.id)))
        }
    }

    const handleDeleteSelected = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} items?`)) return

        setIsDeleting(true)
        const result = await deleteItems(Array.from(selectedIds))

        if (result.success) {
            setSelectedIds(new Set())
            setIsSelectionMode(false)
            router.refresh()
        } else {
            alert('Failed to delete items')
        }
        setIsDeleting(false)
    }

    const handleDeleteLast = async () => {
        if (!confirm('Delete the most recently added item?')) return

        setIsDeleting(true)
        const result = await deleteLastAdded(collection.id)

        if (result.success) {
            router.refresh()
        } else {
            alert('Failed to delete item')
        }
        setIsDeleting(false)
    }

    const totalValue = items.reduce((acc, item) => acc + (item.current_value ?? item.purchase_price ?? 0), 0)

    const formatPrice = (value: number) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    return (
        <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
            {/* Header */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <Link href="/" className="btn btn-ghost" style={{ marginBottom: 'var(--space-4)', paddingLeft: 0 }}>
                    <ArrowBackIcon style={{ fontSize: '18px', marginRight: 'var(--space-2)' }} />
                    Back to Dashboard
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: 'var(--space-1) var(--space-3)',
                            background: 'var(--surface-tertiary)',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: 'var(--space-3)',
                            color: 'var(--text-secondary)'
                        }}>
                            {collection.type}
                        </div>
                        <h1 style={{ marginBottom: 'var(--space-2)' }}>{collection.name}</h1>
                        <p className="text-secondary" style={{ maxWidth: '600px' }}>
                            {collection.description || 'No description provided'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div className="text-sm text-secondary">Total Value</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {formatPrice(totalValue)}
                            </div>
                        </div>
                        <AddItemModal collectionId={collection.id} collectionType={collection.type} currencyCode={currencyCode} />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            {items.length > 0 && (
                <div className="card" style={{
                    padding: 'var(--space-3) var(--space-4)',
                    marginBottom: 'var(--space-6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 'var(--space-4)',
                    zIndex: 10,
                    background: 'var(--surface-primary)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                        <button
                            onClick={toggleSelectionMode}
                            className={`btn ${isSelectionMode ? 'btn-ghost' : 'btn-secondary'}`}
                            style={{ fontWeight: 600 }}
                        >
                            {isSelectionMode ? 'Cancel' : 'Select Items'}
                        </button>

                        {isSelectionMode && (
                            <>
                                <button
                                    onClick={toggleSelectAll}
                                    className="btn btn-ghost"
                                >
                                    {selectedIds.size === items.length ? 'Deselect All' : 'Select All'}
                                </button>
                                <span className="text-sm font-medium border-l border-[var(--border-color)] pl-4">
                                    {selectedIds.size} selected
                                </span>
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {isSelectionMode ? (
                            <button
                                onClick={handleDeleteSelected}
                                disabled={selectedIds.size === 0 || isDeleting}
                                className="btn"
                                style={{
                                    background: 'var(--accent-error)',
                                    color: 'white',
                                    opacity: selectedIds.size === 0 ? 0.5 : 1
                                }}
                            >
                                <DeleteOutlineIcon style={{ fontSize: '20px', marginRight: 'var(--space-1)' }} />
                                Delete ({selectedIds.size})
                            </button>
                        ) : (
                            <button
                                onClick={handleDeleteLast}
                                disabled={isDeleting}
                                className="btn btn-ghost"
                                style={{ fontSize: '0.8125rem', color: 'var(--accent-error)' }}
                            >
                                Delete Last Added
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Grid */}
            {items.length > 0 ? (
                <div className="grid grid-4">
                    {items.map((item) => (
                        <div key={item.id} className="card card-interactive" style={{
                            padding: 0,
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'pointer',
                            border: isSelectionMode && selectedIds.has(item.id) ? '2px solid var(--accent-primary)' : undefined
                        }}
                            onClick={() => {
                                if (isSelectionMode) {
                                    toggleSelection(item.id)
                                } else {
                                    router.push(`/items/${item.id}`)
                                }
                            }}
                        >
                            {/* Checkbox Overlay */}
                            {isSelectionMode && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'var(--space-2)',
                                    left: 'var(--space-2)',
                                    zIndex: 2,
                                    background: 'var(--surface-primary)',
                                    borderRadius: '4px',
                                    display: 'flex'
                                }}>
                                    {selectedIds.has(item.id) ?
                                        <CheckBoxIcon style={{ color: 'var(--accent-primary)' }} /> :
                                        <CheckBoxOutlineBlankIcon style={{ color: 'var(--text-tertiary)' }} />
                                    }
                                </div>
                            )}

                            {/* Image */}
                            <div style={{
                                aspectRatio: '1',
                                background: 'var(--surface-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderBottom: '1px solid var(--border-color)'
                            }}>
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 'var(--space-4)' }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-tertiary)' }}>
                                        <ImageNotSupportedIcon style={{ fontSize: '32px', marginBottom: 'var(--space-2)' }} />
                                        <span className="text-xs">No Image</span>
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div style={{ padding: 'var(--space-4)' }}>
                                <h3 style={{
                                    fontSize: '1rem',
                                    marginBottom: 'var(--space-1)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {item.name}
                                </h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="text-xs text-tertiary">{item.external_id || '# --'}</span>
                                    <span className="font-semibold" style={{ color: 'var(--accent-success)' }}>
                                        {item.current_value !== null ?
                                            formatPrice(item.current_value) :
                                            item.purchase_price !== null ?
                                                formatPrice(item.purchase_price) :
                                                '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: 'var(--space-20) var(--space-4)',
                    background: 'var(--surface-secondary)',
                    borderRadius: 'var(--radius-xl)',
                    border: '2px dashed var(--border-color)'
                }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>No items yet</h3>
                    <p className="text-secondary" style={{ marginBottom: 'var(--space-6)' }}>Start building your collection by adding items.</p>
                    <AddItemModal collectionId={collection.id} collectionType={collection.type} currencyCode={currencyCode} />
                </div>
            )
            }
        </div >
    )
}
