'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { lookupItem, lookupCoinDetails, addItem, scanImage } from '@/app/items/actions'
import SearchIcon from '@mui/icons-material/Search'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import CircularProgress from '@mui/material/CircularProgress'

function SearchContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Params
    const initialQuery = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'coins'
    const collectionId = searchParams.get('collectionId') || ''

    // State
    const [query, setQuery] = useState(initialQuery)
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Selection / Add State
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [price, setPrice] = useState('')
    const [addSuccess, setAddSuccess] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsAnalyzing(true)
        setResults([])
        setError('')
        setQuery('') // Clear text query to indicate visual search

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await scanImage(formData)
            if (res.error) {
                setError(res.error)
            } else if (res.results) {
                setResults(res.results)
            }
        } catch (err) {
            setError('Scan failed')
        } finally {
            setIsAnalyzing(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // Execute Search
    const executeSearch = async (q: string) => {
        if (!q.trim()) return
        setLoading(true)
        setError('')
        setResults([])

        const formData = new FormData()
        formData.append('type', type)
        formData.append('query', q)

        try {
            const res = await lookupItem(formData)
            if (res.error) {
                setError(res.error)
            } else if (res.results) {
                setResults(res.results)
            } else if (res.data) {
                // Handle single result fallback (wrap in array)
                setResults([res.data])
            }
        } catch (e) {
            setError('Search failed')
        } finally {
            setLoading(false)
        }
    }

    // Initial Load
    useEffect(() => {
        if (initialQuery) {
            executeSearch(initialQuery)
        }
    }, [])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Update URL
        const params = new URLSearchParams(searchParams)
        params.set('q', query)
        router.replace(`/search?${params.toString()}`)
        executeSearch(query)
    }

    // Select Item Handling
    const handleSelect = async (item: any) => {
        if (type === 'coins' && item.numista_id) {
            setDetailsLoading(true)
            setSelectedItem(item) // Temporary show summary while loading
            try {
                const det = await lookupCoinDetails(item.numista_id)
                if (det.data) {
                    setSelectedItem(det.data)
                }
            } catch (e) {
                console.error('Details fetch failed')
            } finally {
                setDetailsLoading(false)
            }
        } else {
            setSelectedItem(item)
        }
    }

    const handleAdd = async () => {
        if (!selectedItem || !collectionId) return

        try {
            const itemToAdd = {
                ...selectedItem,
                current_value: price ? parseFloat(price) : null
            }
            const res = await addItem(collectionId, itemToAdd)
            if (res?.error) {
                alert(res.error)
            } else {
                setAddSuccess(true)
                // Redirect back to collection after short delay
                setTimeout(() => {
                    router.push(`/collections/${collectionId}`)
                }, 1500)
            }
        } catch (e) {
            alert('Failed to add item')
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            {/* Header */}
            <div style={{
                background: 'var(--surface-primary)',
                borderBottom: '1px solid var(--border-color)',
                padding: 'var(--space-4) var(--space-6)',
                position: 'sticky',
                top: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)'
            }}>
                <button onClick={() => router.back()} className="btn btn-ghost btn-icon">
                    <ArrowBackIcon />
                </button>

                <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '8px' }}>

                    {/* Camera Upload */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-secondary hover-scale"
                        title="Scan with Google Lens"
                        style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <CameraAltIcon />
                    </button>

                    <div className="relative flex-1">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search..."
                            className="input-premium w-full"
                            style={{ height: '48px', paddingLeft: '48px' }}
                        />
                        <SearchIcon style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
                    </button>
                </form>
            </div>

            {/* Results */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-8)' }}>
                {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6 font-bold">{error}</div>}

                {isAnalyzing && (
                    <div className="text-center py-20 animate-pulse">
                        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                            <CameraAltIcon style={{ fontSize: 40, color: 'var(--primary)' }} />
                        </div>
                        <h3 className="text-xl font-bold">Analyzing Image...</h3>
                        <p className="text-secondary">Searching Google Lens for matches</p>
                    </div>
                )}

                {results.length === 0 && !loading && !isAnalyzing && (
                    <div className="text-center text-secondary py-20">
                        Start your search above to find items.
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {results.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => handleSelect(item)}
                            className="card hover-scale cursor-pointer"
                            style={{ padding: 0, overflow: 'hidden', background: 'var(--surface-primary)' }}
                        >
                            <div style={{ height: '200px', background: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <ImageNotSupportedIcon style={{ fontSize: 48, color: 'var(--text-tertiary)' }} />
                                )}
                            </div>
                            <div style={{ padding: '16px' }}>
                                <div className="text-xs font-bold text-secondary uppercase mb-1">{item.country} • {item.year}</div>
                                <h3 className="font-bold text-lg leading-tight line-clamp-2">{item.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Overlay */}
            {selectedItem && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={() => setSelectedItem(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />

                    <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: '500px', padding: 0, zIndex: 101, maxHeight: '90vh', overflowY: 'auto' }}>
                        {/* Overlay Header */}
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                            <h3 className="font-bold text-xl">Add Item</h3>
                            <button onClick={() => setSelectedItem(null)}><CloseIcon /></button>
                        </div>

                        {/* Overlay Content */}
                        <div style={{ padding: '24px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{ height: '180px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {selectedItem.image_url ? (
                                        <img src={selectedItem.image_url} style={{ maxHeight: '100%', maxWidth: '100%' }} />
                                    ) : (
                                        <ImageNotSupportedIcon fontSize="large" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                                <p className="text-secondary">{selectedItem.country} • {selectedItem.year}</p>
                                {detailsLoading && <div className="mt-2 text-primary font-bold">Fetching specific details...</div>}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">Value / Price Paid</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="input-premium w-full"
                                        placeholder="0.00"
                                    />
                                </div>

                                {addSuccess ? (
                                    <div className="bg-green-500/10 text-green-500 p-4 rounded-xl font-bold text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            Added Successfully! Redirecting...
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleAdd}
                                        disabled={detailsLoading}
                                        className="btn btn-primary w-full py-4 text-lg font-bold shadow-lg"
                                        style={{ marginTop: '16px' }}
                                    >
                                        Add to Collection
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchContent />
        </Suspense>
    )
}
