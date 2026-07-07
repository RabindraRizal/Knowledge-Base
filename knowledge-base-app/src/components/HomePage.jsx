import { motion } from 'framer-motion'
import { ArrowRight, FileText, Video, BarChart2, Layers, Zap, TrendingUp } from 'lucide-react'

const RECENT_ICONS = { Presentations: BarChart2, BRD: FileText, Recordings: Video, Spreadsheets: TrendingUp }

function StatCard({ value, label, icon: Icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="kpi-card"
      style={{ flex: '1 1 140px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="kpi-value" style={{ color }}>{value}</div>
          <div className="kpi-label">{label}</div>
        </div>
        <Icon size={20} style={{ color, opacity: 0.6 }} />
      </div>
    </motion.div>
  )
}

function ProductCard({ product, onClick, delay }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => onClick('product', product.id)}
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)', padding: '22px',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all var(--transition-normal)',
        position: 'relative', overflow: 'hidden',
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-gold)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card), 0 0 20px rgba(229,182,17,0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)'
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* Colour accent strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, ${product.color}, transparent)`,
      }} />

      {/* Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontSize: '2rem' }}>{product.icon}</span>
        <span className={`badge ${product.status === 'live' ? 'badge-green' : 'badge-gold'}`}>
          {product.status === 'live' ? 'Live' : 'In Progress'}
        </span>
      </div>

      {/* Name */}
      <div style={{
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem',
        color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.3,
      }}>
        {product.name}
      </div>

      {/* Description */}
      <div style={{
        fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55, flex: 1,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {product.description}
      </div>

      {/* KPIs */}
      <div style={{
        display: 'flex', gap: '12px', marginTop: '16px',
        paddingTop: '14px', borderTop: '1px solid var(--border-subtle)',
      }}>
        {product.kpis.map((kpi) => (
          <div key={kpi.label}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: product.color }}>
              {kpi.value}
            </div>
            <div style={{ fontFamily: 'var(--font-label)', fontSize: '0.625rem', color: 'var(--text-faint)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {kpi.label}
            </div>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end' }}>
          <ArrowRight size={14} style={{ color: 'var(--text-faint)' }} />
        </div>
      </div>
    </motion.button>
  )
}

export default function HomePage({ onNavigate, stats, recentDocs, products = [], meta }) {
  const projectName = meta?.sourceFolder
    ? meta.sourceFolder.split(/[\\/]/).pop()
    : 'GCC 2026 AI Planning'
  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: '1200px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '40px' }}
      >
        <div style={{
          background: 'var(--gradient-hero)', borderRadius: 'var(--radius-xl)',
          padding: '40px', border: '1px solid var(--border-subtle)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 0% 0%, rgba(229,182,17,0.06) 0%, transparent 50%)',
            pointerEvents: 'none',
          }} />
          <p className="section-label" style={{ marginBottom: '8px' }}>AB InBev · GCC 2026</p>
          <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
            {projectName} <span style={{ color: 'var(--gold-400)' }}>Knowledge Base</span>
          </h1>
          <p style={{
            color: 'var(--text-muted)', fontSize: '1.0625rem', maxWidth: '560px',
            lineHeight: 1.65, marginBottom: '28px',
          }}>
            Centralised repository for {products.length > 0 ? `${products.length} project${products.length !== 1 ? 's' : ''}` : 'all projects'} — {stats?.total ?? 0} documents including recordings, BRDs, presentations, and spreadsheets.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => onNavigate('browse')}>
              <Layers size={15} /> Browse All Documents
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('browse')}>
              <Zap size={15} /> Quick Search
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <StatCard value={stats?.total ?? '—'} label="Total Documents" icon={FileText} color="var(--gold-400)" />
        <StatCard value={stats?.recordings ?? '—'} label="Recordings" icon={Video} color="#FB7185" />
        <StatCard value={stats?.brds ?? '—'} label="BRDs" icon={FileText} color="#60A5FA" />
        <StatCard value={stats?.presentations ?? '—'} label="Presentations" icon={BarChart2} color="var(--gold-300)" />
        <StatCard value={products.length} label="Projects" icon={Zap} color="var(--forest-400)" />
      </div>

      {/* Products grid */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Planning Products</h2>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onNavigate('browse')}
            style={{ gap: '4px' }}
          >
            View all <ArrowRight size={13} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} onClick={onNavigate} delay={i * 0.07} />
          ))}
        </div>
      </div>

      {/* Recent documents */}
      {recentDocs?.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Recent Documents</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('browse')} style={{ gap: '4px' }}>
              See all <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentDocs.slice(0, 5).map((doc, i) => {
              const Icon = RECENT_ICONS[doc.category] || FileText
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 16px', background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{doc.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontFamily: 'var(--font-label)' }}>
                      {doc.folderPath} · {doc.sizeLabel}
                    </div>
                  </div>
                  <span className={`badge badge-${doc.category === 'Recordings' ? 'error' : doc.category === 'BRD' ? 'gold' : 'neutral'}`}>
                    {doc.category}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
