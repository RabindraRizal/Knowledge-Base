import { Home, Layers, FileText, Video, BarChart2, FolderOpen, ChevronRight, X } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'browse', label: 'Browse All', icon: Layers },
]

function CategoryDot({ count }) {
  return (
    <span style={{
      fontSize: '0.6875rem', fontFamily: 'var(--font-label)', fontWeight: 600,
      color: 'var(--text-faint)', background: 'var(--bg-elevated)',
      padding: '1px 7px', borderRadius: 'var(--radius-pill)',
      border: '1px solid var(--border-subtle)', minWidth: '22px', textAlign: 'center',
    }}>
      {count}
    </span>
  )
}

export default function Sidebar({ page, productId, onNavigate, stats, isOpen, onClose, products = [] }) {
  const catCounts = stats?.byCategory || {}

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            display: 'none', position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 149,
          }}
          className="sidebar-overlay"
        />
      )}

      <aside style={{
        width: '252px', flexShrink: 0,
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg-surface)',
        height: 'calc(100dvh - 60px)',
        position: 'sticky', top: '60px',
        overflowY: 'auto',
        transition: 'transform 0.25s ease',
      }} className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>

        {/* Mobile close */}
        <button onClick={onClose} className="sidebar-close" style={{
          display: 'none', alignSelf: 'flex-end', margin: '12px 12px 0',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)',
        }}>
          <X size={18} />
        </button>

        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Main nav */}
          <div>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { onNavigate(id); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: page === id ? 600 : 400,
                  color: page === id ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: page === id ? 'var(--bg-elevated)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  marginBottom: '2px',
                }}
                onMouseEnter={(e) => { if (page !== id) e.currentTarget.style.background = 'var(--bg-card)' }}
                onMouseLeave={(e) => { if (page !== id) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={16} style={{ color: page === id ? 'var(--gold-400)' : 'inherit', flexShrink: 0 }} />
                {label}
                {id === 'browse' && stats && (
                  <span style={{ marginLeft: 'auto' }}>
                    <CategoryDot count={stats.total} />
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Products — dynamic from indexed docs */}
          <div>
            <p className="section-label" style={{ marginBottom: '10px', paddingLeft: '10px' }}>
              {products.length > 0 ? 'Projects / Products' : 'Products'}
            </p>
            {products.map((product) => {
              const active = page === 'product' && productId === product.id
              return (
                <button
                  key={product.id}
                  onClick={() => { onNavigate('product', product.id); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    width: '100%', padding: '7px 10px', borderRadius: 'var(--radius-md)',
                    border: active ? '1px solid var(--border-gold)' : '1px solid transparent',
                    cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'var(--font-body)', fontSize: '0.8125rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    background: active ? product.colorBg : 'transparent',
                    transition: 'all var(--transition-fast)',
                    marginBottom: '2px',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-card)' }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>{product.icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {product.shortName}
                  </span>
                  {active && <ChevronRight size={12} style={{ color: 'var(--gold-400)', flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>

          {/* Categories — dynamic from indexed docs */}
          {Object.keys(catCounts).length > 0 && (
            <div>
              <p className="section-label" style={{ marginBottom: '10px', paddingLeft: '10px' }}>Categories</p>
              {Object.entries(catCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => (
                  <div key={cat} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                  }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {cat}
                    </span>
                    <CategoryDot count={count} />
                  </div>
                ))}
            </div>
          )}

        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            top: 60px !important;
            left: 0;
            z-index: 150;
            transform: translateX(-100%);
            width: 280px !important;
            height: calc(100dvh - 60px) !important;
          }
          .sidebar.sidebar-open { transform: translateX(0) !important; }
          .sidebar-overlay { display: block !important; }
          .sidebar-close { display: flex !important; }
        }
      `}</style>
    </>
  )
}
