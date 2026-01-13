'use client'

import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface Collection {
    id: string
    name: string
    type: string
}

interface CollectionSelectorProps {
    collections: Collection[]
    selectedId: string | null
    onSelect: (id: string) => void
    onCreateNew: () => void
}

export function CollectionSelector({ collections, selectedId, onSelect, onCreateNew }: CollectionSelectorProps) {
    return (
        <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                Step 1: Choose Target Vault
            </h2>
            <div className="grid grid-3">
                {/* Create New Option */}
                <div
                    onClick={onCreateNew}
                    className="card card-interactive"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '180px',
                        borderStyle: 'dashed',
                        background: 'transparent',
                        opacity: 0.8
                    }}
                >
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 'var(--space-4)'
                    }}>
                        <AddIcon />
                    </div>
                    <span className="font-semibold">Choose Vault</span>
                </div>

                {/* Existing Collections */}
                {collections.map(collection => {
                    const isSelected = selectedId === collection.id
                    return (
                        <div
                            key={collection.id}
                            onClick={() => onSelect(collection.id)}
                            className={`card card-interactive ${isSelected ? 'selected' : ''}`}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '180px',
                                position: 'relative',
                                borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                                boxShadow: isSelected ? '0 0 0 2px var(--accent-primary)' : 'none',
                                background: isSelected ? 'var(--surface-secondary)' : 'var(--surface-primary)'
                            }}
                        >
                            {isSelected && (
                                <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--accent-primary)' }}>
                                    <CheckCircleIcon />
                                </div>
                            )}

                            <div style={{
                                width: '40px', height: '40px', borderRadius: '8px',
                                background: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '20px', marginBottom: 'var(--space-4)'
                            }}>
                                {collection.type === 'lego' ? '🧱' : collection.type === 'coins' ? '🪙' : '📦'}
                            </div>

                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
                                {collection.name}
                            </h3>
                            <p className="text-sm text-secondary capitalize">{collection.type}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
