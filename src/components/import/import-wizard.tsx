'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { parseCSV, guessCategory } from '@/lib/import-parser'
import { addItem } from '@/app/items/actions'
import { CollectionSelector } from './collection-selector'
import { FileDropzone } from './file-dropzone'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CheckIcon from '@mui/icons-material/Check'
import Loader2Icon from '@mui/icons-material/Refresh' // Spinner substitute

interface ImportWizardProps {
    collections: any[]
}

export function ImportWizard({ collections }: ImportWizardProps) {
    const [step, setStep] = useState<number>(1)
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
    const [parsedData, setParsedData] = useState<any[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const router = useRouter()

    // Step 1: Collection Selection
    const handleCollectionSelect = (id: string) => {
        setSelectedCollectionId(id)
        setStep(2)
    }

    const handleCreateCollection = () => {
        router.push('/?new=collection&returnTo=/import')
    }

    // Step 2: File Upload
    const handleFileSelect = (file: File) => {
        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string
            const data = parseCSV(text)
            setParsedData(data)
            setStep(3)
        }
        reader.readAsText(file)
    }

    // Step 3: Confirmation
    const handleImport = async () => {
        if (!selectedCollectionId) return

        setIsProcessing(true)
        let successCount = 0
        let errorCount = 0
        const errors: string[] = []

        // Sequential import
        for (let i = 0; i < parsedData.length; i++) {
            const row = parsedData[i]
            try {
                const itemData: any = {
                    name: row.name || row.title || row.set_name || `Imported Item ${i + 1}`,
                    description: row.description || row.notes || row.desc || '',
                    purchase_price: parseFloat(row.price || row.cost || row.purchase_price || '0') || null,
                    current_value: parseFloat(row.value || row.current_value || '0') || null,
                    set_num: row.set_num || row.set || row.set_number,
                    country: row.country,
                    year: parseInt(row.year || '0') || null
                }

                const result = await addItem(selectedCollectionId, itemData)
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
            alert(`Import completed with issues:\n${successCount} succeeded\n${errorCount} failed`)
        }

        router.push(`/collections/${selectedCollectionId}`)
        router.refresh()
    }

    const selectedCollection = collections.find(c => c.id === selectedCollectionId)

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress / Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: step >= 1 ? 1 : 0.5, color: step === 1 ? 'var(--accent-primary)' : 'inherit' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>1</div>
                    <span className="font-semibold text-sm">Select Target</span>
                </div>
                <div style={{ width: '20px', height: '2px', background: 'var(--border-color)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: step >= 2 ? 1 : 0.5, color: step === 2 ? 'var(--accent-primary)' : 'inherit' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>2</div>
                    <span className="font-semibold text-sm">Upload File</span>
                </div>
                <div style={{ width: '20px', height: '2px', background: 'var(--border-color)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: step >= 3 ? 1 : 0.5, color: step === 3 ? 'var(--accent-primary)' : 'inherit' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>3</div>
                    <span className="font-semibold text-sm">Review & Import</span>
                </div>
            </div>

            {/* Back Button */}
            {step > 1 && (
                <button
                    onClick={() => setStep(step - 1)}
                    className="btn btn-ghost btn-sm"
                    style={{ marginBottom: 'var(--space-4)', paddingLeft: 0 }}
                >
                    <ArrowBackIcon style={{ fontSize: '16px' }} /> Back
                </button>
            )}

            {/* STEP 1: Collection Selection */}
            {step === 1 && (
                <CollectionSelector
                    collections={collections}
                    selectedId={selectedCollectionId}
                    onSelect={handleCollectionSelect}
                    onCreateNew={handleCreateCollection}
                />
            )}

            {/* STEP 2: File Upload */}
            {step === 2 && (
                <div className="animate-fade-in">
                    <div className="card mb-6" style={{ background: 'var(--surface-secondary)', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--accent-primary)' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <CheckIcon />
                        </div>
                        <div>
                            <div className="text-xs uppercase font-bold text-tertiary">Target Collection</div>
                            <div className="font-bold text-lg">{selectedCollection?.name}</div>
                        </div>
                        <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm ml-auto">Change</button>
                    </div>

                    <FileDropzone onFileSelect={handleFileSelect} />
                </div>
            )}

            {/* STEP 3: Review */}
            {step === 3 && (
                <div className="animate-fade-in grid md:grid-cols-[300px_1fr] gap-8">
                    <div className="space-y-4">
                        <div className="card">
                            <h3 className="font-bold mb-4">Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-secondary">Target:</span>
                                    <span className="font-medium">{selectedCollection?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-secondary">Items Found:</span>
                                    <span className="font-medium">{parsedData.length}</span>
                                </div>
                            </div>

                            <hr style={{ margin: 'var(--space-4) 0', borderColor: 'var(--border-color)' }} />

                            <button
                                onClick={handleImport}
                                disabled={isProcessing}
                                className="btn btn-primary w-full"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2Icon className="animate-spin" style={{ fontSize: '18px' }} /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon style={{ fontSize: '18px' }} /> Confirm Import
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="card overflow-hidden" style={{ padding: 0 }}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left" style={{ borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'var(--surface-secondary)' }}>
                                    <tr>
                                        {Object.keys(parsedData[0] || {}).map(header => (
                                            <th key={header} style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.slice(0, 10).map((row, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            {Object.values(row).map((val: any, j) => (
                                                <td key={j} style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{val}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {parsedData.length > 10 && (
                                <div className="p-4 text-center text-xs text-muted-foreground" style={{ padding: '16px' }}>
                                    ...and {parsedData.length - 10} more rows
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
