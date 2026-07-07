import { useState, useEffect, useMemo } from 'react'
import { SAMPLE_DOCUMENTS, STATS, PRODUCTS as SAMPLE_PRODUCTS } from '../data/sampleData'

// ── Colour palette cycled for dynamic products ────────────────────────────
const PRODUCT_COLORS = [
  { color: 'var(--gold-400)',   colorBg: 'rgba(229,182,17,0.1)' },
  { color: 'var(--forest-400)', colorBg: 'rgba(0,176,80,0.1)' },
  { color: '#60A5FA',           colorBg: 'rgba(96,165,250,0.1)' },
  { color: '#C084FC',           colorBg: 'rgba(192,132,252,0.1)' },
  { color: '#F97316',           colorBg: 'rgba(249,115,22,0.1)' },
  { color: '#FB7185',           colorBg: 'rgba(251,113,133,0.1)' },
  { color: '#34D399',           colorBg: 'rgba(52,211,153,0.1)' },
  { color: '#FBBF24',           colorBg: 'rgba(251,191,36,0.1)' },
]

const CAT_ICONS = {
  Recordings: '🎥', Presentations: '📊', BRD: '📋', Spreadsheets: '📈',
  Documents: '📝', Training: '📚', Reports: '📉', Architecture: '🏗️',
  'Meeting Notes': '🗒️', SOW: '📃', General: '📁',
}

// Known display names for well-known product IDs
const KNOWN_NAMES = {
  'circular-plan':     'Circular Plan (Retpack)',
  'demand-cockpit':    'Demand Planning Cockpit',
  'material-planning': 'E2E Material Planning',
  'o9-adoption':       'O9 Adoption & Touchless',
  'core-design':       'Core-Design Planning',
  'o2d':               'Order Management (O2D)',
}

function formatProductName(id) {
  return KNOWN_NAMES[id] || id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Derive a PRODUCTS array dynamically from indexed documents.
 * Groups by productId, builds name/icon/color/kpis automatically.
 */
export function deriveProducts(documents) {
  const groups = {}
  documents.forEach(doc => {
    const pid = doc.productId
    if (!pid) return
    if (!groups[pid]) groups[pid] = []
    groups[pid].push(doc)
  })

  return Object.entries(groups)
    .sort((a, b) => b[1].length - a[1].length)   // most docs first
    .map(([id, docs], i) => {
      const { color, colorBg } = PRODUCT_COLORS[i % PRODUCT_COLORS.length]

      // Category breakdown
      const catCounts = {}
      docs.forEach(d => { catCounts[d.category] = (catCounts[d.category] || 0) + 1 })
      const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1])
      const topCat = topCats[0]?.[0] || 'General'

      const kpis = [
        ...topCats.slice(0, 1).map(([cat, count]) => ({ label: cat, value: String(count) })),
        { label: 'Total Files', value: String(docs.length) },
      ]

      const catSummary = topCats.slice(0, 3).map(([c, n]) => `${n} ${c}`).join(' · ')

      return {
        id,
        name:        formatProductName(id),
        shortName:   formatProductName(id).split(/[:(]/)[0].trim(),
        description: catSummary || `${docs.length} documents`,
        icon:        CAT_ICONS[topCat] || '📁',
        color,
        colorBg,
        kpis,
        status:      'live',
        docCount:    docs.length,
      }
    })
}

/**
 * Load documents from /data/documents.json.
 * Falls back to sample data if empty or unavailable.
 */
export function useDocuments() {
  const [documents, setDocuments] = useState([])
  const [meta, setMeta]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [source, setSource]       = useState('sample')

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data/documents.json`
    fetch(url)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json() })
      .then(data => {
        const docs = data.documents || []
        if (docs.length === 0) throw new Error('empty')
        setDocuments(docs)
        setMeta({
          generated:      data.generated,
          totalDocuments: data.totalDocuments,
          sourceFolder:   data.sourceFolder,
          source:         data.source,
        })
        setSource('live')
      })
      .catch(() => {
        setDocuments(SAMPLE_DOCUMENTS)
        setMeta({ generated: STATS.lastUpdated, totalDocuments: SAMPLE_DOCUMENTS.length })
        setSource('sample')
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => ({
    total:         documents.length,
    byCategory:    documents.reduce((acc, d) => { acc[d.category] = (acc[d.category] || 0) + 1; return acc }, {}),
    recordings:    documents.filter(d => d.isMedia).length,
    presentations: documents.filter(d => d.extension === '.pptx').length,
    brds:          documents.filter(d => d.category === 'BRD').length,
  }), [documents])

  // Dynamically build products from actual documents.
  // Falls back to sample PRODUCTS when showing sample data.
  const products = useMemo(() =>
    source === 'sample' ? SAMPLE_PRODUCTS : deriveProducts(documents),
    [documents, source]
  )

  return { documents, meta, loading, source, stats, products }
}
