import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, SlidersHorizontal, LayoutGrid, List,
  X, ChevronDown, ArrowUpDown,
} from 'lucide-react'
import { CATEGORIES } from '../data/sampleData'
import DocumentCard from './DocumentCard'

const SORT_OPTIONS = [
  { value: 'modified', label: 'Recently Modified' },
  { value: 'name', label: 'Name A–Z' },
]

function FilterChip({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '5px 14px', borderRadius: 'var(--radius-pill)',
        border: `1px solid ${active ? 'var(--gold-400)' : 'var(--border-default)'}`,
        background: active ? 'rgba(229,182,17,0.12)' : 'transparent',
        color: active ? 'var(--gold-400)' : 'var(--text-muted)',
        fontFamily: 'var(--font-label)', fontWeight: 500, fontSize: '0.8125rem',
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'all var(--transition-fast)',
      }}
    >
      {label}
      {count != null && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
          color: active ? 'var(--gold-400)' : 'var(--text-faint)',
        }}>
          {count}
        </span>
      )}
    </button>
  )
}

export default function BrowsePage({
  documents,
  query, onQueryChange,
  category, onCategoryChange,
  sortBy, onSortChange,
  viewMode, onViewModeChange,
  results,
  hasFilters, onReset,
  onDocClick,
  productId,
  productFilter,
}) {
  const catCounts = documents.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1
    return acc
  }, {})

  return (
    <div style={{ padding: '28px 32px 64px', maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <p className="section-label" style={{ marginBottom: '4px' }}>
          {productFilter ? productFilter.shortName : 'Knowledge Base'}
        </p>
        <h2 style={{ margin: '0 0 6px' }}>
          {productFilter ? productFilter.name : 'All Documents'}
        </h2>
        {productFilter && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '560px', lineHeight: 1.6 }}>
            {productFilter.description}
          </p>
        )}
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', maxWidth: '560px', marginBottom: '20px' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }} />
        <input
          className="input"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={`Search ${productFilter ? productFilter.shortName + ' ' : ''}documents…`}
          style={{ paddingLeft: '36px', paddingRight: query ? '36px' : '12px' }}
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)', padding: '4px' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {/* Category chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
          {CATEGORIES.map(({ id, label }) => (
            <FilterChip
              key={id}
              label={label}
              active={category === id}
              count={id !== 'all' ? catCounts[id] : null}
              onClick={() => onCategoryChange(id === category ? 'all' : id)}
            />
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <ArrowUpDown size={13} style={{ color: 'var(--text-faint)' }} />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)',
              fontFamily: 'var(--font-label)', fontSize: '0.8125rem', padding: '5px 8px',
              cursor: 'pointer', outline: 'none',
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* View toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
          }}>
            {[
              { mode: 'grid', Icon: LayoutGrid },
              { mode: 'list', Icon: List },
            ].map(({ mode, Icon }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                style={{
                  padding: '6px 10px', border: 'none', cursor: 'pointer',
                  background: viewMode === mode ? 'var(--bg-card)' : 'transparent',
                  color: viewMode === mode ? 'var(--gold-400)' : 'var(--text-faint)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          {/* Reset */}
          {hasFilters && (
            <button
              onClick={onReset}
              className="btn btn-ghost btn-sm"
              style={{ gap: '4px', padding: '5px 10px' }}
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div style={{
        fontFamily: 'var(--font-label)', fontSize: '0.75rem',
        color: 'var(--text-faint)', marginBottom: '16px',
        letterSpacing: '0.04em',
      }}>
        {results.length} document{results.length !== 1 ? 's' : ''}
        {query && <> matching <strong style={{ color: 'var(--gold-400)' }}>"{query}"</strong></>}
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {results.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              textAlign: 'center', padding: '80px 20px',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No documents found</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>Try different keywords or clear your filters</p>
            {hasFilters && (
              <button className="btn btn-secondary" onClick={onReset} style={{ marginTop: '20px' }}>
                Clear filters
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`${viewMode}-${category}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={viewMode === 'grid' ? {
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '14px',
            } : {
              display: 'flex', flexDirection: 'column', gap: '8px',
            }}
          >
            {results.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <DocumentCard doc={doc} onClick={onDocClick} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
