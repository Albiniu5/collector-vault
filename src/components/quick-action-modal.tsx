'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import { CollectionSelector } from './import/collection-selector'
import { AddItemModal } from './add-item-modal' // We'll adapt use of this
import { createCollection } from '@/app/collections/actions'

interface QuickActionModalProps {
    collections: any[]
}

export function QuickActionModal({ collections }: QuickActionModalProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const mode = searchParams.get('new') // 'collection' | 'item' | 'choose'
    const returnTo = searchParams.get('returnTo')

    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState(1) // 1=Select Type/Vault, 2=Action
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)

    // Create Collection State
    const [newCollectionName, setNewCollectionName] = useState('')
    const [newCollectionType, setNewCollectionType] = useState('generic')
    const [isCreating, setIsCreating] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const paramType = searchParams.get('type')

    useEffect(() => {
        if (mode) {
            setIsOpen(true)
            setErrorMessage(null)
            if (paramType) {
                setNewCollectionType(paramType)
            }
            // If mode is 'item', we might skip to step 1 (choose vault)
            // If mode is 'collection', we go straight to create form
        } else {
            setIsOpen(false)
            setStep(1)
            setSelectedCollectionId(null)
            setNewCollectionType('generic')
            setErrorMessage(null)
        }
    }, [mode, paramType])

    const close = () => {
        setIsOpen(false)
        // Remove param from URL without refresh
        const url = new URL(window.location.href)
        url.searchParams.delete('new')
        url.searchParams.delete('returnTo')
        router.replace(url.pathname + url.search)

        // Reset state after animation
        setTimeout(() => {
            setStep(1)
            setNewCollectionName('')
            setSelectedCollectionId(null)
            setErrorMessage(null)
        }, 300)
    }

    const handleCreateCollection = async () => {
        if (isCreating) return

        if (!newCollectionName.trim()) {
            setErrorMessage('Please enter a name for your vault')
            return
        }

        setIsCreating(true)
        setErrorMessage(null)

        console.log('Client: Sending create request', { name: newCollectionName, type: newCollectionType })

        try {
            const res = await createCollection({
                name: newCollectionName,
                type: newCollectionType,
                description: ''
            })
            console.log('Client: Received response', res)

            if (res.error) {
                setErrorMessage(res.error)
            } else if (res.data) {
                if (returnTo) {
                    router.push(returnTo)
                } else {
                    // Go to new collection
                    router.push(`/collections/${res.data.id}`)
                }
                close()
            } else {
                setErrorMessage('Unknown response from server')
            }
        } catch (e: any) {
            console.error('Client: Error', e)
            setErrorMessage(e.message || 'Failed to create collection')
        } finally {
            setIsCreating(false)
        }
    }

    if (!isOpen) return null

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Backdrop */}
            <div
                onClick={close}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
                className="animate-fade-in"
            />

            {/* Modal Card */}
            <div className="card animate-slide-up" style={{
                width: '100%', maxWidth: '600px',
                maxHeight: '90vh', overflowY: 'auto',
                position: 'relative', padding: 0,
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-2xl)'
            }}>
                {/* Header */}
                <div style={{
                    padding: 'var(--space-6)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--surface-secondary)'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        {mode === 'collection' ? 'Create New Vault' :
                            mode === 'item' ? (selectedCollectionId ? 'Add to Vault' : 'Select Target Vault') :
                                'What would you like to do?'}
                    </h2>
                    <button onClick={close} className="btn btn-ghost btn-icon">
                        <CloseIcon />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: 'var(--space-6)' }}>

                    {/* FLOW: Choose Action */}
                    {mode === 'choose' && (
                        <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
                            <button
                                onClick={() => router.replace('/?new=item')}
                                className="card card-interactive"
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    padding: 'var(--space-8)', gap: 'var(--space-4)',
                                    background: 'var(--surface-secondary)', border: '1px solid var(--border-color)'
                                }}
                            >
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '20px',
                                    background: 'var(--accent-primary)', color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <AddIcon style={{ fontSize: '32px' }} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>Add Item</h3>
                                    <p className="text-secondary text-sm">Add a new item to an existing vault</p>
                                </div>
                            </button>

                            <button
                                onClick={() => router.replace('/?new=collection')}
                                className="card card-interactive"
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    padding: 'var(--space-8)', gap: 'var(--space-4)',
                                    background: 'var(--surface-secondary)', border: '1px solid var(--border-color)'
                                }}
                            >
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '20px',
                                    background: 'var(--surface-tertiary)', color: 'var(--text-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <CollectionsBookmarkIcon style={{ fontSize: '32px' }} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>Create Vault</h3>
                                    <p className="text-secondary text-sm">Start a new collection</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* FLOW: Create Collection */}
                    {mode === 'collection' && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleCreateCollection()
                            }}
                            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
                        >
                            <div>
                                <label className="text-secondary text-xs uppercase font-bold mb-2 block">Collection Name</label>
                                <input
                                    autoFocus
                                    className="input"
                                    placeholder="e.g. My Rare Coins"
                                    value={newCollectionName}
                                    onChange={e => {
                                        setNewCollectionName(e.target.value)
                                        if (errorMessage) setErrorMessage(null)
                                    }}
                                    style={{ fontSize: '1.25rem', fontWeight: 600 }}
                                />
                            </div>

                            <div>
                                <label className="text-secondary text-xs uppercase font-bold mb-2 block">Collection Type</label>
                                <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
                                    {[
                                        { id: 'generic', label: 'General', icon: '📦' },
                                        { id: 'lego', label: 'LEGO', icon: '🧱' },
                                        { id: 'coins', label: 'Coins', icon: '🪙' },
                                        { id: 'books', label: 'Books', icon: '📚' },
                                        { id: 'cards', label: 'Cards', icon: '🃏' },
                                        { id: 'antiques', label: 'Antiques', icon: '🏺' },
                                    ].map(type => (
                                        <button
                                            type="button"
                                            key={type.id}
                                            onClick={() => setNewCollectionType(type.id)}
                                            className={`card ${newCollectionType === type.id ? 'active' : ''}`}
                                            style={{
                                                padding: 'var(--space-4)',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)',
                                                border: newCollectionType === type.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                                background: newCollectionType === type.id ? 'var(--surface-tertiary)' : 'var(--surface-secondary)',
                                                transform: newCollectionType === type.id ? 'scale(1.02)' : 'scale(1)',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <span style={{ fontSize: '24px' }}>{type.icon}</span>
                                            <span className="text-sm font-medium" style={{ color: newCollectionType === type.id ? 'white' : 'var(--text-secondary)' }}>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {errorMessage && (
                                <div className="animate-fade-in" style={{ padding: 'var(--space-3)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', borderRadius: 'var(--radius-md)', color: 'var(--accent-error)', fontSize: '0.875rem' }}>
                                    ⚠️ {errorMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isCreating}
                                className={`btn btn-primary ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                style={{ marginTop: 'var(--space-2)', height: '52px', fontSize: '1.1rem' }}
                            >
                                {isCreating ? 'Creating...' : 'Confirm'}
                            </button>
                        </form>
                    )}

                    {/* FLOW: Add Item - Step 1: Select Collection */}
                    {mode === 'item' && !selectedCollectionId && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                            <p className="text-secondary">Choose which vault to add this item to:</p>

                            <div className="grid grid-2" style={{ maxHeight: '400px', overflowY: 'auto', padding: '4px' }}>
                                {/* Add New Option in List */}
                                <button
                                    onClick={() => router.replace('/?new=collection&returnTo=/?new=item')}
                                    className="card card-interactive"
                                    style={{
                                        borderStyle: 'dashed',
                                        display: 'flex', alignItems: 'center', gap: '16px',
                                        padding: 'var(--space-4)',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <AddIcon />
                                    </div>
                                    <span className="font-semibold">New Collection</span>
                                </button>

                                {collections.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCollectionId(c.id)}
                                        className="card card-interactive"
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '16px',
                                            padding: 'var(--space-4)',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                            {c.type === 'lego' ? '🧱' : c.type === 'coins' ? '🪙' : '📦'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{c.name}</div>
                                            <div className="text-xs text-secondary capitalize">{c.type}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FLOW: Add Item - Step 2: Actually Add It */}
                    {mode === 'item' && selectedCollectionId && (
                        <div style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            {/* 
                              NOTE: Ideally we would render AddItemModal inline here.
                              For now, we will redirect the user to the Collection page and Open the modal there 
                              because AddItemModal is built as a complex self-contained drawer.
                              
                              Alternatively, we can render a "Simplified" Add Item form here. 
                              Let's redirect for best experience with the existing robust Drawer.
                           */}
                            <p className="mb-4">Redirecting to Vault...</p>
                            {(() => {
                                router.push(`/collections/${selectedCollectionId}?action=add`)
                                close()
                                return null
                            })()}
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
