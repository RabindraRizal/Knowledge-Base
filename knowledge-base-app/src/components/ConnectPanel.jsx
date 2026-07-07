import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Globe, RefreshCw, Upload, CheckCircle2, AlertCircle,
  Terminal, FolderOpen, ChevronRight, Wifi, WifiOff, Copy, Check,
} from 'lucide-react'

const EXTRACT_CMD = 'cd extractor && python extract.py'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={copy} style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
      color: copied ? 'var(--forest-400)' : 'var(--text-faint)',
      borderRadius: '4px', transition: 'color 0.2s',
      display: 'flex', alignItems: 'center', gap: '4px',
      fontFamily: 'var(--font-label)', fontSize: '0.75rem',
    }}>
      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
    </button>
  )
}

function Step({ n, title, children }) {
  return (
    <div style={{ display: 'flex', gap: '14px', paddingBottom: '20px' }}>
      <div style={{
        width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
        background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.8125rem', color: '#000',
      }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '6px' }}>{title}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{children}</div>
      </div>
    </div>
  )
}

export default function ConnectPanel({ isOpen, onClose, source, onFileLoaded }) {
  const [dragging, setDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null) // null | 'ok' | 'error'
  const [uploadMsg, setUploadMsg] = useState('')

  function handleFileDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = (e.dataTransfer || e.target).files?.[0]
    if (!file) return
    if (!file.name.endsWith('.json')) {
      setUploadStatus('error')
      setUploadMsg('Please upload a documents.json file')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!data.documents) throw new Error('Invalid format — missing "documents" key')
        onFileLoaded(data)
        setUploadStatus('ok')
        setUploadMsg(`Loaded ${data.documents.length} documents from file`)
      } catch (err) {
        setUploadStatus('error')
        setUploadMsg(err.message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
              zIndex: 200, backdropFilter: 'blur(4px)',
            }}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px', maxWidth: '95vw',
              background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)',
              zIndex: 201, overflowY: 'auto', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 1,
            }}>
              <div>
                <p className="section-label" style={{ margin: 0 }}>Data Source</p>
                <h2 style={{ margin: '2px 0 0', fontSize: '1.125rem' }}>Connect SharePoint</h2>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1 }}>

              {/* Current status */}
              <div style={{
                padding: '14px 16px', borderRadius: 'var(--radius-lg)',
                background: source === 'sharepoint' ? 'rgba(0,176,80,0.08)' : 'rgba(229,182,17,0.08)',
                border: `1px solid ${source === 'sharepoint' ? 'rgba(0,176,80,0.3)' : 'var(--border-gold)'}`,
                display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px',
              }}>
                {source === 'sharepoint'
                  ? <CheckCircle2 size={18} style={{ color: 'var(--forest-400)', flexShrink: 0 }} />
                  : <AlertCircle size={18} style={{ color: 'var(--gold-400)', flexShrink: 0 }} />
                }
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {source === 'sharepoint' ? 'Connected — SharePoint Live' : 'Using Sample Data'}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {source === 'sharepoint'
                      ? 'Documents loaded from anheuserbuschinbev.sharepoint.com'
                      : 'Run the extractor below to load your real documents'
                    }
                  </div>
                </div>
              </div>

              {/* SharePoint config */}
              <div style={{ marginBottom: '28px' }}>
                <div className="section-label" style={{ marginBottom: '12px' }}>SharePoint Site</div>
                <div style={{
                  padding: '12px 14px', background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px',
                }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Globe size={12} style={{ marginRight: '6px', color: 'var(--text-faint)', verticalAlign: 'middle' }} />
                    anheuserbuschinbev.sharepoint.com/sites/Sustinability
                  </div>
                  <CopyButton text="https://anheuserbuschinbev.sharepoint.com/sites/Sustinability" />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '6px', paddingLeft: '2px' }}>
                  Library: <code style={{ fontSize: '0.75rem' }}>Shared Documents</code> · To change, edit <code style={{ fontSize: '0.75rem' }}>extractor/extract.py</code>
                </div>
              </div>

              {/* How to run extractor */}
              <div style={{ marginBottom: '28px' }}>
                <div className="section-label" style={{ marginBottom: '14px' }}>Run Extractor</div>

                <Step n="1" title="Open a terminal in the project root">
                  Navigate to the Knowledge Base folder
                </Step>

                <Step n="2" title="Run the extractor">
                  <div style={{
                    background: 'var(--bg-base)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)', padding: '12px 14px', marginTop: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--gold-400)',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Terminal size={13} style={{ color: 'var(--text-faint)' }} />
                      {EXTRACT_CMD}
                    </span>
                    <CopyButton text={EXTRACT_CMD} />
                  </div>
                </Step>

                <Step n="3" title="Sign in with your AB InBev Microsoft account">
                  A browser link will appear in the terminal. Open it, enter the code shown, and sign in with your corporate account (<code>@ab-inbev.com</code>). The token is cached — you only do this once.
                </Step>

                <Step n="4" title="Reload the app">
                  Once extraction completes (the terminal shows ✅ Done), refresh this browser tab. The app will automatically switch from sample data to your live SharePoint documents.
                </Step>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
                <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', color: 'var(--text-faint)' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              </div>

              {/* Manual upload */}
              <div>
                <div className="section-label" style={{ marginBottom: '12px' }}>Upload documents.json manually</div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleFileDrop}
                  style={{
                    border: `2px dashed ${dragging ? 'var(--gold-400)' : 'var(--border-default)'}`,
                    borderRadius: 'var(--radius-lg)', padding: '32px 20px', textAlign: 'center',
                    background: dragging ? 'rgba(229,182,17,0.05)' : 'transparent',
                    transition: 'all var(--transition-normal)', cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('json-upload').click()}
                >
                  <Upload size={24} style={{ color: 'var(--text-faint)', marginBottom: '10px' }} />
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Drag & drop <code>documents.json</code> here
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', marginTop: '4px' }}>
                    or click to browse
                  </div>
                  <input id="json-upload" type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileDrop} />
                </div>

                {uploadStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: '12px', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: uploadStatus === 'ok' ? 'rgba(0,176,80,0.1)' : 'rgba(255,0,0,0.08)',
                      border: `1px solid ${uploadStatus === 'ok' ? 'rgba(0,176,80,0.3)' : 'rgba(255,0,0,0.2)'}`,
                      fontSize: '0.875rem',
                      color: uploadStatus === 'ok' ? 'var(--forest-400)' : '#FF6666',
                    }}
                  >
                    {uploadStatus === 'ok' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    {uploadMsg}
                  </motion.div>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
