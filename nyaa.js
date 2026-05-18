/*export default new class Nyaa {
  base = atob('aHR0cHM6Ly9ueWFhLnNpLz9wYWdlPXJzcyZjPTFfMCZmPTAmcT0=')

  /** @type {import('./').SearchFunction} */
/*  async single({ titles, episode, fetch = globalThis.fetch }) {
    if (!titles?.length) return []
    const clean = titles[0].replace(/[^\w\s-]/g, ' ').trim()
    const ep = episode ? episode.toString().padStart(2, '0') : ''
    const q = [clean, ep].filter(Boolean).join(' ')
    return this.fetchRSS(q, fetch)
  }
*/
  /** @type {import('./').SearchFunction} */
/*  batch = this.single
  movie = this.single

  async fetchRSS(query, fetch) {
    try {
      const res = await fetch(this.base + encodeURIComponent(query))
      if (!res.ok) return []
      return this.parseRSS(await res.text())
    } catch {
      return []
    }
  }

  parseRSS(text) {
    const results = []
    const itemPattern = /<item>([\s\S]*?)<\/item>/g
    let m
    while ((m = itemPattern.exec(text)) !== null) {
      const s = m[1]
      const title = s.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? s.match(/<title>(.*?)<\/title>/)?.[1]
      if (!title) continue

      const viewId = s.match(/<guid[^>]*>https:\/\/nyaa\.si\/view\/(\d+)<\/guid>/)?.[1]
      const hash = (s.match(/<nyaa:infoHash>(.*?)<\/nyaa:infoHash>/)?.[1] ?? '').toLowerCase()
      if (!hash) continue

      const pubDate = s.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]

      results.push({
        title,
        link: viewId ? atob('aHR0cHM6Ly9ueWFhLnNpL2Rvd25sb2FkLw==') + viewId + '.torrent' : '',
        hash,
        seeders:   parseInt(s.match(/<nyaa:seeders>(\d+)<\/nyaa:seeders>/)?.[1]   ?? '0'),
        leechers:  parseInt(s.match(/<nyaa:leechers>(\d+)<\/nyaa:leechers>/)?.[1]  ?? '0'),
        downloads: parseInt(s.match(/<nyaa:downloads>(\d+)<\/nyaa:downloads>/)?.[1] ?? '0'),
        size:      this.parseSize(s.match(/<nyaa:size>(.*?)<\/nyaa:size>/)?.[1]    ?? ''),
        date:      pubDate ? new Date(pubDate) : new Date(),
        accuracy:  'medium'
      })
    }
    return results
  }

  parseSize(str) {
    const m = str.match(/([\d.]+)\s*(KiB|MiB|GiB)/i)
    if (!m) return 0
    const v = parseFloat(m[1])
    switch (m[2].toUpperCase()) {
      case 'KIB': return v * 1024
      case 'MIB': return v * 1024 * 1024
      case 'GIB': return v * 1024 * 1024 * 1024
      default: return 0
    }
  }

  async test() {
    const res = await fetch(this.base + 'one+piece')
    if (!res.ok) throw new Error('Nyaa returned ' + res.status + ' — service may be down')
    return true
  }
}()
*/

export default new class Nyaa {
  base = 'https://torrent-search-api-livid.vercel.app/api/nyaasi/'

  async single({ titles, episode }) {
    if (!titles?.length) return []
    return this.search(titles[0], episode)
  }

  batch = this.single
  movie = this.single

  async search(title, episode) {
    let query = title.replace(/[^\w\s-]/g, ' ').trim()
    if (episode) query += ` ${episode.toString().padStart(2, '0')}`

    const res = await fetch(this.base + encodeURIComponent(query))
    const data = await res.json()
    if (!Array.isArray(data)) return []

    return data.map(item => ({
      title: item.Name,
      link: item.Magnet,
      hash: item.Magnet?.match(/btih:([A-Fa-f0-9]+)/)?.[1] || '',
      seeders: Number(item.Seeders || 0),
      leechers: Number(item.Leechers || 0),
      downloads: Number(item.Downloads || 0),
      size: 0,
      date: new Date(item.DateUploaded),
      accuracy: 'medium',
      type: 'alt'
    }))
  }

  async test() {
    const res = await fetch(this.base + 'one%20piece')
    return res.ok
  }
}()
