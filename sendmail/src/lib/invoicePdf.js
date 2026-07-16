const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { brandName } = require('./emailTemplate');
const { prepareLogoForPdf } = require('./logoImage');
const { getBrand } = require('./siteBrands');
const {
  formatMoney,
  formatQuantity,
  formatInvoiceDate,
  buyerDisplayName,
  buyerAddressLines,
  lineTotalCents,
  displayOrderRef,
} = require('./invoiceFormat');

/**
 * Embedded Unicode font. pdfkit's built-in Helvetica is WinAnsi-encoded and
 * cannot render Latin Extended glyphs (e.g. Lithuanian ė, ū), which corrupts
 * company/buyer details. Liberation Sans is Arial-metric-compatible and covers
 * the needed glyphs; we fall back to Helvetica if the bundled files are absent.
 */
const FONT_DIR = path.join(__dirname, '../../assets/fonts');
const FONT_FILES = {
  regular: path.join(FONT_DIR, 'LiberationSans-Regular.ttf'),
  bold: path.join(FONT_DIR, 'LiberationSans-Bold.ttf'),
};

let FONT_REGULAR = 'Helvetica';
let FONT_BOLD = 'Helvetica-Bold';

function pdfThemeFromBrand(brand) {
  const p = brand.palette;
  const isLight = p.colorScheme === 'light';
  return {
    headerBg: isLight ? p.headerTop : '#0e1018',
    headerText: isLight ? p.text : p.title,
    gold: p.accent,
    goldBright: p.accentBright,
    bodyBg: isLight ? '#faf6ee' : '#f7f2e8',
    bodyText: isLight ? p.text : '#1a1814',
    muted: isLight ? 'rgba(44, 62, 45, 0.72)' : '#5c564c',
    border: isLight ? 'rgba(154, 138, 184, 0.35)' : '#d4c4a0',
    tableHeaderBg: isLight ? p.headerBottom : '#0e1018',
    tableHeaderText: isLight ? p.text : p.title,
    panelBg: '#ffffff',
  };
}

function invoicePdfFilename(brand, ref) {
  const prefix = brandName(brand).replace(/\s+/g, '-');
  return `${prefix}-invoice-${ref}.pdf`;
}

function registerFonts(doc) {
  try {
    if (fs.existsSync(FONT_FILES.regular) && fs.existsSync(FONT_FILES.bold)) {
      doc.registerFont('body', FONT_FILES.regular);
      doc.registerFont('bodyBold', FONT_FILES.bold);
      FONT_REGULAR = 'body';
      FONT_BOLD = 'bodyBold';
      return;
    }
  } catch {
    /* fall back to built-in Helvetica below */
  }
  FONT_REGULAR = 'Helvetica';
  FONT_BOLD = 'Helvetica-Bold';
}

function drawHeaderBand(doc, seller, brand, theme, logoContent) {
  const width = doc.page.width;
  const bandHeight = 88;

  doc.save();
  doc.rect(0, 0, width, bandHeight).fill(theme.headerBg);

  if (logoContent) {
    try {
      doc.image(logoContent, 40, 18, { height: 42 });
    } catch {
      /* skip logo if unreadable */
    }
  } else {
    doc
      .fillColor(theme.goldBright)
      .font(FONT_BOLD)
      .fontSize(18)
      .text(brandName(brand), 40, 28, { continued: false });
  }

  doc
    .fillColor(theme.headerText)
    .font(FONT_BOLD)
    .fontSize(11)
    .text('INVOICE', width - 140, 26, { width: 100, align: 'right' })
    .font(FONT_REGULAR)
    .fontSize(9)
    .fillColor(theme.gold)
    .text(seller.companyName, width - 200, 44, { width: 160, align: 'right' });

  doc.restore();
  doc.y = bandHeight + 24;
}

async function resolvePdfLogoSource(brand) {
  return prepareLogoForPdf(brand);
}

function drawMetaRow(doc, order, paymentMethod, theme) {
  const ref = displayOrderRef(order);
  const leftX = 40;
  const rightX = 310;
  const y = doc.y;

  doc.fillColor(theme.muted).font(FONT_BOLD).fontSize(8).text('INVOICE NUMBER', leftX, y);
  doc.fillColor(theme.bodyText).font(FONT_BOLD).fontSize(12).text(`#${ref}`, leftX, y + 12);

  doc.fillColor(theme.muted).font(FONT_BOLD).fontSize(8).text('DATE', leftX, y + 34);
  doc
    .fillColor(theme.bodyText)
    .font(FONT_REGULAR)
    .fontSize(11)
    .text(formatInvoiceDate(order.paidAt), leftX, y + 46);

  doc.fillColor(theme.muted).font(FONT_BOLD).fontSize(8).text('PAYMENT', rightX, y + 34);
  doc
    .fillColor(theme.bodyText)
    .font(FONT_REGULAR)
    .fontSize(11)
    .text(paymentMethod || 'Card', rightX, y + 46, { width: 240 });

  doc.y = y + 78;
}

function drawPartyBlocks(doc, buyer, seller, recipient, theme) {
  const y = doc.y;
  const colWidth = 240;

  doc.fillColor(theme.gold).font(FONT_BOLD).fontSize(9).text('FROM', 40, y);
  doc
    .fillColor(theme.bodyText)
    .font(FONT_BOLD)
    .fontSize(11)
    .text(seller.companyName, 40, y + 14, { width: colWidth });
  doc
    .font(FONT_REGULAR)
    .fontSize(10)
    .fillColor(theme.muted)
    .text(`Company no. ${seller.companyNumber}`, 40, doc.y + 2, { width: colWidth })
    .text(seller.address, 40, doc.y + 2, { width: colWidth })
    .text(seller.email, 40, doc.y + 2, { width: colWidth });

  const billToY = y;
  doc.fillColor(theme.gold).font(FONT_BOLD).fontSize(9).text('BILL TO', 310, billToY);
  doc
    .fillColor(theme.bodyText)
    .font(FONT_BOLD)
    .fontSize(11)
    .text(buyerDisplayName(buyer), 310, billToY + 14, { width: colWidth });

  const lines = buyerAddressLines(buyer);
  doc.font(FONT_REGULAR).fontSize(10).fillColor(theme.muted);
  if (lines.length) {
    for (const line of lines) {
      doc.text(line, 310, doc.y + 2, { width: colWidth });
    }
  }
  if (recipient) {
    doc.text(recipient, 310, doc.y + 2, { width: colWidth });
  }

  doc.moveDown(1.5);
}

function drawLineItemsTable(doc, lineItems, order, theme) {
  const startX = 40;
  const tableWidth = doc.page.width - 80;
  const colWidths = [tableWidth * 0.46, tableWidth * 0.12, tableWidth * 0.2, tableWidth * 0.22];
  const headers = ['Description', 'Qty', 'Unit price', 'Total'];
  let y = doc.y + 8;

  doc.save();
  doc.rect(startX, y, tableWidth, 22).fill(theme.tableHeaderBg);
  doc.fillColor(theme.tableHeaderText).font(FONT_BOLD).fontSize(8);

  let x = startX + 8;
  headers.forEach((header, index) => {
    const align = index === 0 ? 'left' : 'right';
    doc.text(header, x, y + 7, { width: colWidths[index] - 12, align });
    x += colWidths[index];
  });

  y += 22;
  doc.font(FONT_REGULAR).fontSize(10);

  for (const line of lineItems ?? []) {
    const qty = line.quantity ?? 1;
    const unit = formatMoney(line.unitPriceCents, order.currency);
    const total = formatMoney(lineTotalCents(line), order.currency);
    const rowHeight = 28;

    if (y + rowHeight > doc.page.height - 120) {
      doc.addPage();
      y = 50;
    }

    doc
      .strokeColor(theme.border)
      .moveTo(startX, y + rowHeight)
      .lineTo(startX + tableWidth, y + rowHeight)
      .stroke();

    x = startX + 8;
    const values = [line.title, formatQuantity(qty), unit, total];
    values.forEach((value, index) => {
      doc
        .fillColor(index === 3 ? theme.gold : theme.bodyText)
        .font(index === 3 ? FONT_BOLD : FONT_REGULAR)
        .text(value, x, y + 8, { width: colWidths[index] - 12, align: index === 0 ? 'left' : 'right' });
      x += colWidths[index];
    });

    y += rowHeight;
  }

  doc.restore();
  doc.y = y + 16;

  const totalLabelX = startX + tableWidth - 180;
  doc
    .fillColor(theme.muted)
    .font(FONT_BOLD)
    .fontSize(10)
    .text('Total', totalLabelX, doc.y, { width: 100, align: 'right' });
  doc
    .fillColor(theme.gold)
    .font(FONT_BOLD)
    .fontSize(14)
    .text(formatMoney(order.totalCents, order.currency), totalLabelX + 104, doc.y - 2, {
      width: 76,
      align: 'right',
    });

  doc.moveDown(2);
}

function drawFooter(doc, brand, theme) {
  const y = doc.page.height - 60;
  doc
    .strokeColor(theme.border)
    .moveTo(40, y)
    .lineTo(doc.page.width - 40, y)
    .stroke();
  doc
    .fillColor(theme.muted)
    .font(FONT_REGULAR)
    .fontSize(8)
    .text(
      `Digital goods delivered instantly to your ${brandName(brand)} account. This document was generated automatically.`,
      40,
      y + 10,
      { width: doc.page.width - 80, align: 'center' },
    );
}

async function buildInvoicePdf(payload) {
  const brand = getBrand(payload.siteId || 'voidborn');
  const theme = pdfThemeFromBrand(brand);
  const logoContent = await resolvePdfLogoSource(brand);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { order, lineItems, buyer, seller, recipient, paymentMethod } = payload;

    registerFonts(doc);

    doc.rect(0, 0, doc.page.width, doc.page.height).fill(theme.bodyBg);

    drawHeaderBand(doc, seller, brand, theme, logoContent);
    drawMetaRow(doc, order, paymentMethod, theme);
    drawPartyBlocks(doc, buyer, seller, recipient, theme);
    drawLineItemsTable(doc, lineItems, order, theme);
    drawFooter(doc, brand, theme);

    doc.end();
  });
}

module.exports = {
  buildInvoicePdf,
  pdfThemeFromBrand,
  invoicePdfFilename,
};
