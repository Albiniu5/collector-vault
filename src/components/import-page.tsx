'use client'

import { useState } from 'react'
import { parseCSV, guessCategory } from '@/lib/import-parser'
import { Upload, Loader2, Check } from 'lucide-react'
import { addItem } from '@/app/items/actions'
import { useRouter } from 'next/navigation'

export default function ImportPage({ collections }: { collections: any[] }) {
    const [step, setStep] = useState<'upload' | 'review'>('upload')
    const [parsedData, setParsedData] = useState<any[]>([])
    const [selectedCollection, setSelectedCollection] = useState(collections[0]?.id || '')
    const [isProcessing, setIsProcessing] = useState(false)
    const router = useRouter()

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            const data = parseCSV(text)
            setParsedData(data)
            setStep('review')
        }
        reader.readAsText(file)
    }

    const handleImport = async () => {
        setIsProcessing(true)
        let successCount = 0
        let errorCount = 0
        const errors: string[] = []

        // Sequential for now to avoid rate limits
        for (let i = 0; i < parsedData.length; i++) {
            const row = parsedData[i]
            try {
                // Map CSV columns to our internal structure
                const itemData: any = {
                    name: row.name || row.title || row.set_name || `Imported Item ${i + 1}`,
                    description: row.description || row.notes || row.desc || '',
                    purchase_price: parseFloat(row.price || row.cost || row.purchase_price || '0') || null,
                    current_value: parseFloat(row.value || row.current_value || '0') || null,
                    // Try to detect automation ID
                    set_num: row.set_num || row.set || row.set_number,
                    country: row.country,
                    year: parseInt(row.year || '0') || null
                }

                const result = await addItem(selectedCollection, itemData)

                if (result?.error) {
                    errorCount++
                    errors.push(`Row ${i + 1}: ${result.error}`)
                } else {
                    successCount++
                }
            } catch (error: any) {
                errorCount++
                errors.push(`Row ${i + 1}: ${error.message}`)
            }
        }

        setIsProcessing(false)

        if (errorCount > 0) {
            alert(`Import completed with errors:\n${successCount} succeeded, ${errorCount} failed\n\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`)
        }

        router.push(`/collections/${selectedCollection}`)
        router.refresh()
    }

    if (step === 'upload') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="p-8 border-2 border-dashed border-[var(--border)] rounded-2xl bg-[hsl(var(--background)_/_0.5)] w-full max-w-md text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-bold mb-2">Import Data</h2>
                    <p className="text-sm text-muted-foreground mb-6">Upload a CSV file to bulk import items.</p>

                    <label className="btn btn-primary cursor-pointer w-full">
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                        Select CSV File
                    </label>
                </div>
                <p className="text-xs text-muted-foreground">Supported format: CSV (name, set_num, price, etc.)</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Review Import</h2>

            <div className="grid md:grid-cols-[300px_1fr] gap-8">
                <div className="space-y-4">
                    <div className="glass-panel p-4">
                        <label className="block text-sm font-medium mb-2">Target Collection</label>
                        <select
                            value={selectedCollection}
                            onChange={(e) => setSelectedCollection(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[var(--border)]"
                        >
                            {collections.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                            ))}
                        </select>
                    </div>

                    <div className="glass-panel p-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Items found</span>
                            <span className="font-bold">{parsedData.length}</span>
                        </div>
                        <button
                            onClick={handleImport}
                            disabled={isProcessing}
                            className="btn btn-primary w-full"
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            {isProcessing ? 'Importing...' : 'Confirm Import'}
                        </button>
                    </div>
                </div>

                <div className="glass-panel overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[hsl(var(--foreground)_/_0.05)] text-muted-foreground">
                                <tr>
                                    {Object.keys(parsedData[0] || {}).map(header => (
                                        <th key={header} className="px-4 py-3 font-medium">{header}</th>
                                    ))}
                                    <th className="px-4 py-3 font-medium">Detected Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.slice(0, 10).map((row, i) => (
                                    <tr key={i} className="border-b border-[var(--border)]">
                                        {Object.values(row).map((val: any, j) => (
                                            <td key={j} className="px-4 py-3">{val}</td>
                                        ))}
                                        <td className="px-4 py-3 opacity-60">
                                            {guessCategory(row)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.length > 10 && (
                            <div className="p-4 text-center text-xs text-muted-foreground">
                                ...and {parsedData.length - 10} more rows
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
