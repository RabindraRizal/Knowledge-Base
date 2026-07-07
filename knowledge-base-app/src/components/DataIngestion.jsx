import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Upload, Link2, HelpCircle, CheckCircle2, AlertCircle,
  Loader2, FileText, Download, ExternalLink, Send,
  ChevronRight, Zap, Shield, GitMerge, RefreshCw,
} from 'lucide-react'
import { processFiles } from '../services/fileExtractor'

const REPO       = 'RabindraRizal/Knowledge-Base'
const ISSUES_URL = `https://github.com/${REPO}/issues/new?template=data-update.yml`
const PAGES_URL  = 'https://rabindrarizal.github.io/Knowledge-Base/'

const TABS = [
  { id: 'upload', label: 'Upload Files',   icon: Upload },
  { id: 'link',   label: 'SharePoint URL', icon: Link2 },
  { id: 'how',    label: 'How It Works',   icon: HelpCircle },
]

// ── Upload Tab ─────────────────────────────────────────────────────────────
function UploadTab({ onData }) {
  const [dragging, setDragging]   = useState(false)
  const [progress, setProgress]   = useState(null)
  const [extracted, setExtracted] = useState(null)   // { documents, count }
  const [error, setError]         = useState(null)
  const inputRef = useRef()

  const handle = useCallback(async (fileList) => {
    const files = Array.from(fileList)
    if (!files.length) return
    setExtracted(null)
    setError(null)
    setProgress({ current: 0, total: files.length, name: '' })
    try {
      const data = await processFiles(files, setProgress)
      setExtracted(data)
      onData(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setProgress(null)
    }
  }, [onData])

  function downloadJson() {
    if (!extracted) return
    const blob = new Blob([JSON.stringify(extracted, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'documents.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
        Drop your project files — text is extracted in your browser.
        Nothing leaves your machine until you choose to submit.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--gold-400)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-xl)', padding: '40px 20px', textAlign: 'center',
          background: dragging ? 'rgba(229,182,17,0.06)' : 'var(--bg-elevated)',
          cursor: 'pointer', transition: 'all var(--transition-normal)',
          marginBottom: '16px',
        }}
      >
        {progress ? (
          <div>
            <Loader2 size={28} style={{ color: 'var(--gold-400)', marginBottom: '12px', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              Processing {progress.current} / {progress.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {progress.name}
            </div>
            <div style={{ height: '3px', background: 'var(--border-default)', borderRadius: '2px', maxWidth: '200px', margin: '14px auto 0' }}>
              <div style={{
                height: '100%', borderRadius: '2px', background: 'var(--gradient-gold)',
                width: `${(progress.current / progress.total) * 100}%`,
                transition: 'width 0.2s',
              }} />
            </div>
          </div>
        ) : (
          <>
            <Upload size={28} style={{ color: 'var(--text-faint)', marginBottom: '12px' }} />
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
              Drop files here
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', marginTop: '6px' }}>
              PPTX · DOCX · XLSX · CSV · TXT · PDF — or click to browse
            </div>
          </>
        )}
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }}
          onChange={e => handle(e.target.files)} />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              display: 'flex', gap: '10px', alignItems: 'center',
              background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)',
              color: '#FF6666', fontSize: '0.875rem', marginBottom: '12px',
            }}
          >
            <AlertCircle size={16} /> {error}
          </motion.div>
        )}

        {extracted && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Success banner */}
            <div style={{
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              display: 'flex', gap: '10px', alignItems: 'center',
              background: 'rgba(0,176,80,0.08)', border: '1px solid rgba(0,176,80,0.3)',
              color: 'var(--forest-400)', fontSize: '0.875rem', marginBottom: '20px',
            }}>
              <CheckCircle2 size={16} />
              <span><strong>{extracted.documents?.length ?? 0} files</strong> extracted and loaded into the app</span>
            </div>

            {/* How to submit section */}
            <div style={{
              background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-subtle)', overflow: 'hidden', marginBottom: '16px',
            }}>
              <div style={{
                padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(229,182,17,0.06)',
              }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  Submit for Admin Approval
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Follow these 3 steps to update the live site
                </div>
              </div>

              <div style={{ padding: '18px' }}>
                {/* Step 1 */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                  <StepNum n="1" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Download your data package
                    </div>
                    <button onClick={downloadJson} className="btn btn-primary" style={{ gap: '7px', fontSize: '0.875rem', padding: '9px 16px' }}>
                      <Download size={15} /> Download documents.json
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                  <StepNum n="2" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Open the submission form
                    </div>
                    <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer"
                      className="btn" style={{ gap: '7px', fontSize: '0.875rem', padding: '9px 16px', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                      <Send size={15} /> Open GitHub Request Form
                      <ExternalLink size={12} style={{ opacity: 0.6 }} />
                    </a>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <StepNum n="3" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Attach the file &amp; submit
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      In the GitHub form, <strong style={{ color: 'var(--text-secondary)' }}>drag your documents.json</strong> into the attachment box.
                      Submit the form — the admin gets an email and approves. Site refreshes automatically. ✅
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function StepNum({ n }) {
  return (
    <div style={{
      width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
      background: 'var(--gradient-gold)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.75rem', color: '#000',
    }}>{n}</div>
  )
}

// ── SharePoint Link Tab ────────────────────────────────────────────────────
function LinkTab() {
  const [url, setUrl]   = useState('')
  const [desc, setDesc] = useState('')
  const [sent, setSent] = useState(false)

  function openIssue() {
    if (!url.trim()) return
    const title = encodeURIComponent(`Data Update Request - SharePoint: ${desc || 'new content'}`)
    const body  = encodeURIComponent(
      `## SharePoint Reference\n\n**URL:** ${url}\n\n**Description:** ${desc || '(see URL)'}\n\n` +
      `> The admin will review this link and fetch the content.`
    )
    window.open(
      `https://github.com/${REPO}/issues/new?title=${title}&body=${body}&labels=data-update`,
      '_blank', 'noopener,noreferrer'
    )
    setSent(true)
  }

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
        Paste a SharePoint folder or file link. The admin will be notified and can fetch the content.
      </p>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontFamily: 'var(--font-label)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          SharePoint URL *
        </label>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://anheuserbuschinbev.sharepoint.com/sites/..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontFamily: 'var(--font-label)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          What's in this folder? (optional)
        </label>
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={3}
          placeholder="e.g. Q2 planning decks, BRD documents for Demand Cockpit..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.875rem',
            outline: 'none', resize: 'vertical', boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={openIssue}
        disabled={!url.trim()}
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', gap: '8px', opacity: url.trim() ? 1 : 0.4 }}
      >
        <Send size={16} /> Submit Request
        <ExternalLink size={13} style={{ opacity: 0.7 }} />
      </button>

      <AnimatePresence>
        {sent && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '16px', padding: '12px 16px', borderRadius: 'var(--radius-md)',
              background: 'rgba(0,176,80,0.08)', border: '1px solid rgba(0,176,80,0.3)',
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              fontSize: '0.875rem', color: 'var(--forest-400)',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>Request submitted! The admin has been notified and will review shortly.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        marginTop: '24px', padding: '14px 16px', borderRadius: 'var(--radius-lg)',
        background: 'rgba(229,182,17,0.05)', border: '1px solid var(--border-subtle)',
        fontSize: '0.8125rem', color: 'var(--text-faint)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text-muted)' }}>Note:</strong> The admin will be notified via email.
        They can approve and the agent will attempt to fetch the content. For private SharePoint sites
        that require login, the admin may need to download files manually and re-upload them.
      </div>
    </div>
  )
}

// ── How It Works Tab ───────────────────────────────────────────────────────
function HowTab() {
  const steps = [
    { icon: Upload,    color: 'var(--gold-400)',    title: 'You submit',        desc: 'Upload files or paste a SharePoint link. Text is extracted in your browser.' },
    { icon: Send,      color: 'var(--gold-500)',    title: 'Request sent',      desc: 'A GitHub Issue is created. The admin gets an email notification instantly.' },
    { icon: Shield,    color: 'var(--forest-400)',  title: 'Admin reviews',     desc: 'Admin checks the content and adds the "approved" label to the issue.' },
    { icon: GitMerge,  color: 'var(--forest-500)',  title: 'Agent runs',        desc: 'GitHub Actions picks up the approval, downloads the data, and commits it.' },
    { icon: RefreshCw, color: 'var(--gold-400)',    title: 'Site refreshes',    desc: 'The Knowledge Base rebuilds automatically. Live in ~2 minutes.' },
  ]

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
        No server required. No Azure AD. No credentials in the browser.
        Everything runs through GitHub — free, auditable, and approval-gated.
      </p>

      <div style={{ position: 'relative' }}>
        {/* vertical connector */}
        <div style={{
          position: 'absolute', left: '19px', top: '28px',
          bottom: '28px', width: '2px', background: 'var(--border-subtle)',
        }} />

        {steps.map(({ icon: Icon, color, title, desc }) => (
          <div key={title} style={{ display: 'flex', gap: '16px', marginBottom: '24px', position: 'relative' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
              background: 'var(--bg-elevated)', border: `2px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1,
            }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div style={{ paddingTop: '8px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '3px' }}>{title}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '4px' }}>
        <div className="section-label" style={{ marginBottom: '12px' }}>Quick links</div>
        {[
          { label: 'Live Knowledge Base site',   url: PAGES_URL },
          { label: 'Submit a data update',        url: `https://github.com/${REPO}/issues/new?template=data-update.yml` },
          { label: 'View pending requests',        url: `https://github.com/${REPO}/issues?q=is%3Aopen+label%3Adata-update` },
          { label: 'Actions history',              url: `https://github.com/${REPO}/actions` },
        ].map(({ label, url }) => (
          <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 0', borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none',
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold-400)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            {label} <ExternalLink size={12} />
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Main Panel ─────────────────────────────────────────────────────────────
export default function DataIngestion({ isOpen, onClose, onData, source }) {
  const [tab, setTab] = useState('upload')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, backdropFilter: 'blur(4px)' }}
          />
          <motion.div key="panel"
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px', maxWidth: '96vw',
              background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)',
              zIndex: 201, display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px 0', borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <p className="section-label" style={{ margin: 0 }}>Knowledge Base</p>
                  <h2 style={{ margin: '2px 0 0', fontSize: '1.125rem' }}>Update Content</h2>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Source indicator */}
              {source === 'live' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px',
                  padding: '8px 12px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(0,176,80,0.08)', border: '1px solid rgba(0,176,80,0.25)',
                  fontSize: '0.8125rem', color: 'var(--forest-400)',
                }}>
                  <Zap size={13} />
                  Live data — {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '2px' }}>
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setTab(id)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '9px 8px', background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: tab === id ? '2px solid var(--gold-400)' : '2px solid transparent',
                    color: tab === id ? 'var(--gold-400)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-label)', fontWeight: 600, fontSize: '0.8125rem',
                    transition: 'all 0.15s',
                  }}>
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <AnimatePresence mode="wait">
                <motion.div key={tab}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {tab === 'upload' && <UploadTab onData={onData} />}
                  {tab === 'link'   && <LinkTab />}
                  {tab === 'how'    && <HowTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
