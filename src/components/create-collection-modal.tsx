'use client'

import AddIcon from '@mui/icons-material/Add'

export function CreateCollectionModal() {
    return (
        <button className="card card-interactive" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            cursor: 'pointer',
            border: '2px dashed var(--border-color)',
            background: 'transparent'
        }}>
            <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--surface-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-4)'
            }}>
                <AddIcon style={{ fontSize: '28px', color: 'var(--text-secondary)' }} />
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>
                Create Collection
            </h3>
            <p className="text-secondary text-sm" style={{ textAlign: 'center' }}>
                Start a new collection
            </p>
        </button>
    )
}
