'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AddItemModal } from './add-item-modal'
import { FilterBar } from './filter-bar'
import { deleteItems, deleteLastAdded } from '@/app/items/delete-actions'
import { updateCollection } from '@/app/collections/actions'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import Link from 'next/link'
import { DeleteCollectionButton } from './delete-collection-button'
import { ImageUpload } from './image-upload'

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
    image_url?: string | null
}

export function CollectionView({ collection, items, currencyCode }: { collection: Collection, items: Item[], currencyCode: string }) {
    const router = useRouter()
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isSelectionMode, setIsSelectionMode] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortOption, setSortOption] = useState('newest')
    const [filters, setFilters] = useState<{ condition: string }>({ condition: 'all' })
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Editing State
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState(collection.name)
    const [editDescription, setEditDescription] = useState(collection.description || '')
    const [editImageUrl, setEditImageUrl] = useState(collection.image_url || '')
    const [isSaving, setIsSaving] = useState(false)

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

    const handleSaveCollection = async () => {
        if (!editName.trim()) return
        setIsSaving(true)
        const res = await updateCollection(collection.id, {
            name: editName,
            description: editDescription,
            image_url: editImageUrl
        })
        if (res.success) {
            setIsEditing(false)
            router.refresh()
        } else {
            alert(res.message)
        }
        setIsSaving(false)
    }

    // --- Filter & Sort Logic ---
    let processedItems = [...items]

    // 1. Filter by Search
    if (searchQuery) {
        const q = searchQuery.toLowerCase()
        processedItems = processedItems.filter(item =>
            item.name.toLowerCase().includes(q) ||
            item.external_id?.toLowerCase().includes(q)
        )
    }

    // 2. Filter by Attributes (Condition example, expands in future)
    if (filters.condition !== 'all') {
        // (Assuming metadata is passed or we can filter later, for now we kept Item simple,
        //  but we can add logic if we pass metadata in items later.
        //  For this step, we just prepare the structure.)
    }

    // 3. Sort
    processedItems.sort((a, b) => {
        switch (sortOption) {
            case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            case 'value_high': return (b.current_value || 0) - (a.current_value || 0)
            case 'value_low': return (a.current_value || 0) - (b.current_value || 0)
            // Note: Year sorting requires metadata which we might want to expose on Item interface
            default: return 0
        }
    })

    // --- Duplicate Detection ---
    const duplicateIds = new Set<string>()
    const seenMap = new Map<string, string>() // key -> id

    processedItems.forEach(item => {
        // Key is external_id (e.g. Set Num) or Name if no external ID
        const key = item.external_id ? `EXT:${item.external_id}` : `NAME:${item.name.toLowerCase().trim()}`

        if (seenMap.has(key)) {
            duplicateIds.add(item.id)
            duplicateIds.add(seenMap.get(key)!) // Mark the first one as duplicate too
        } else {
            seenMap.set(key, item.id)
        }
    })


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
        <div className="container animate-fade-in" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
            {/* Header */}
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <Link href="/" className="btn btn-ghost" style={{ marginBottom: 'var(--space-4)', paddingLeft: 0 }}>
                    <ArrowBackIcon style={{ fontSize: '18px', marginRight: 'var(--space-2)' }} />
                    Back to Dashboard
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
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

                        {/* Title & Description Editing */}
                        {isEditing ? (
                            <div className="animate-fade-in card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-2)', maxWidth: '600px', border: '1px solid var(--accent-primary)' }}>
                                <label className="text-xs font-bold uppercase text-secondary mb-1 block">Collection Name</label>
                                <input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="input"
                                    placeholder="Collection Name"
                                    style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 'var(--space-3)', width: '100%' }}
                                    autoFocus
                                />
                                <label className="text-xs font-bold uppercase text-secondary mb-1 block">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    className="input"
                                    placeholder="Add a description for your collection..."
                                    style={{ width: '100%', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                                />
                                <label className="text-xs font-bold uppercase text-secondary mb-1 block" style={{ marginTop: 'var(--space-3)' }}>Cover Image (Upload or URL)</label>
                                <ImageUpload
                                    value={editImageUrl}
                                    onChange={setEditImageUrl}
                                />
                                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)', justifyContent: 'flex-end' }}>
                                    <button onClick={() => setIsEditing(false)} disabled={isSaving} className="btn btn-ghost btn-sm">
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveCollection} disabled={isSaving} className="btn btn-primary btn-sm">
                                        <SaveIcon style={{ fontSize: '16px', marginRight: '4px' }} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="group relative">
                                <h1 style={{ marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    {collection.name}
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn-icon btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Edit Details"
                                        style={{ width: '32px', height: '32px' }}
                                    >
                                        <EditIcon style={{ fontSize: '18px' }} />
                                    </button>
                                </h1>
                                <p className="text-secondary" style={{ maxWidth: '600px', lineHeight: 1.6 }}>
                                    {collection.description || <span className="italic text-tertiary">No description provided</span>}
                                </p>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div className="text-sm text-secondary">Total Value</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {formatPrice(totalValue)}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                            <AddItemModal collectionId={collection.id} collectionType={collection.type} currencyCode={currencyCode} />
                            <DeleteCollectionButton collectionId={collection.id} collectionName={collection.name} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
                onSearch={setSearchQuery}
                onSortChange={setSortOption}
                onFilterChange={(type, val) => setFilters(prev => ({ ...prev, [type]: val }))}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {/* Toolbar - Compact version */}
            {items.length > 0 && (
                <div className="card" style={{
                    padding: 'var(--space-2) var(--space-4)',
                    marginBottom: 'var(--space-6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 'var(--space-4)',
                    zIndex: 10,
                    background: 'var(--surface-primary)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border-color)',
                    minHeight: '52px'
                }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                        <button
                            onClick={toggleSelectionMode}
                            className={`btn btn-sm ${isSelectionMode ? 'btn-ghost' : 'btn-secondary'}`}
                            style={{ fontWeight: 600 }}
                        >
                            {isSelectionMode ? 'Cancel' : 'Select Items'}
                        </button>

                        {isSelectionMode && (
                            <>
                                <button
                                    onClick={toggleSelectAll}
                                    className="btn btn-ghost btn-sm"
                                >
                                    {selectedIds.size === items.length ? 'Deselect All' : 'Select All'}
                                </button>
                                <span className="text-xs font-medium border-l border-[var(--border-color)] pl-3 text-secondary">
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
                                className="btn btn-sm"
                                style={{
                                    background: 'var(--accent-error)',
                                    color: 'white',
                                    opacity: selectedIds.size === 0 ? 0.5 : 1

                                }}
                            >
                                <DeleteOutlineIcon style={{ fontSize: '16px', marginRight: 'var(--space-1)' }} />
                                Delete ({selectedIds.size})
                            </button>
                        ) : (
                            <button
                                onClick={handleDeleteLast}
                                disabled={isDeleting}
                                className="btn btn-ghost btn-sm text-xs"
                                style={{ color: 'var(--accent-error)' }}
                            >
                                Delete Last Added
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Grid */}
            {/* Grid vs List View */}
            {processedItems.length > 0 ? (
                <div style={
                    viewMode === 'list'
                        ? { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }
                        : {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '24px',
                            paddingTop: '8px'
                        }
                } className="animate-fade-in-up">
                    {processedItems.map((item) => (
                        <div key={item.id} className="card card-interactive group" style={{
                            padding: 0,
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'pointer',
                            border: 'none',
                            borderRadius: '16px',
                            background: 'var(--surface-primary)',
                            boxShadow: duplicateIds.has(item.id) ? '0 0 0 2px var(--accent-warning)' :
                                isSelectionMode && selectedIds.has(item.id) ? '0 0 0 2px var(--accent-primary)' :
                                    '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: viewMode === 'list' ? 'flex' : 'flex',
                            flexDirection: viewMode === 'list' ? 'row' : 'column',
                            height: viewMode === 'list' ? 'auto' : '100%',
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
                                    top: '12px',
                                    left: '12px',
                                    zIndex: 10,
                                    background: 'var(--surface-primary)',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    {selectedIds.has(item.id) ?
                                        <CheckBoxIcon style={{ color: 'var(--accent-primary)' }} /> :
                                        <CheckBoxOutlineBlankIcon style={{ color: 'var(--text-tertiary)' }} />
                                    }
                                </div>
                            )}

                            {/* Duplicate Warning Overlay */}
                            {!isSelectionMode && duplicateIds.has(item.id) && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    zIndex: 10,
                                    background: 'rgba(245, 158, 11, 0.95)',
                                    color: 'white',
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    Duplicate
                                </div>
                            )}

                            {/* Image Container */}
                            <div style={{
                                width: viewMode === 'list' ? '120px' : '100%',
                                aspectRatio: viewMode === 'list' ? 'auto' : '1',
                                background: '#F3F4F6', // Neutral gray bg for contrast
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '20px',
                                position: 'relative'
                            }} className="group-hover:brightness-[1.02] transition-all">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))',
                                            transform: 'scale(1)',
                                            transition: 'transform 0.4s ease'
                                        }}
                                        className="group-hover:scale-110"
                                    />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-tertiary)', opacity: 0.5 }}>
                                        <ImageNotSupportedIcon style={{ fontSize: '32px', marginBottom: '4px' }} />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div style={{
                                padding: '16px',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: '8px'
                            }}>
                                <div>
                                    <h3 style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        lineHeight: 1.4,
                                        marginBottom: '4px',
                                        color: 'var(--text-primary)',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {item.name}
                                    </h3>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                        fontWeight: 500,
                                        display: 'flex',
                                        gap: '6px',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ background: 'var(--surface-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                                            {item.external_id || '#---'}
                                        </span>
                                        {viewMode === 'list' && <span>• Added {new Date(item.created_at).toLocaleDateString()}</span>}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '8px',
                                    borderTop: viewMode === 'list' ? 'none' : '1px solid var(--border-color)',
                                    paddingTop: viewMode === 'list' ? 0 : '12px'
                                }}>
                                    <span style={{
                                        fontSize: '1.125rem',
                                        fontWeight: 700,
                                        color: 'var(--accent-primary-dark)'
                                    }}>
                                        {item.current_value !== null ?
                                            formatPrice(item.current_value) :
                                            item.purchase_price !== null ?
                                                formatPrice(item.purchase_price) :
                                                <span className="text-xs text-tertiary">--</span>}
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
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>No items found</h3>
                    <p className="text-secondary" style={{ marginBottom: 'var(--space-6)' }}>
                        {items.length > 0 ? "Try adjusting your filters." : "Start building your collection by adding items."}
                    </p>
                    {items.length === 0 && (
                        <AddItemModal collectionId={collection.id} collectionType={collection.type} currencyCode={currencyCode} />
                    )}
                </div>
            )
            }
        </div >
    )
}
