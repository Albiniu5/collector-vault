'use client'

import { useCallback, useState } from 'react'
import UploadFileIcon from '@mui/icons-material/UploadFile'

interface FileDropzoneProps {
    onFileSelect: (file: File) => void
}

export function FileDropzone({ onFileSelect }: FileDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0])
        }
    }, [onFileSelect])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0])
        }
    }, [onFileSelect])

    return (
        <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                Step 2: Upload CSV File
            </h2>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    border: '2px dashed',
                    borderColor: isDragging ? 'var(--accent-primary)' : 'var(--border-color)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-16) var(--space-8)',
                    textAlign: 'center',
                    background: isDragging ? 'var(--surface-secondary)' : 'var(--surface-primary)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative'
                }}
            >
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />

                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'var(--surface-secondary)',
                    color: isDragging ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    margin: '0 auto var(--space-6) auto',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <UploadFileIcon style={{ fontSize: '32px' }} />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Drop your CSV file here
                </h3>
                <p className="text-secondary" style={{ marginBottom: 'var(--space-6)' }}>
                    or click to browse from your computer
                </p>

                <div className="text-xs text-tertiary">
                    Supported formats: .CSV (Max 10MB)
                </div>
            </div>
        </div>
    )
}
