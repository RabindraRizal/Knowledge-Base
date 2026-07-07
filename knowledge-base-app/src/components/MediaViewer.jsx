import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Play, Pause, Volume2, VolumeX, Maximize2,
  ExternalLink, SkipBack, SkipForward,
} from 'lucide-react'

function formatTime(s) {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function VideoPlayer({ src, name }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [showControls, setShowControls] = useState(true)

  function toggle() {
    const v = videoRef.current
    if (!v) return
    if (playing) { v.pause(); setPlaying(false) }
    else { v.play(); setPlaying(true) }
  }

  function onTimeUpdate() {
    const v = videoRef.current
    if (!v) return
    setCurrent(v.currentTime)
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0)
  }

  function seek(e) {
    const v = videoRef.current
    if (!v) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    v.currentTime = pct * v.duration
  }

  function skip(seconds) {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + seconds))
  }

  return (
    <div
      style={{
        background: '#000', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        position: 'relative', aspectRatio: '16/9', maxWidth: '100%',
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
        onClick={toggle}
      />

      {/* Controls overlay */}
      <motion.div
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
          padding: '32px 16px 14px',
        }}
      >
        {/* Progress bar */}
        <div
          onClick={seek}
          style={{
            height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px',
            cursor: 'pointer', marginBottom: '10px', position: 'relative',
          }}
        >
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'var(--gradient-gold)', borderRadius: '2px',
            transition: 'width 0.1s linear',
          }} />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => skip(-10)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px' }}>
            <SkipBack size={16} />
          </button>
          <button onClick={toggle} style={{
            background: 'var(--gradient-gold)', border: 'none', cursor: 'pointer',
            color: '#000', borderRadius: '50%', width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={() => skip(10)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px' }}>
            <SkipForward size={16} />
          </button>
          <button
            onClick={() => { setMuted((m) => !m); if (videoRef.current) videoRef.current.muted = !muted }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px' }}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginLeft: '4px' }}>
            {formatTime(current)} / {formatTime(duration)}
          </span>
          <button
            onClick={() => videoRef.current?.requestFullscreen()}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px' }}
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </motion.div>

      {/* Big play button when paused */}
      {!playing && (
        <div
          onClick={toggle}
          style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(229,182,17,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(229,182,17,0.4)',
          }}>
            <Play size={28} fill="#000" color="#000" style={{ marginLeft: '4px' }} />
          </div>
        </div>
      )}
    </div>
  )
}

export function PDFViewer({ src, name }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (!src || src === '#') {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)', padding: '48px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📄</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          PDF preview requires a SharePoint connection. Run the extractor to get direct URLs.
        </p>
      </div>
    )
  }

  return (
    <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#fff' }}>
      {!loaded && !error && (
        <div style={{
          height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-card)',
        }}>
          <div className="skeleton" style={{ width: '80%', height: '70%' }} />
        </div>
      )}
      {error ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '12px' }}>Could not load PDF inline.</p>
          <a href={src} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', gap: '6px' }}>
            <ExternalLink size={14} /> Open PDF
          </a>
        </div>
      ) : (
        <iframe
          src={`${src}?web=1`}
          style={{ width: '100%', height: '600px', border: 'none', display: loaded ? 'block' : 'none' }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          title={name}
          sandbox="allow-same-origin allow-scripts allow-popups"
        />
      )}
    </div>
  )
}

export function OfficeViewer({ src, extension, name }) {
  const [error, setError] = useState(false)

  // Microsoft Office Online viewer — works for publicly accessible PPTX/DOCX
  // For SharePoint files, the webUrl embed usually works within the same tenant browser session
  const embedSrc = src && src !== '#'
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`
    : null

  if (!embedSrc) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)', padding: '40px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
          {extension === '.pptx' ? '📊' : '📝'}
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Preview available once connected to SharePoint.
        </p>
      </div>
    )
  }

  return (
    <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
      {error ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)' }}>
          <p style={{ marginBottom: '12px' }}>Inline preview not available for this file.</p>
          <a href={src} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', gap: '6px' }}>
            <ExternalLink size={14} /> Open in SharePoint
          </a>
        </div>
      ) : (
        <iframe
          src={embedSrc}
          style={{ width: '100%', height: '520px', border: 'none', display: 'block' }}
          onError={() => setError(true)}
          title={name}
          frameBorder="0"
          allowFullScreen
        />
      )}
    </div>
  )
}

/** Picks the right viewer based on extension */
export function MediaViewer({ doc }) {
  const { extension, webUrl, name } = doc

  if (!extension) return null

  if (['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v'].includes(extension)) {
    return (
      <div>
        <VideoPlayer src={webUrl !== '#' ? webUrl : null} name={name} />
        {(!webUrl || webUrl === '#') && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)', marginTop: '10px', textAlign: 'center' }}>
            Video URL available after SharePoint connection
          </p>
        )}
      </div>
    )
  }

  if (extension === '.pdf') {
    return <PDFViewer src={webUrl} name={name} />
  }

  if (['.pptx', '.docx', '.xlsx', '.ppt', '.doc', '.xls'].includes(extension)) {
    return <OfficeViewer src={webUrl} extension={extension} name={name} />
  }

  return null
}
