import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Calendar, User, FolderOpen, Tag, FileText, Eye } from 'lucide-react'
import { PRODUCTS } from '../data/sampleData'
import { MediaViewer } from './MediaViewer'

function Meta({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <Icon size={14} style={{ color: 'var(--text-faint)', marginTop: '2px', flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: 'var(--font-label)', fontSize: '0.6875rem', color: 'var(--text-faint)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{value}</div>
      </div>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const CATEGORY_BADGE = {
  Presentations: 'badge-gold', BRD: 'badge-gold',
  Recordings: 'badge-error', Documents: 'badge-neutral',
  Spreadsheets: 'badge-green', Training: 'badge-forest', General: 'badge-neutral',
}

const PREVIEWABLE = ['.mp4', '.mkv', '.avi', '.mov', '.pdf', '.pptx', '.docx', '.xlsx']

export default function DocumentDetail({ doc, onBack }) {
  if (!doc) return null

  const product = PRODUCTS.find((p) => p.id === doc.productId)
  const hasPreview = PREVIEWABLE.includes(doc.extension)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      style={{ padding: '28px 32px 64px', maxWidth: '1100px' }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="btn btn-ghost btn-sm"
        style={{ gap: '6px', marginBottom: '24px', paddingLeft: '6px' }}
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '28px', alignItems: 'flex-start' }}>

        {/* Main content */}
        <div>
          {/* Header card */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)', padding: '28px', marginBottom: '20px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: 'var(--gradient-gold)',
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <span style={{ fontSize: '3rem', lineHeight: 1, flexShrink: 0 }}>{doc.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span className={`badge ${CATEGORY_BADGE[doc.category] || 'badge-neutral'}`}>{doc.category}</span>
                  {product && <span className="badge badge-forest">{product.shortName}</span>}
                  {doc.isMedia && <span className="badge badge-error">Media</span>}
                  {hasPreview && <span className="badge badge-neutral" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={9} /> Preview</span>}
                </div>
                <h1 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', margin: '0 0 8px', wordBreak: 'break-word' }}>
                  {doc.name}
                </h1>
                {doc.snippet && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.65, margin: 0 }}>
                    {doc.snippet}
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            {doc.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '18px' }}>
                {doc.tags.map((t) => (
                  <span key={t} style={{
                    fontFamily: 'var(--font-label)', fontSize: '0.6875rem', fontWeight: 500,
                    letterSpacing: '0.07em', textTransform: 'uppercase',
                    color: 'var(--text-faint)', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    padding: '3px 9px', borderRadius: 'var(--radius-pill)',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <Tag size={9} />{t}
                  </span>
                ))}
              </div>
            )}

            {/* Open in SharePoint */}
            {doc.webUrl && doc.webUrl !== '#' && (
              <div style={{ marginTop: '20px' }}>
                <a
                  href={doc.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', gap: '6px' }}
                >
                  <ExternalLink size={13} /> Open in SharePoint
                </a>
              </div>
            )}
          </div>

          {/* ── Media / Office Preview ── */}
          {hasPreview && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Eye size={14} style={{ color: 'var(--gold-400)' }} />
                <span className="section-label" style={{ margin: 0 }}>
                  {doc.isMedia ? 'Media Player' : 'Document Preview'}
                </span>
              </div>
              <MediaViewer doc={doc} />
            </div>
          )}

          {/* ── Extracted text content ── */}
          {!doc.isMedia && doc.content && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)', padding: '28px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <FileText size={15} style={{ color: 'var(--gold-400)' }} />
                <span className="section-label" style={{ margin: 0 }}>Extracted Content</span>
              </div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '0.9375rem',
                color: 'var(--text-secondary)', lineHeight: 1.75,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {doc.content}
              </div>
            </div>
          )}

          {/* No content */}
          {!hasPreview && !doc.content && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)', padding: '40px', textAlign: 'center', color: 'var(--text-muted)',
            }}>
              <p style={{ fontSize: '0.875rem' }}>No extracted content available. Open in SharePoint to view.</p>
              {doc.webUrl && doc.webUrl !== '#' && (
                <a href={doc.webUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ marginTop: '16px', display: 'inline-flex', gap: '6px' }}>
                  <ExternalLink size={14} /> Open in SharePoint
                </a>
              )}
            </div>
          )}
        </div>

        {/* Sidebar metadata */}
        <aside>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)', padding: '20px',
            position: 'sticky', top: '80px',
          }}>
            <div className="section-label" style={{ marginBottom: '12px' }}>Document Info</div>
            <Meta icon={FolderOpen} label="Folder" value={doc.folderPath || '/'} />
            <Meta icon={User} label="Author" value={doc.author} />
            <Meta icon={Calendar} label="Last Modified" value={formatDate(doc.modified)} />
            <Meta icon={Calendar} label="Created" value={formatDate(doc.created)} />
            <Meta icon={FileText} label="Size" value={doc.sizeLabel} />
            <Meta icon={FileText} label="Format" value={doc.extension?.toUpperCase().replace('.', '')} />
            {product && (
              <div style={{ marginTop: '16px' }}>
                <div className="section-label" style={{ marginBottom: '10px' }}>Product</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px', background: product.colorBg,
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ fontSize: '1.25rem' }}>{product.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{product.shortName}</div>
                    <span className={`badge ${product.status === 'live' ? 'badge-green' : 'badge-gold'}`} style={{ marginTop: '4px' }}>
                      {product.status === 'live' ? 'Live' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 900px) {
          aside { display: none; }
        }
      `}</style>
    </motion.div>
  )
}

