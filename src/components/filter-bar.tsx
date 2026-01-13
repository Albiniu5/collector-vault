'use client'

import React from 'react'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
import SortIcon from '@mui/icons-material/Sort'

interface FilterBarProps {
    onSearch: (query: string) => void
    onSortChange: (sort: string) => void
    onFilterChange: (filterType: string, value: string) => void
    viewMode: 'grid' | 'list'
    onViewModeChange: (mode: 'grid' | 'list') => void
}

export function FilterBar({ onSearch, onSortChange, onFilterChange, viewMode, onViewModeChange }: FilterBarProps) {
    return (
        <div className="card" style={{
            marginBottom: 'var(--space-6)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center'
        }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <SearchIcon style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                    fontSize: '20px'
                }} />
                <input
                    type="text"
                    placeholder="Search collection..."
                    className="input"
                    onChange={(e) => onSearch(e.target.value)}
                    style={{
                        paddingLeft: '40px',
                        width: '100%',
                        height: '40px'
                    }}
                />
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <SortIcon style={{ color: 'var(--text-secondary)', fontSize: '20px' }} />
                <select
                    className="input"
                    onChange={(e) => onSortChange(e.target.value)}
                    style={{ height: '40px', minWidth: '140px' }}
                >
                    <option value="newest">Newest Added</option>
                    <option value="oldest">Oldest Added</option>
                    <option value="value_high">Value (High-Low)</option>
                    <option value="value_low">Value (Low-High)</option>
                    <option value="year_new">Year (New-Old)</option>
                    <option value="year_old">Year (Old-New)</option>
                </select>
            </div>

            {/* Filter Condition */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <FilterListIcon style={{ color: 'var(--text-secondary)', fontSize: '20px' }} />
                <select
                    className="input"
                    onChange={(e) => onFilterChange('condition', e.target.value)}
                    style={{ height: '40px', minWidth: '120px' }}
                >
                    <option value="all">Condition: All</option>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                </select>
                {/* View Mode Toggle */}
                <div style={{ display: 'flex', background: 'var(--surface-tertiary)', borderRadius: '8px', padding: '2px', marginLeft: 'auto' }}>
                    <button
                        onClick={() => onViewModeChange('grid')}
                        style={{
                            padding: '6px',
                            background: viewMode === 'grid' ? 'var(--surface-primary)' : 'transparent',
                            color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Grid View"
                    >
                        <GridViewIcon style={{ fontSize: '20px' }} />
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        style={{
                            padding: '6px',
                            background: viewMode === 'list' ? 'var(--surface-primary)' : 'transparent',
                            color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="List View"
                    >
                        <ViewListIcon style={{ fontSize: '20px' }} />
                    </button>
                </div>
            </div>
        </div>
    )
}
