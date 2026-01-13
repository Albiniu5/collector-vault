'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import LinkIcon from '@mui/icons-material/Link'

interface ImageUploadProps {
    value?: string | null
    onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [mode, setMode] = useState<'upload' | 'url'>('upload')
    const [uploading, setUploading] = useState(false)
    const [urlInput, setUrlInput] = useState('')

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = e.target.files?.[0]
            if (!file) return

            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('vault-images')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('vault-images')
                .getPublicUrl(filePath)

            onChange(publicUrl)
        } catch (error: any) {
            alert('Error uploading image: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <button
                    onClick={() => setMode('upload')}
                    className={`btn btn-sm ${mode === 'upload' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ flex: 1 }}
                >
                    <CloudUploadIcon style={{ marginRight: '8px', fontSize: '18px' }} /> Upload
                </button>
                <button
                    onClick={() => setMode('url')}
                    className={`btn btn-sm ${mode === 'url' ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ flex: 1 }}
                >
                    <LinkIcon style={{ marginRight: '8px', fontSize: '18px' }} /> URL
                </button>
            </div>

            {mode === 'upload' ? (
                <div style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: uploading ? 'wait' : 'pointer',
                    background: 'var(--surface-secondary)',
                    position: 'relative'
                }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0,
                            cursor: 'pointer'
                        }}
                    />
                    {uploading ? (
                        <span className="text-primary font-bold">Uploading...</span>
                    ) : (
                        <div className="text-secondary">
                            <CloudUploadIcon style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }} />
                            <p>Click to select an image</p>
                        </div>
                    )}
                </div>
            ) : (
                <input
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="input"
                    placeholder="https://example.com/image.jpg"
                    style={{ width: '100%' }}
                />
            )}

            {value && (
                <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={value} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                </div>
            )}
        </div>
    )
}
