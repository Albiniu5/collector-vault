'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FolderIcon from '@mui/icons-material/Folder' // Fallback for specific icons
import GridViewIcon from '@mui/icons-material/GridView' // Use for collections
import LocalMallIcon from '@mui/icons-material/LocalMall' // Market/Shop
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn' // Coins
import ExtensionIcon from '@mui/icons-material/Extension' // LEGO
import MenuBookIcon from '@mui/icons-material/MenuBook' // Books
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty' // Antiques

// Map categories to icons
const getCategoryIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'coins': return MonetizationOnIcon;
        case 'lego': return ExtensionIcon;
        case 'books': return MenuBookIcon;
        case 'antiques': return HourglassEmptyIcon;
        default: return FolderIcon;
    }
}

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

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path)

    // Helper to render a navigation item
    const NavItem = ({ href, icon: Icon, label, exact = false }: { href: string, icon: any, label: string, exact?: boolean }) => {
        const active = exact ? pathname === href : isActive(href)
        return (
            <Link
                href={href}
                className="btn-ghost"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: active ? 'var(--surface-secondary)' : 'transparent',
                    fontWeight: active ? 600 : 400,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                }}
            >
                <Icon style={{ fontSize: '20px', color: active ? 'var(--accent-primary)' : 'inherit', opacity: active ? 1 : 0.7 }} />
                <span>{label}</span>
            </Link>
        )
    }

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
                style={{ padding: 'var(--space-6) var(--space-4)' }}
            >
                {/* Brand */}
                <div style={{ padding: '0 12px', marginBottom: 'var(--space-8)' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', background: 'var(--accent-primary)', borderRadius: '6px' }}></div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Vault</span>
                    </Link>
                </div>

                {/* Main Nav */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="text-tertiary text-xs font-bold uppercase" style={{ padding: '0 16px', marginBottom: '8px', letterSpacing: '0.05em' }}>Overview</div>
                    <NavItem href="/" exact icon={DashboardIcon} label="Dashboard" />
                    <NavItem href="/analytics" icon={GridViewIcon} label="Analytics" />
                </div>

                {/* Collections Categories */}
                <div style={{ marginTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="text-tertiary text-xs font-bold uppercase" style={{ padding: '0 16px', marginBottom: '8px', letterSpacing: '0.05em' }}>Collections</div>
                    {/* 
                         In a real app, these might filter the main view. 
                         For now, we'll link to the first collection of that type or a filtered view.
                         Assuming we just list all collections for now but cleaner. 
                     */}
                    {/* Hardcoded Categories for the "App" feel, mapping to specific collections if available */}
                    <NavItem href="/collections/type/coins" icon={MonetizationOnIcon} label="Coins" />
                    <NavItem href="/collections/type/lego" icon={ExtensionIcon} label="LEGO" />
                    {/* Dynamic Collections List (Generic) */}
                    {collections.slice(0, 5).map(c => {
                        // Only show if not covered by main categories? Or just show all?
                        // Let's show specific collections as sub-items if needed.
                        // For this design, let's keep it clean.
                        return null
                    })}
                    <NavItem href="/collections" icon={FolderIcon} label="All Collections" />
                </div>

                {/* System */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <NavItem href="/settings" icon={SettingsIcon} label="Settings" />

                    {userEmail && (
                        <div style={{
                            marginTop: 'var(--space-4)',
                            padding: '16px',
                            borderTop: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                                {userEmail[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail.split('@')[0]}</div>
                                <form action="/auth/signout" method="post">
                                    <button type="submit" style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', cursor: 'pointer' }}>Sign out</button>
                                </form>
                            </div>
                        </div>
                    )}
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
