import { Search, Database, Wifi, WifiOff, Menu, X, Settings } from 'lucide-react'

export default function Nav({ query, onQueryChange, onSearch, source, onMenuToggle, menuOpen, onConnectClick }) {
  return (
    <nav className="nav" style={{ padding: '0 24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', height: '60px', gap: '16px',
        maxWidth: '1400px', margin: '0 auto',
      }}>
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          style={{
            display: 'none', background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '6px',
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--gradient-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', flexShrink: 0,
          }}>
            ⚡
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem',
              color: 'var(--text-primary)', lineHeight: 1.1,
            }}>
              Command Centre
            </div>
            <div style={{
              fontFamily: 'var(--font-label)', fontSize: '0.625rem', color: 'var(--gold-400)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              GCC 2026 Knowledge Base
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{
          flex: 1, maxWidth: '480px', position: 'relative',
          display: 'flex', alignItems: 'center',
        }}>
          <Search
            size={15}
            style={{
              position: 'absolute', left: '12px',
              color: 'var(--text-faint)', pointerEvents: 'none',
            }}
          />
          <input
            className="input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Search documents, recordings, BRDs…"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.875rem' }}
          />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Source indicator — clickable */}
        <button
          onClick={onConnectClick}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-label)', fontSize: '0.6875rem',
            color: source === 'sharepoint' ? 'var(--forest-400)' : 'var(--gold-400)',
            padding: '4px 10px', borderRadius: 'var(--radius-pill)',
            background: source === 'sharepoint'
              ? 'rgba(0,176,80,0.1)'
              : 'rgba(229,182,17,0.08)',
            border: `1px solid ${source === 'sharepoint' ? 'rgba(0,176,80,0.3)' : 'var(--border-gold)'}`,
            whiteSpace: 'nowrap', cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          {source === 'sharepoint'
            ? <><Wifi size={11} /> SharePoint Live</>
            : <><WifiOff size={11} /> Connect Data</>
          }
        </button>

        {/* Settings icon */}
        <button
          onClick={onConnectClick}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-faint)', padding: '6px', borderRadius: 'var(--radius-sm)',
            transition: 'color var(--transition-fast)',
          }}
          title="Data source settings"
        >
          <Settings size={18} />
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
