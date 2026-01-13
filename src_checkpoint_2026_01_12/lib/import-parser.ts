export type ImportRow = {
    [key: string]: string | undefined
}

export function parseCSV(content: string): ImportRow[] {
    const lines = content.split(/\r?\n/).filter(line => line.trim())
    if (lines.length === 0) return []

    // Simple CSV parser - splits by comma, handles basic quotes
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''))

    const rows = lines.slice(1).map(line => {
        // Handle quoted values that may contain commas
        const values: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
            const char = line[i]

            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
        values.push(current.trim()) // Push last value

        const row: ImportRow = {}
        headers.forEach((header, index) => {
            let val = values[index] || ''
            // Clean quotes
            val = val.replace(/^"|"$/g, '').trim()
            row[header] = val
        })
        return row
    })

    return rows
}

// Logic to guess if a row is LEGO or COIN
export function guessCategory(row: ImportRow): 'lego' | 'coins' | 'generic' {
    const keys = Object.keys(row).join(' ')
    const values = Object.values(row).join(' ').toLowerCase()

    if (keys.includes('set_num') || keys.includes('lego') || values.includes('lego')) {
        return 'lego'
    }

    if (keys.includes('denomination') || keys.includes('metal') || keys.includes('mint') || values.includes('coin') || values.includes('quarter')) {
        return 'coins'
    }

    return 'generic'
}
