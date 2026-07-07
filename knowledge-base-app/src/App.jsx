import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'

import { useDocuments } from './hooks/useDocuments'
import { useSearch } from './hooks/useSearch'

import Nav from './components/Nav'
import Sidebar from './components/Sidebar'
import HomePage from './components/HomePage'
import BrowsePage from './components/BrowsePage'
import DocumentDetail from './components/DocumentDetail'
import DataIngestion from './components/DataIngestion'

export default function App() {
  // ── Routing state ──────────────────────────────────────────
  const [page, setPage] = useState('home')
  const [productId, setProductId] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)

  // ── Data ───────────────────────────────────────────────────
  const { documents: fetchedDocs, loading, source: fetchedSource, stats: fetchedStats, products: fetchedProducts, meta } = useDocuments()
  // Allow overriding via manual file upload from ConnectPanel
  const [uploadedDocs, setUploadedDocs] = useState(null)
  const documents = uploadedDocs?.documents ?? fetchedDocs
  const source = uploadedDocs ? 'sharepoint' : fetchedSource
  const products = fetchedProducts
  const stats = useMemo(() => ({
    total: documents.length,
    byCategory: documents.reduce((acc, d) => { acc[d.category] = (acc[d.category] || 0) + 1; return acc }, {}),
    recordings: documents.filter((d) => d.isMedia).length,
    presentations: documents.filter((d) => d.extension === '.pptx').length,
    brds: documents.filter((d) => d.category === 'BRD').length,
  }), [documents])

  // ── Search / filter ────────────────────────────────────────
  const {
    query, setQuery,
    category, setCategory,
    sortBy, setSortBy,
    viewMode, setViewMode,
    results,
    hasFilters, reset,
    setProductId: setSearchProductId,
  } = useSearch(documents)

  // ── Navigation helpers ─────────────────────────────────────
  function navigate(target, param = null) {
    setSidebarOpen(false)
    if (target === 'home') {
      setPage('home'); setProductId(null); setSelectedDoc(null); reset()
    } else if (target === 'browse') {
      setPage('browse'); setProductId(null); setSearchProductId(null); setSelectedDoc(null)
    } else if (target === 'product') {
      setPage('product'); setProductId(param); setSearchProductId(param)
      setSelectedDoc(null); setCategory('all'); setQuery('')
    }
  }

  function openDocument(doc) {
    setSelectedDoc(doc); setPage('document')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setSelectedDoc(null)
    setPage(productId ? 'product' : 'browse')
  }

  const recentDocs = useMemo(() =>
    [...documents].sort((a, b) => new Date(b.modified) - new Date(a.modified)).slice(0, 5),
    [documents]
  )

  const currentProduct = products.find((p) => p.id === productId)

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', animation: 'pulseGold 1.5s ease-in-out infinite' }}>⚡</div>
        <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading knowledge base…</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>

      <Nav
        query={query}
        onQueryChange={(q) => {
          setQuery(q)
          if (page !== 'browse' && page !== 'product') { setPage('browse'); setSearchProductId(null); setProductId(null) }
        }}
        onSearch={() => { if (page !== 'browse' && page !== 'product') setPage('browse') }}
        source={source}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
        menuOpen={sidebarOpen}
        onConnectClick={() => setConnectOpen(true)}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          page={page} productId={productId} onNavigate={navigate}
          stats={stats} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
          products={products}
        />

        <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            {page === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HomePage onNavigate={navigate} stats={stats} recentDocs={recentDocs} products={products} meta={meta} />
              </motion.div>
            )}
            {(page === 'browse' || page === 'product') && (
              <motion.div key={`browse-${productId}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BrowsePage
                  documents={documents} query={query} onQueryChange={setQuery}
                  category={category} onCategoryChange={setCategory}
                  sortBy={sortBy} onSortChange={setSortBy}
                  viewMode={viewMode} onViewModeChange={setViewMode}
                  results={results} hasFilters={hasFilters} onReset={reset}
                  onDocClick={openDocument} productId={productId} productFilter={currentProduct}
                />
              </motion.div>
            )}
            {page === 'document' && selectedDoc && (
              <motion.div key={`doc-${selectedDoc.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DocumentDetail doc={selectedDoc} onBack={handleBack} products={products} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Data Ingestion panel */}
      <DataIngestion
        isOpen={connectOpen}
        onClose={() => setConnectOpen(false)}
        source={source}
        onData={(data) => { setUploadedDocs(data); setConnectOpen(false) }}
      />
    </div>
  )
}

