import PptxGenJS from 'pptxgenjs'

interface SlidePayload {
  accountName: string
  quarter: string
  slides: {
    num: number
    title: string
    lines: { label?: string; text: string; bold?: boolean; size?: number; color?: string }[]
  }[]
}

export async function POST(request: Request) {
  const payload: SlidePayload = await request.json()

  const prs = new PptxGenJS()
  prs.layout = 'LAYOUT_WIDE'
  prs.title = `${payload.accountName} — Business Review`
  prs.author = 'Turbotek'

  const ACCENT = '5757CF'
  const DARK = '1e1e2e'
  const LIGHT_TEXT = 'e2e8f0'
  const MUTED = '94a3b8'

  for (const s of payload.slides) {
    const slide = prs.addSlide()

    // Background
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: DARK } })

    // Header bar
    slide.addShape(prs.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.7, fill: { color: ACCENT } })

    // Slide number + title
    slide.addText(`${String(s.num).padStart(2, '0')}  ${s.title}`, {
      x: 0.3, y: 0.1, w: 10, h: 0.5,
      fontSize: 18, bold: true, color: 'FFFFFF', fontFace: 'Helvetica',
    })

    // Turbotek watermark
    slide.addText('Turbotek', {
      x: 10, y: 0.1, w: 3, h: 0.5,
      fontSize: 10, color: 'FFFFFF', align: 'right', fontFace: 'Helvetica',
    })

    // Account name sub-header
    slide.addText(payload.accountName, {
      x: 0.3, y: 0.75, w: 12, h: 0.3,
      fontSize: 9, color: MUTED, fontFace: 'Helvetica',
    })

    let yPos = 1.1
    for (const line of s.lines) {
      if (yPos > 6.8) break

      if (line.label) {
        slide.addText(line.label.toUpperCase(), {
          x: 0.4, y: yPos, w: 12, h: 0.28,
          fontSize: 8, bold: true, color: MUTED, fontFace: 'Helvetica',
        })
        yPos += 0.32
      }

      slide.addText(line.text || ' ', {
        x: 0.4, y: yPos, w: 12, h: line.bold ? 0.42 : 0.35,
        fontSize: line.size ?? (line.bold ? 13 : 10),
        bold: line.bold ?? false,
        color: line.color ?? LIGHT_TEXT,
        fontFace: 'Helvetica',
        wrap: true,
      })
      yPos += line.bold ? 0.52 : 0.43
    }
  }

  const buf = (await prs.write({ outputType: 'nodebuffer' })) as Buffer
  const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Response(arrayBuffer as any, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="${payload.accountName.replace(/\s+/g, '_')}_Business_Review_${payload.quarter}.pptx"`,
    },
  })
}
