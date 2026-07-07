import { ExternalLink, Calendar, User, Tag } from 'lucide-react'

const CATEGORY_BADGE = {
  Presentations: 'badge-gold',
  BRD:           'badge-gold',
  Recordings:    'badge-error',
  Documents:     'badge-neutral',
  Spreadsheets:  'badge-green',
  Training:      'badge-forest',
  General:       'badge-neutral',
}

const EXT_COLOR = {
  '.pptx': 'var(--gold-400)',
  '.docx': '#60A5FA',
  '.pdf':  '#F97316',
  '.xlsx': 'var(--forest-400)',
  '.mp4':  '#FB7185',
  '.mp3':  '#C084FC',
  '.txt':  'var(--text-muted)',
  '.md':   'var(--text-muted)',
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DocumentCard({ doc, onClick, viewMode = 'grid' }) {
  const badgeClass = CATEGORY_BADGE[doc.category] || 'badge-neutral'
  const extColor = EXT_COLOR[doc.extension] || 'var(--text-muted)'

  if (viewMode === 'list') {
    return (
      <button
        onClick={() => onClick(doc)}
        style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          width: '100%', padding: '14px 18px',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left',
          transition: 'all var(--transition-normal)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-gold)'
          e.currentTarget.style.background = 'var(--bg-elevated)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)'
          e.currentTarget.style.background = 'var(--bg-card)'
        }}
      >
        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{doc.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem',
            color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{doc.name}</div>
          {doc.snippet && (
            <div style={{
              fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{doc.snippet}</div>
          )}
        </div>
        <span className={`badge ${badgeClass}`} style={{ flexShrink: 0 }}>{doc.category}</span>
        <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', color: 'var(--text-faint)', flexShrink: 0, minWidth: '80px', textAlign: 'right' }}>
          {formatDate(doc.modified)}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: extColor, flexShrink: 0 }}>
          {doc.extension}
        </span>
      </button>
    )
  }

  // Grid card
  return (
    <button
      onClick={() => onClick(doc)}
      className="card"
      style={{
        display: 'flex', flexDirection: 'column', padding: '18px',
        cursor: 'pointer', textAlign: 'left', width: '100%', border: 'none',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '2rem', lineHeight: 1 }}>{doc.icon}</span>
        <span className={`badge ${badgeClass}`}>{doc.category}</span>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9375rem',
        color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: '8px',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {doc.name}
      </div>

      {/* Snippet */}
      {doc.snippet && (
        <div style={{
          fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', marginBottom: '14px', flex: 1,
        }}>
          {doc.snippet}
        </div>
      )}

      {/* Tags */}
      {doc.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {doc.tags.slice(0, 3).map((t) => (
            <span key={t} style={{
              fontFamily: 'var(--font-label)', fontSize: '0.625rem', fontWeight: 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: 'var(--text-faint)', background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              padding: '2px 7px', borderRadius: 'var(--radius-pill)',
            }}>{t}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', marginTop: 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={11} style={{ color: 'var(--text-faint)' }} />
          <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.6875rem', color: 'var(--text-faint)' }}>
            {formatDate(doc.modified)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
            color: extColor, fontWeight: 600,
          }}>{doc.extension}</span>
          <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.6875rem', color: 'var(--text-faint)' }}>
            {doc.sizeLabel}
          </span>
        </div>
      </div>
    </button>
  )
}
