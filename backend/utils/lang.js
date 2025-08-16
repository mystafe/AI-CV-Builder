function normalizeLanguage(lang) {
  const raw = (lang || '').toString().trim().toLowerCase()
  if (!raw) return 'en'
  if (raw === 'tr' || raw.startsWith('tr-') || raw.includes('turk')) return 'tr'
  return 'en'
}

function resolveLanguage(input) {
  const envDefault = process.env.REACT_APP_DEFAULT_LANG || 'en'
  return normalizeLanguage(input || envDefault)
}

module.exports = { normalizeLanguage, resolveLanguage }


