'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FolderIcon from '@mui/icons-material/Folder'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AddIcon from '@mui/icons-material/Add'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import SettingsIcon from '@mui/icons-material/Settings'

interface Collection {
    id: string
    name: string
    type: string
    subdivision?: string
}

interface SidebarProps {
    collections: Collection[]
    userEmail?: string
}

export function Sidebar({ collections, userEmail }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/')

    // Group collections by subdivision
    const groupedCollections = collections.reduce((acc, collection) => {
        const key = collection.subdivision || 'Uncategorized'
        if (!acc[key]) acc[key] = []
        acc[key].push(collection)
        return acc
    }, {} as Record<string, Collection[]>)

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-ghost btn-icon fixed top-4 left-4 z-50 md:hidden"
            >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {/* Sidebar */}
            <aside
                className={`sidebar ${isOpen ? 'mobile-open' : ''}`}
                style={{
                    padding: 'var(--space-4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-6)'
                }}
            >
                {/* Logo/Brand */}
                <div style={{ padding: 'var(--space-4) var(--space-2)' }}>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            margin: 0
                        }}>
                            Vault
                        </h1>
                        <p style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)',
                            margin: 0
                        }}>
                            Collection Manager
                        </p>
                    </Link>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <Link
                        href="/"
                        className={`btn btn-ghost ${isActive('/') && !pathname?.includes('/collections') ? 'btn-secondary' : ''}`}
                        style={{
                            justifyContent: 'flex-start',
                            width: '100%',
                            fontWeight: isActive('/') && !pathname?.includes('/collections') ? 600 : 400
                        }}
                    >
                        <DashboardIcon style={{ fontSize: '20px' }} />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        href="/import"
                        className={`btn btn-ghost ${isActive('/import') ? 'btn-secondary' : ''}`}
                        style={{
                            justifyContent: 'flex-start',
                            width: '100%',
                            fontWeight: isActive('/import') ? 600 : 400
                        }}
                    >
                        <UploadFileIcon style={{ fontSize: '20px' }} />
                        <span>Import</span>
                    </Link>

                    <Link
                        href="/settings"
                        className={`btn btn-ghost ${isActive('/settings') ? 'btn-secondary' : ''}`}
                        style={{
                            justifyContent: 'flex-start',
                            width: '100%',
                            fontWeight: isActive('/settings') ? 600 : 400
                        }}
                    >
                        <SettingsIcon style={{ fontSize: '20px' }} />
                        <span>Settings</span>
                    </Link>

                    {/* Collections Section */}
                    <div style={{ marginTop: 'var(--space-6)' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--space-2) var(--space-3)',
                            marginBottom: 'var(--space-2)'
                        }}>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--text-tertiary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Collections
                            </span>
                            <Link href="/?new=collection" className="btn-icon btn-ghost" style={{ padding: 'var(--space-1)' }}>
                                <AddIcon style={{ fontSize: '16px' }} />
                            </Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                            {Object.entries(groupedCollections).map(([subdivision, items]) => (
                                <div key={subdivision}>
                                    {subdivision !== 'Uncategorized' && (
                                        <div style={{
                                            fontSize: '0.6875rem',
                                            fontWeight: 500,
                                            color: 'var(--text-tertiary)',
                                            padding: 'var(--space-2) var(--space-3)',
                                            marginTop: 'var(--space-2)'
                                        }}>
                                            {subdivision}
                                        </div>
                                    )}
                                    {items.map((collection) => (
                                        <Link
                                            key={collection.id}
                                            href={`/collections/${collection.id}`}
                                            className={`btn btn-ghost ${isActive(`/collections/${collection.id}`) ? 'btn-secondary' : ''}`}
                                            style={{
                                                justifyContent: 'flex-start',
                                                width: '100%',
                                                fontSize: '0.875rem',
                                                fontWeight: isActive(`/collections/${collection.id}`) ? 600 : 400,
                                                paddingLeft: subdivision !== 'Uncategorized' ? 'var(--space-8)' : 'var(--space-4)'
                                            }}
                                        >
                                            <FolderIcon style={{ fontSize: '18px', opacity: 0.7 }} />
                                            <span style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {collection.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* User Info */}
                {userEmail && (
                    <div style={{
                        padding: 'var(--space-3)',
                        borderTop: '1px solid var(--border-color)',
                        marginTop: 'auto'
                    }}>
                        <p style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-secondary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            margin: 0
                        }}>
                            {userEmail}
                        </p>
                        <form action="/auth/signout" method="post" style={{ marginTop: 'var(--space-2)' }}>
                            <button
                                type="submit"
                                className="btn btn-ghost btn-sm"
                                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.75rem' }}
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>
                )}
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 30
                    }}
                    className="md:hidden"
                />
            )}
        </>
    )
}
