'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCollection } from '@/app/collections/actions'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import WarningIcon from '@mui/icons-material/Warning'

export function DeleteCollectionButton({ collectionId, collectionName }: { collectionId: string, collectionName: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (confirmText !== 'delete') return

        setIsDeleting(true)
        const result = await deleteCollection(collectionId)

        if (result.success) {
            router.push('/') // Go back to dashboard
            router.refresh()
        } else {
            alert(result.message || 'Failed to delete collection')
            setIsDeleting(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-ghost btn-sm text-xs"
                style={{ color: 'var(--accent-error)', opacity: 0.7 }}
                title="Delete Collection"
            >
                <DeleteForeverIcon style={{ fontSize: '18px', marginRight: '4px' }} /> Delete Vault
            </button>
        )
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px' // Prevent edge touching on mobile
        }}>
            <div className="card animate-scale-in" style={{ maxWidth: '400px', width: '100%', background: 'var(--surface-primary)', border: '1px solid var(--accent-error)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--accent-error)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto var(--space-4) auto'
                    }}>
                        <WarningIcon style={{ fontSize: '32px' }} />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Delete Vault?</h3>
                    <p className="text-secondary">
                        This will permanently delete <strong>{collectionName}</strong> and all items inside it. This action cannot be undone.
                    </p>
                </div>

                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <label className="text-xs font-bold uppercase text-secondary mb-2 block">
                        Type <span className="text-primary font-mono select-all">delete</span> to confirm
                    </label>
                    <input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="input"
                        placeholder="delete"
                        style={{ width: '100%', textAlign: 'center', letterSpacing: '0.1em' }}
                        autoFocus
                    />
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button
                        onClick={() => setIsOpen(false)}
                        disabled={isDeleting}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={confirmText !== 'delete' || isDeleting}
                        className="btn"
                        style={{
                            flex: 1,
                            background: 'var(--accent-error)',
                            color: 'white',
                            opacity: confirmText === 'delete' ? 1 : 0.5,
                            cursor: confirmText === 'delete' ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Vault'}
                    </button>
                </div>
            </div>
        </div>
    )
}
