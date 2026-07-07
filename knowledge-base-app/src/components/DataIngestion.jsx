import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Upload, GitBranch, Settings, CheckCircle2, AlertCircle,
  Loader2, FileText, Play, RefreshCw, Copy, Check,
  ChevronRight, ExternalLink, Zap, Shield, Clock,
} from 'lucide-react'
import { processFiles } from '../services/fileExtractor'

const TABS = [
  { id: 'upload',   label: 'Upload Files',   icon: Upload },
  { id: 'actions',  label: 'Auto-Fetch',     icon: GitBranch },
  { id: 'setup',    label: 'Setup Guide',    icon: Settings },
]

const REPO = 'RabindraRizal/Knowledge-Base'
const ACTIONS_URL = `https://github.com/${REPO}/actions/workflows/fetch-data.yml`
const PAGES_URL   = 'https://rabindrarizal.github.io/Knowledge-Base/'

function CopyBtn({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: 'none', border: 'none', cursor: 'pointer', padding: '3px 8px',
      color: copied ? 'var(--forest-400)' : 'var(--text-faint)',
      fontFamily: 'var(--font-label)', fontSize: '0.75rem',
      borderRadius: 'var(--radius-sm)', transition: 'color 0.15s',
    }}>
      {copied ? <><Check size={11} />Copied</> : <><Copy size={11} />{label}</>}
    </button>
  )
}

function Code({ children }) {
  return (
    <div style={{
      background: 'var(--bg-base)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--gold-400)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px',
      marginTop: '6px',
    }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
      <CopyBtn text={children} />
    </div>
  )
}

function Step({ n, title, children }) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
      <div style={{
        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, marginTop: '1px',
        background: 'var(--gradient-gold)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.75rem', color: '#000',
      }}>{n}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  )
}

// ── Upload Tab ─────────────────────────────────────────────────────────────
function UploadTab({ onData }) {
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(null)   // { current, total, name }
  const [result, setResult]     = useState(null)   // { ok, count } | { error }
  const inputRef = useRef()

  const handle = useCallback(async (fileList) => {
    const files = Array.from(fileList)
    if (!files.length) return
    setResult(null)
    setProgress({ current: 0, total: files.length, name: '' })
    try {
      const data = await processFiles(files, setProgress)
      onData(data)
      setResult({ ok: true, count: data.documents.length })
    } catch (e) {
      setResult({ error: e.message })
    } finally {
      setProgress(null)
    }
  }, [onData])

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
        Drop any project files here — PPTX, DOCX, PDF, XLSX, CSV, TXT, MP4, etc.
        Text is extracted in your browser. No data leaves your machine.
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
            {/* Progress bar */}
            <div style={{ height: '3px', background: 'var(--border-default)', borderRadius: '2px', marginTop: '14px', maxWidth: '200px', margin: '14px auto 0' }}>
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
              Drop files or folders here
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', marginTop: '6px' }}>
              PPTX · DOCX · PDF · XLSX · CSV · MP4 · TXT — or click to browse
            </div>
          </>
        )}
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }}
          onChange={e => handle(e.target.files)} />
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', gap: '10px',
              background: result.ok ? 'rgba(0,176,80,0.08)' : 'rgba(255,0,0,0.08)',
              border: `1px solid ${result.ok ? 'rgba(0,176,80,0.3)' : 'rgba(255,0,0,0.2)'}`,
              color: result.ok ? 'var(--forest-400)' : '#FF6666',
              fontSize: '0.875rem', fontFamily: 'var(--font-body)',
            }}
          >
            {result.ok
              ? <><CheckCircle2 size={16} /> {result.count} files indexed and loaded into the app!</>
              : <><AlertCircle size={16} /> {result.error}</>
            }
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── GitHub Actions Tab ─────────────────────────────────────────────────────
function ActionsTab() {
  const [triggered, setTriggered] = useState(false)

  return (
    <div>
      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', borderRadius: 'var(--radius-lg)',
        background: 'rgba(229,182,17,0.07)', border: '1px solid var(--border-gold)',
        marginBottom: '24px',
      }}>
        <Zap size={16} style={{ color: 'var(--gold-400)', flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            Auto-Fetch via GitHub Actions
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1px' }}>
            Runs the SharePoint extractor on GitHub's servers → commits <code>documents.json</code> → site rebuilds automatically
          </div>
        </div>
      </div>

      {/* Flow diagram */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'You click Run', icon: Play },
          { label: 'Reviewer approves', icon: Shield },
          { label: 'Agent fetches SharePoint', icon: RefreshCw },
          { label: 'Site updates live', icon: Zap },
        ].map(({ label, icon: Icon }, i, arr) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-pill)', fontSize: '0.75rem',
              color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 500,
            }}>
              <Icon size={12} style={{ color: 'var(--gold-400)' }} />{label}
            </div>
            {i < arr.length - 1 && <ChevronRight size={13} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />}
          </div>
        ))}
      </div>

      {/* Main CTA */}
      <a
        href={ACTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setTriggered(true)}
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', marginBottom: '12px', gap: '8px' }}
      >
        <GitBranch size={16} /> Run Fetch Agent on GitHub
        <ExternalLink size={13} style={{ marginLeft: 'auto', opacity: 0.7 }} />
      </a>

      {triggered && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', textAlign: 'center', marginBottom: '16px' }}
        >
          Click <strong style={{ color: 'var(--text-muted)' }}>Run workflow</strong>, type <code>YES</code>, then wait for reviewer approval.
        </motion.p>
      )}

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
        <div className="section-label" style={{ marginBottom: '10px' }}>Useful links</div>
        {[
          { label: 'Live site (GitHub Pages)', url: PAGES_URL },
          { label: 'Actions dashboard', url: `https://github.com/${REPO}/actions` },
          { label: 'Repository', url: `https://github.com/${REPO}` },
          { label: 'Workflow run history', url: `https://github.com/${REPO}/actions/workflows/fetch-data.yml` },
        ].map(({ label, url }) => (
          <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
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

      {/* Timing */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px',
        fontSize: '0.8125rem', color: 'var(--text-faint)',
      }}>
        <Clock size={13} />
        Typical runtime: 3–8 min depending on document count. Site live ~2 min after.
      </div>
    </div>
  )
}

// ── Setup Guide Tab ────────────────────────────────────────────────────────
function SetupTab() {
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
        One-time setup — takes about 10 minutes. After this, any approved team member can refresh data with one click.
      </p>

      <Step n="1" title="Register an Azure AD App">
        Go to <a href="https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-400)' }}>Azure Portal → App registrations</a> → New registration.
        Name it <code>KB-SharePoint-Reader</code>. Choose <strong>Single tenant</strong>. No redirect URI needed.
      </Step>

      <Step n="2" title="Add API permissions">
        In your new app → <strong>API permissions</strong> → Add permission → Microsoft Graph → Application permissions.
        Add: <code>Sites.Read.All</code> and <code>Files.Read.All</code>.
        Then click <strong>Grant admin consent</strong>.
      </Step>

      <Step n="3" title="Create a client secret">
        In the app → <strong>Certificates & secrets</strong> → New client secret.
        Set expiry to 24 months. <strong>Copy the secret value immediately</strong> — you won't see it again.
      </Step>

      <Step n="4" title="Add GitHub Secrets">
        Go to{' '}
        <a href={`https://github.com/${REPO}/settings/secrets/actions`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-400)' }}>
          GitHub → Settings → Secrets and variables → Actions
        </a>. Add these three secrets:
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {['TENANT_ID — your Azure AD tenant ID', 'CLIENT_ID — Application (client) ID', 'CLIENT_SECRET — the secret value from step 3', 'GH_PAT — GitHub Personal Access Token (repo + workflow scopes)'].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--gold-400)' }}>●</span> {s}
            </div>
          ))}
        </div>
      </Step>

      <Step n="5" title="Add GitHub Variables">
        Same page, click <strong>Variables</strong> tab. Add:
        <Code>VITE_BASE_URL = /Knowledge-Base/</Code>
        <Code>SHAREPOINT_HOST = anheuserbuschinbev.sharepoint.com</Code>
        <Code>SITE_PATH = /sites/Sustinability</Code>
      </Step>

      <Step n="6" title="Create the approval environment">
        Go to{' '}
        <a href={`https://github.com/${REPO}/settings/environments`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-400)' }}>
          Settings → Environments
        </a> → New environment → name it <strong>data-refresh</strong>.
        Add Required reviewers (yourself + anyone who should approve).
      </Step>

      <Step n="7" title="Enable GitHub Pages">
        Go to{' '}
        <a href={`https://github.com/${REPO}/settings/pages`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold-400)' }}>
          Settings → Pages
        </a>. Source: <strong>GitHub Actions</strong>.
        Push to main once — the deploy workflow will publish the site automatically.
      </Step>

      <div style={{
        padding: '12px 16px', borderRadius: 'var(--radius-lg)', marginTop: '8px',
        background: 'rgba(0,176,80,0.08)', border: '1px solid rgba(0,176,80,0.3)',
        display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.8125rem', color: 'var(--forest-400)',
      }}>
        <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
        After setup, your site lives at <a href={PAGES_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--forest-400)', fontFamily: 'var(--font-mono)' }}>{PAGES_URL}</a> and data refreshes on-demand with approval.
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
          <motion.div key="bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200, backdropFilter: 'blur(4px)' }}
          />
          <motion.div key="panel"
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '520px', maxWidth: '96vw',
              background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)',
              zIndex: 201, display: 'flex', flexDirection: 'column', overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px 0', borderBottom: '1px solid var(--border-subtle)',
              position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1, paddingBottom: '0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <p className="section-label" style={{ margin: 0 }}>Knowledge Base</p>
                  <h2 style={{ margin: '2px 0 0', fontSize: '1.125rem' }}>Data Sources</h2>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '2px' }}>
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setTab(id)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-label)', fontWeight: 500, fontSize: '0.8125rem',
                    borderBottom: tab === id ? '2px solid var(--gold-400)' : '2px solid transparent',
                    color: tab === id ? 'var(--gold-400)' : 'var(--text-muted)',
                    background: 'transparent', transition: 'all var(--transition-fast)',
                    borderRadius: '0',
                  }}>
                    <Icon size={13} />{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div style={{ padding: '24px', flex: 1 }}>
              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  {tab === 'upload'  && <UploadTab onData={d => { onData(d); onClose() }} />}
                  {tab === 'actions' && <ActionsTab />}
                  {tab === 'setup'   && <SetupTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
