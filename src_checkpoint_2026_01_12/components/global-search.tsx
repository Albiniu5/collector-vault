'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Package, Layers } from 'lucide-react'
import { globalSearch } from '@/app/search/actions'

export function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 1) {
                setLoading(true)
                const res = await globalSearch(query)
                setResults(res.results)
                setLoading(false)
                setIsOpen(true)
            } else {
                setResults(null)
                setIsOpen(false)
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [query])

    return (
        <div className="relative w-full max-w-sm" ref={wrapperRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search vault..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results) setIsOpen(true) }}
                    className="w-full pl-9 pr-4 py-2 rounded-full bg-[hsl(var(--foreground)_/_0.05)] border border-transparent focus:bg-[hsl(var(--background))] focus:border-[var(--border)] outline-none transition-all text-sm"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {isOpen && results && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[hsl(var(--background)_/_0.95)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">

                    {results.collections?.length > 0 && (
                        <div className="p-2">
                            <h4 className="text-xs uppercase font-bold text-muted-foreground px-2 mb-1">Collections</h4>
                            {results.collections.map((c: any) => (
                                <button
                                    key={c.id}
                                    onClick={() => router.push(`/collections/${c.id}`)}
                                    className="w-full flex items-center gap-2 p-2 hover:bg-[hsl(var(--foreground)_/_0.05)] rounded-lg text-left"
                                >
                                    <Layers className="h-4 w-4 text-[hsl(var(--primary))]" />
                                    <span className="text-sm font-medium">{c.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {results.items?.length > 0 && (
                        <div className="p-2 border-t border-[var(--border)]">
                            <h4 className="text-xs uppercase font-bold text-muted-foreground px-2 mb-1">Items</h4>
                            {results.items.map((i: any) => (
                                <button
                                    key={i.id}
                                    onClick={() => router.push(`/collections/${i.collection_id}`)} // Ideally deep link to item
                                    className="w-full flex items-center gap-2 p-2 hover:bg-[hsl(var(--foreground)_/_0.05)] rounded-lg text-left"
                                >
                                    <Package className="h-4 w-4 text-[hsl(var(--primary))]" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{i.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{i.external_id}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {results.items?.length === 0 && results.collections?.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No results found.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
