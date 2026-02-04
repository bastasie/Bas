type TouchPoint = {
  x: number
  y: number
  pressure: number
}

type Tile = {
  x: number
  y: number
  width: number
  height: number
  label: string
  badge?: string
}

export class ModernUIEngine {
  private readonly width = 1024
  private readonly height = 1024
  private displayWidth = 1024
  private displayHeight = 1024
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private touch: TouchPoint | null = null
  private activeTileIndex: number | null = null
  private readonly tiles: Tile[]

  constructor() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.width
    this.canvas.height = this.height
    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas context unavailable')
    }
    this.ctx = ctx
    this.tiles = this.createTiles()
  }

  getDimensions() {
    return { width: this.width, height: this.height }
  }

  setCanvasSize(width: number, height: number) {
    this.displayWidth = width
    this.displayHeight = height
  }

  handleTouchStart(x: number, y: number, pressure: number) {
    this.touch = { x, y, pressure }
    this.activeTileIndex = this.findTileIndex(x, y)
  }

  handleTouchMove(x: number, y: number, pressure: number) {
    this.touch = { x, y, pressure }
    this.activeTileIndex = this.findTileIndex(x, y)
  }

  handleTouchEnd() {
    this.touch = null
    this.activeTileIndex = null
  }

  render(): ImageData {
    this.drawBackground()
    this.drawHeader()
    this.drawStatusCards()
    this.drawTiles()
    this.drawKeyboard()
    this.drawTouchHighlight()

    return this.ctx.getImageData(0, 0, this.width, this.height)
  }

  private drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height)
    gradient.addColorStop(0, '#050816')
    gradient.addColorStop(0.5, '#0f172a')
    gradient.addColorStop(1, '#111827')
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.width, this.height)

    this.ctx.save()
    this.ctx.globalAlpha = 0.5
    this.ctx.fillStyle = '#1e293b'
    for (let y = 120; y < this.height; y += 80) {
      this.ctx.fillRect(0, y, this.width, 1)
    }
    for (let x = 64; x < this.width; x += 80) {
      this.ctx.fillRect(x, 120, 1, this.height - 200)
    }
    this.ctx.restore()
  }

  private drawHeader() {
    this.ctx.save()
    this.ctx.fillStyle = '#0b1120'
    this.ctx.fillRect(0, 0, this.width, 120)

    this.ctx.fillStyle = '#f8fafc'
    this.ctx.font = 'bold 32px Inter, sans-serif'
    this.ctx.fillText('PPU-AQC Unified Platform', 64, 60)

    this.ctx.fillStyle = '#94a3b8'
    this.ctx.font = '16px Inter, sans-serif'
    this.ctx.fillText('Operational readiness · 21 applications · 4K mode', 64, 90)

    const capsuleX = this.width - 300
    this.drawCapsule(capsuleX, 38, 220, 44, '#1d4ed8')
    this.ctx.fillStyle = '#e2e8f0'
    this.ctx.font = '600 15px Inter, sans-serif'
    this.ctx.fillText('Systems nominal', capsuleX + 24, 66)

    this.ctx.restore()
  }

  private drawStatusCards() {
    const cardWidth = 280
    const cardHeight = 110
    const startX = 64
    const startY = 140
    const gap = 24

    const cards = [
      { title: 'Power', value: '98%', subtitle: 'Stable output', accent: '#22c55e' },
      { title: 'Cooling', value: '72°F', subtitle: 'Nominal range', accent: '#38bdf8' },
      { title: 'Security', value: 'Secure', subtitle: 'All zones green', accent: '#a855f7' },
    ]

    cards.forEach((card, index) => {
      const x = startX + index * (cardWidth + gap)
      const y = startY
      this.drawRoundedRect(x, y, cardWidth, cardHeight, 20, '#0f172a')
      this.ctx.strokeStyle = '#1e293b'
      this.ctx.lineWidth = 2
      this.ctx.strokeRect(x, y, cardWidth, cardHeight)

      this.ctx.fillStyle = '#94a3b8'
      this.ctx.font = '14px Inter, sans-serif'
      this.ctx.fillText(card.title, x + 20, y + 30)

      this.ctx.fillStyle = '#f8fafc'
      this.ctx.font = '600 28px Inter, sans-serif'
      this.ctx.fillText(card.value, x + 20, y + 62)

      this.ctx.fillStyle = card.accent
      this.ctx.font = '12px Inter, sans-serif'
      this.ctx.fillText(card.subtitle, x + 20, y + 88)
    })
  }

  private drawTiles() {
    this.tiles.forEach((tile, index) => {
      const isActive = index === this.activeTileIndex
      const baseColor = isActive ? '#1d4ed8' : '#111827'
      const glowColor = isActive ? 'rgba(59, 130, 246, 0.35)' : 'rgba(15, 23, 42, 0.6)'

      this.ctx.save()
      this.ctx.shadowColor = glowColor
      this.ctx.shadowBlur = isActive ? 22 : 8
      this.drawRoundedRect(tile.x, tile.y, tile.width, tile.height, 18, baseColor)

      this.ctx.shadowBlur = 0
      this.ctx.strokeStyle = isActive ? '#93c5fd' : '#1f2937'
      this.ctx.lineWidth = 2
      this.ctx.strokeRect(tile.x, tile.y, tile.width, tile.height)

      this.ctx.fillStyle = '#e2e8f0'
      this.ctx.font = '600 16px Inter, sans-serif'
      this.ctx.fillText(tile.label, tile.x + 16, tile.y + 32)

      this.ctx.fillStyle = '#64748b'
      this.ctx.font = '12px Inter, sans-serif'
      this.ctx.fillText('Ready', tile.x + 16, tile.y + 56)

      if (tile.badge) {
        this.drawCapsule(tile.x + tile.width - 88, tile.y + 18, 72, 26, '#0f172a')
        this.ctx.fillStyle = '#38bdf8'
        this.ctx.font = '600 12px Inter, sans-serif'
        this.ctx.fillText(tile.badge, tile.x + tile.width - 72, tile.y + 36)
      }

      this.ctx.restore()
    })
  }

  private drawKeyboard() {
    const keyboardHeight = 180
    const startY = this.height - keyboardHeight - 32
    const padding = 64

    this.drawRoundedRect(padding, startY, this.width - padding * 2, keyboardHeight, 24, '#0b1120')
    this.ctx.strokeStyle = '#1e293b'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(padding, startY, this.width - padding * 2, keyboardHeight)

    const rows = [
      ['ESC', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8'],
      ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['CTRL', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER'],
    ]

    const keyGap = 10
    const keyHeight = 38
    let y = startY + 20

    rows.forEach((row) => {
      const totalKeyWidth = this.width - padding * 2 - keyGap * (row.length - 1)
      const keyWidth = totalKeyWidth / row.length
      let x = padding

      row.forEach((key) => {
        this.drawRoundedRect(x, y, keyWidth, keyHeight, 12, '#111827')
        this.ctx.strokeStyle = '#1f2937'
        this.ctx.strokeRect(x, y, keyWidth, keyHeight)
        this.ctx.fillStyle = '#94a3b8'
        this.ctx.font = '12px Inter, sans-serif'
        this.ctx.fillText(key, x + 12, y + 24)
        x += keyWidth + keyGap
      })

      y += keyHeight + 12
    })
  }

  private drawTouchHighlight() {
    if (!this.touch) return
    const { x, y } = this.touch
    this.ctx.save()
    this.ctx.globalAlpha = 0.4
    const radial = this.ctx.createRadialGradient(x, y, 10, x, y, 80)
    radial.addColorStop(0, '#60a5fa')
    radial.addColorStop(1, 'transparent')
    this.ctx.fillStyle = radial
    this.ctx.beginPath()
    this.ctx.arc(x, y, 80, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.restore()
  }

  private createTiles() {
    const tiles: Tile[] = []
    const columns = 7
    const rows = 3
    const paddingX = 64
    const paddingY = 280
    const gap = 16
    const availableWidth = this.width - paddingX * 2
    const tileWidth = (availableWidth - gap * (columns - 1)) / columns
    const tileHeight = 110

    let count = 1
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        const x = paddingX + col * (tileWidth + gap)
        const y = paddingY + row * (tileHeight + gap)
        tiles.push({
          x,
          y,
          width: tileWidth,
          height: tileHeight,
          label: `App ${count}`,
          badge: count % 5 === 0 ? 'NEW' : undefined,
        })
        count += 1
      }
    }

    return tiles
  }

  private findTileIndex(x: number, y: number) {
    return this.tiles.findIndex((tile) => {
      return x >= tile.x && x <= tile.x + tile.width && y >= tile.y && y <= tile.y + tile.height
    })
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number, fill: string) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.arcTo(x + width, y, x + width, y + height, radius)
    this.ctx.arcTo(x + width, y + height, x, y + height, radius)
    this.ctx.arcTo(x, y + height, x, y, radius)
    this.ctx.arcTo(x, y, x + width, y, radius)
    this.ctx.closePath()
    this.ctx.fillStyle = fill
    this.ctx.fill()
  }

  private drawCapsule(x: number, y: number, width: number, height: number, fill: string) {
    const radius = height / 2
    this.drawRoundedRect(x, y, width, height, radius, fill)
  }
}
