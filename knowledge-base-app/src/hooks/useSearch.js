import { useState, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'

const FUSE_OPTIONS = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'snippet', weight: 0.3 },
    { name: 'category', weight: 0.15 },
    { name: 'tags', weight: 0.1 },
    { name: 'author', weight: 0.05 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
}

export function useSearch(documents) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [productId, setProductId] = useState(null)
  const [sortBy, setSortBy] = useState('modified') // 'modified' | 'name' | 'size' | 'relevance'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  const fuse = useMemo(() => new Fuse(documents, FUSE_OPTIONS), [documents])

  const results = useMemo(() => {
    let docs = documents

    // Product filter
    if (productId) {
      docs = docs.filter((d) => d.productId === productId)
    }

    // Category filter
    if (category !== 'all') {
      docs = docs.filter((d) => d.category === category)
    }

    // Text search
    if (query.trim().length >= 2) {
      const searchDocs = productId
        ? new Fuse(docs, FUSE_OPTIONS)
        : fuse
      const fuseResults = (productId ? searchDocs : fuse).search(query.trim())
      // Re-filter for product/category after fuse search
      docs = fuseResults
        .map((r) => r.item)
        .filter((d) => (productId ? d.productId === productId : true))
        .filter((d) => (category !== 'all' ? d.category === category : true))
    }

    // Sort
    return [...docs].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'modified')
        return new Date(b.modified) - new Date(a.modified)
      return 0
    })
  }, [documents, fuse, query, category, productId, sortBy])

  const reset = useCallback(() => {
    setQuery('')
    setCategory('all')
    setProductId(null)
    setSortBy('modified')
  }, [])

  return {
    query, setQuery,
    category, setCategory,
    productId, setProductId,
    sortBy, setSortBy,
    viewMode, setViewMode,
    results,
    reset,
    hasFilters: query.length > 0 || category !== 'all' || productId !== null,
  }
}
