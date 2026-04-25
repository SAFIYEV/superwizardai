import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import { marked } from 'marked'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx'

marked.setOptions({ breaks: true, gfm: true })

const PDF_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .pdf-root {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.75;
    color: #1a1a1a;
    background: #fff;
    width: 794px;
    padding: 48px 56px;
  }
  .pdf-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: #999;
    padding-bottom: 12px;
    margin-bottom: 20px;
    border-bottom: 2px solid #d4a04a;
  }
  .pdf-title {
    font-size: 21px;
    font-weight: 700;
    color: #111;
    margin-bottom: 18px;
    line-height: 1.3;
  }
  .pdf-body h1 { font-size: 19px; font-weight: 700; margin: 22px 0 8px; color: #111; }
  .pdf-body h2 { font-size: 17px; font-weight: 600; margin: 18px 0 6px; color: #222; }
  .pdf-body h3 { font-size: 15px; font-weight: 600; margin: 14px 0 4px; color: #333; }
  .pdf-body h4 { font-size: 14px; font-weight: 600; margin: 12px 0 4px; color: #333; }
  .pdf-body p { margin: 8px 0; }
  .pdf-body strong { font-weight: 700; }
  .pdf-body em { font-style: italic; }
  .pdf-body ul, .pdf-body ol { margin: 8px 0; padding-left: 24px; }
  .pdf-body li { margin: 3px 0; }
  .pdf-body code {
    background: #f3f3f3;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 12.5px;
  }
  .pdf-body pre {
    background: #f7f7f7;
    padding: 14px 16px;
    border-radius: 6px;
    margin: 12px 0;
    border: 1px solid #e5e5e5;
    overflow-x: hidden;
    word-break: break-word;
  }
  .pdf-body pre code {
    background: none;
    padding: 0;
    font-size: 12px;
    line-height: 1.55;
    white-space: pre-wrap;
  }
  .pdf-body blockquote {
    border-left: 3px solid #d4a04a;
    padding: 8px 16px;
    margin: 10px 0;
    color: #555;
    background: #fdf8f0;
    border-radius: 0 4px 4px 0;
  }
  .pdf-body table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 13px;
  }
  .pdf-body thead th {
    background: #f0f0f0;
    font-weight: 600;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #d0d0d0;
  }
  .pdf-body tbody td {
    padding: 7px 10px;
    border: 1px solid #d0d0d0;
    text-align: left;
  }
  .pdf-body tbody tr:nth-child(even) {
    background: #fafafa;
  }
  .pdf-body hr { border: none; height: 1px; background: #e0e0e0; margin: 18px 0; }
  .pdf-body a { color: #b38312; text-decoration: underline; }
  .pdf-lawyer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    align-items: start;
  }
  .pdf-lawyer-col {
    min-width: 0;
  }
  .pdf-lawyer-col--right {
    border-left: 1px solid #e0e0e0;
    padding-left: 24px;
  }
  .pdf-lawyer-col h2 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #888;
    margin: 0 0 12px;
  }
`

/** Разделяет ответ и блок источников для режима «Экспорт для юриста». */
export function splitLawyerColumns(markdown: string): {
  answer: string
  sources: string
} {
  const text = markdown.trim()
  const re =
    /\n---+\s*\n##\s*(Источники[^#\n]*|Sources[^#\n]*)\s*\n/i.exec(text) ||
    /\n##\s*(Источники[^#\n]*|Sources[^#\n]*|Источники и метки[^#\n]*)\s*\n/i.exec(
      text
    )
  if (re && re.index !== undefined) {
    return {
      answer: text.slice(0, re.index).trim(),
      sources: text.slice(re.index + re[0].length).trim(),
    }
  }
  return { answer: text, sources: '' }
}

function mdToPlainParagraphs(md: string): Paragraph[] {
  const html = marked.parse(md || '—') as string
  const div = document.createElement('div')
  div.innerHTML = html
  const text = (div.textContent || '').trim() || '—'
  return text.split(/\n+/).map((line) => new Paragraph({ children: [new TextRun(line)] }))
}

export async function exportLawyerDocx(
  answerMd: string,
  sourcesMd: string,
  title: string,
  leftColTitle: string,
  rightColTitle: string
) {
  const left = mdToPlainParagraphs(answerMd)
  const right = mdToPlainParagraphs(sourcesMd || '—')

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, bold: true })],
          }),
          new Paragraph({ children: [new TextRun(' ')] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [4680, 4680],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: leftColTitle, bold: true })],
                      }),
                      ...left,
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: rightColTitle, bold: true })],
                      }),
                      ...right,
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safe = (title || 'superwizard-lawyer')
    .replace(/[^\wА-Яа-яЁё\s-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50)
  a.download = `${safe}.docx`
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportLawyerPdf(
  answerMd: string,
  sourcesMd: string,
  title: string | undefined,
  leftColTitle: string,
  rightColTitle: string,
  headerSubtitle: string
) {
  const leftHtml = marked.parse(answerMd || '—') as string
  const rightHtml = marked.parse(sourcesMd || '—') as string
  const date = new Date().toLocaleDateString('ru-RU')

  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;'
  container.innerHTML = `
    <div id="pdf-lawyer-render" class="pdf-root">
      <style>${PDF_STYLES}</style>
      <div class="pdf-header">
        <span>SuperWizard · ${title ? escapeHtml(title) : escapeHtml(headerSubtitle)}</span>
        <span>${date}</span>
      </div>
      <div class="pdf-lawyer-grid">
        <div class="pdf-lawyer-col pdf-lawyer-col--left">
          <h2>${escapeHtml(leftColTitle)}</h2>
          <div class="pdf-body">${leftHtml}</div>
        </div>
        <div class="pdf-lawyer-col pdf-lawyer-col--right">
          <h2>${escapeHtml(rightColTitle)}</h2>
          <div class="pdf-body">${rightHtml}</div>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(container)

  try {
    const el = container.querySelector('#pdf-lawyer-render') as HTMLElement
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 900,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = pdf.internal.pageSize.getHeight()
    const imgW = pdfW
    const imgH = (canvas.height * imgW) / canvas.width

    let remaining = imgH
    let offset = 0

    pdf.addImage(imgData, 'JPEG', 0, offset, imgW, imgH)
    remaining -= pdfH

    while (remaining > 0) {
      offset -= pdfH
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, offset, imgW, imgH)
      remaining -= pdfH
    }

    const filename = (title || 'superwizard-lawyer')
      .replace(/[^\wА-Яа-яЁё\s-]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 50)
    pdf.save(`${filename}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function exportToPdf(content: string, title?: string) {
  const htmlBody = marked.parse(content) as string
  const date = new Date().toLocaleDateString('ru-RU')

  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;'
  container.innerHTML = `
    <div id="pdf-render" class="pdf-root">
      <style>${PDF_STYLES}</style>
      <div class="pdf-header">
        <span>SuperWizard</span>
        <span>${date}</span>
      </div>
      ${title ? `<div class="pdf-title">${title}</div>` : ''}
      <div class="pdf-body">${htmlBody}</div>
    </div>
  `

  document.body.appendChild(container)

  try {
    const el = container.querySelector('#pdf-render') as HTMLElement
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = pdf.internal.pageSize.getHeight()
    const imgW = pdfW
    const imgH = (canvas.height * imgW) / canvas.width

    let remaining = imgH
    let offset = 0

    pdf.addImage(imgData, 'JPEG', 0, offset, imgW, imgH)
    remaining -= pdfH

    while (remaining > 0) {
      offset -= pdfH
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, offset, imgW, imgH)
      remaining -= pdfH
    }

    const filename = (title || 'superwizard-document')
      .replace(/[^\wА-Яа-яЁё\s-]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 50)
    pdf.save(`${filename}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
