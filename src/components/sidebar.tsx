'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './theme-provider'
import FolderIcon from '@mui/icons-material/Folder'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import ExtensionIcon from '@mui/icons-material/Extension'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import AddIcon from '@mui/icons-material/Add'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'

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
    const { theme, toggleTheme } = useTheme()
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path)

    // Helper to render a navigation item
    const NavItem = ({ href, icon: Icon, label, exact = false, isAction = false }: { href: string, icon: any, label: string, exact?: boolean, isAction?: boolean }) => {
        const active = exact ? pathname === href : isActive(href)

        // Dynamic styles based on state
        const linkStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            fontSize: '0.95rem',
            // Active vs Inactive colors
            background: active ? 'var(--surface-secondary)' : 'transparent',
            color: isAction
                ? 'var(--accent-primary)'
                : active ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: active || isAction ? 600 : 400
        }

        return (
            <Link
                href={href}
                style={linkStyle}
                // Mouse over hover effect handled by simple inline unlikely, usually needs CSS class or state.
                // For now, simpler inline is robust for layout, colors handled above.
                className="sidebar-link"
            >
                <Icon style={{
                    fontSize: '22px',
                    color: isAction ? 'inherit' : (active ? 'var(--accent-primary)' : 'inherit'),
                    opacity: active ? 1 : 0.7
                }} />
                <span>{label}</span>
            </Link>
        )
    }

    // Default static categories to match the design concept
    const categories = [
        { id: 'lego', label: 'LEGO', icon: ExtensionIcon },
        { id: 'coins', label: 'Coin Collection', icon: MonetizationOnIcon },
        { id: 'books', label: 'Books', icon: MenuBookIcon },
        { id: 'antiques', label: 'Antiques', icon: HourglassEmptyIcon },
        { id: 'stamps', label: 'Stamps', icon: LocalOfferIcon },
    ]

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-ghost btn-icon fixed top-4 left-4 z-50 md:hidden"
                style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-color)' }}
            >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </button>

            {/* Sidebar */}
            <aside
                className={`sidebar ${isOpen ? 'mobile-open' : ''}`}
                style={{
                    padding: '32px 20px',
                    background: 'var(--surface-primary)', // Solid background
                    borderRight: '1px solid var(--border-color)',
                    boxShadow: '4px 0 24px rgba(0,0,0,0.2)' // Add depth
                }}
            >
                {/* Brand Logo */}
                <div style={{ padding: '0 12px', marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)', // Colorful logo like image
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
                    }}></div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Vault</span>
                </div>

                {/* Main Nav */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {/* Categories from Design */}
                    {categories.map(cat => (
                        <NavItem
                            key={cat.id}
                            href={`/collections/type/${cat.id}`}
                            icon={cat.icon}
                            label={cat.label}
                        />
                    ))}

                    {/* Add Collection Button */}
                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <Link
                            href="/?new=choose"
                            className="sidebar-link"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                color: 'var(--text-secondary)',
                                fontWeight: 500
                            }}
                        >
                            <AddIcon style={{ fontSize: '22px' }} />
                            <span>Add Collection</span>
                        </Link>
                    </div>
                </div>

                {/* User Section */}
                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ padding: '0 12px' }}>
                        <div style={{
                            padding: '16px',
                            background: 'var(--surface-secondary)',
                            borderRadius: '16px',
                            marginBottom: '12px'
                        }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Signed in as</div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {userEmail || 'User'}
                            </div>
                        </div>

                        {/* Settings Link */}
                        <Link
                            href="/settings"
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'flex-start', gap: '12px', marginBottom: '8px' }}
                        >
                            <SettingsIcon style={{ fontSize: '20px' }} />
                            <span>Settings</span>
                        </Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'flex-start', gap: '12px' }}
                        >
                            <div style={{ fontSize: '18px' }}>
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </div>
                            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                        </button>

                        <a href="/auth/signout" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-tertiary)' }}>
                            Sign Out
                        </a>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden"
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
