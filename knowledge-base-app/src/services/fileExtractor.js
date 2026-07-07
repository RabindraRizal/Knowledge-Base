/**
 * Browser-side text extraction
 * DOCX → mammoth | XLSX/CSV → SheetJS | PPTX → jszip+XML | TXT/MD → native
 */
import mammoth from 'mammoth'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'

const EXTRACTABLE = ['.docx', '.xlsx', '.xls', '.csv', '.pptx', '.txt', '.md']
const MEDIA = ['.mp4', '.mkv', '.avi', '.mov', '.mp3', '.wav', '.m4v', '.webm', '.m4a']

const EXT_ICON = {
  '.pdf':'📄', '.docx':'📝', '.doc':'📝', '.pptx':'📊', '.ppt':'📊',
  '.xlsx':'📈', '.xls':'📈', '.mp4':'🎥', '.mkv':'🎥', '.mov':'🎥',
  '.mp3':'🎵', '.wav':'🎵', '.txt':'📃', '.md':'📃', '.csv':'📋',
}
const CATEGORY_RULES = [
  [/\.(mp4|mkv|avi|mov|webm)$/i,         'Recordings'],
  [/\.pptx?$/i,                           'Presentations'],
  [/brd|business.?requirement/i,          'BRD'],
  [/training|onboarding|guide|tutorial/i, 'Training'],
  [/architecture|design|diagram/i,        'Architecture'],
  [/\.xlsx?$/i,                           'Spreadsheets'],
  [/\.pdf$/i,                             'Documents'],
  [/\.docx?$/i,                           'Documents'],
]

function inferCategory(name) {
  for (const [re, cat] of CATEGORY_RULES) {
    if (re.test(name)) return cat
  }
  return 'General'
}

function formatSize(bytes) {
  for (const u of ['B','KB','MB','GB']) {
    if (bytes < 1024) return `${bytes.toFixed(1)} ${u}`
    bytes /= 1024
  }
  return `${bytes.toFixed(1)} TB`
}

async function extractDocx(buffer) {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value || ''
}

async function extractXlsx(buffer) {
  const wb = XLSX.read(buffer, { type: 'array' })
  return wb.SheetNames.map(name => {
    const ws = wb.Sheets[name]
    return `[Sheet: ${name}]\n` + XLSX.utils.sheet_to_csv(ws, { blankrows: false })
  }).join('\n\n').slice(0, 20000)
}

async function extractPptx(buffer) {
  const zip = await JSZip.loadAsync(buffer)
  const slideFiles = Object.keys(zip.files)
    .filter(n => n.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const na = parseInt(a.match(/(\d+)/)[1])
      const nb = parseInt(b.match(/(\d+)/)[1])
      return na - nb
    })

  const parts = []
  for (const path of slideFiles) {
    const xml = await zip.files[path].async('string')
    const texts = []
    const regex = /<a:t[^>]*>([^<]+)<\/a:t>/g
    let m
    while ((m = regex.exec(xml)) !== null) {
      const t = m[1].trim()
      if (t) texts.push(t)
    }
    if (texts.length) {
      const slideNum = path.match(/(\d+)/)[1]
      parts.push(`[Slide ${slideNum}]\n${texts.join('\n')}`)
    }
  }
  return parts.join('\n\n')
}

async function extractText(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase()
  const buffer = await file.arrayBuffer()
  if (ext === '.docx' || ext === '.doc') return extractDocx(buffer)
  if (ext === '.xlsx' || ext === '.xls') return extractXlsx(buffer)
  if (ext === '.csv') return new TextDecoder().decode(buffer).slice(0, 20000)
  if (ext === '.pptx') return extractPptx(buffer)
  if (ext === '.txt' || ext === '.md') return new TextDecoder().decode(buffer)
  return ''
}

export async function processFiles(files, onProgress) {
  const docs = []
  const total = files.length

  for (let i = 0; i < total; i++) {
    const file = files[i]
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    const isMedia = MEDIA.includes(ext)

    onProgress?.({ current: i + 1, total, name: file.name })

    let content = ''
    if (!isMedia && EXTRACTABLE.includes(ext)) {
      try { content = await extractText(file) } catch (e) { content = '' }
    }

    const snippet = content.split(/\s+/).slice(0, 80).join(' ')

    docs.push({
      id: `upload-${Date.now()}-${i}`,
      name: file.name,
      extension: ext,
      icon: EXT_ICON[ext] || '📁',
      size: file.size,
      sizeLabel: formatSize(file.size),
      folderPath: 'Uploaded',
      category: inferCategory(file.name),
      tags: [],
      author: 'Local Upload',
      modified: new Date(file.lastModified).toISOString(),
      created:  new Date(file.lastModified).toISOString(),
      webUrl: '#',
      isMedia,
      snippet,
      content,
    })
  }

  return {
    generated: new Date().toISOString(),
    totalDocuments: docs.length,
    source: 'upload',
    documents: docs,
  }
}
