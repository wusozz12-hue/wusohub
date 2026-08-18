export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  const seconds = Math.floor((Date.now() - then) / 1000)

  if (seconds < 60) return 'az önce'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} dk`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} sa`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} g`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} hf`

  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)} B`
  return `${(n / 1_000_000).toFixed(1)} M`
}
