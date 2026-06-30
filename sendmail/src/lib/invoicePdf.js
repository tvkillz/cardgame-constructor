const PDFDocument = require('pdfkit');
const path = require('path');
const { PORTAL, bundledLogoFile, brandName } = require('./emailTemplate');
const { formatMoney, formatQuantity, formatInvoiceDate, buyerDisplayName, buyerAddressLines, lineTotalCents } = require('./invoiceFormat');

/** PDF palette — portal header band + readable light body for print. */
const PDF_THEME = {
  headerBg: '#0e1018',
  headerText: '#f1e6c8',
  gold: '#c9a227',
  goldBright: '#f3d878',
  bodyBg: '#f7f2e8',
  bodyText: '#1a1814',
  muted: '#5c564c',
  border: '#d4c4a0',
  panelBg: '#ffffff',
};


function drawHeaderBand(doc, seller) {
  const width = doc.page.width;
  const bandHeight = 88;

  doc.save();
  doc.rect(0, 0, width, bandHeight).fill(PDF_THEME.headerBg);

  const logo = bundledLogoFile();
  if (logo && path.extname(logo).toLowerCase() === '.png') {
    try {
      doc.image(logo, 40, 18, { height: 42 });
    } catch {
      /* skip logo if unreadable */
    }
  } else {
    doc
      .fillColor(PDF_THEME.goldBright)
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(brandName(), 40, 28, { continued: false });
  }

  doc
    .fillColor(PDF_THEME.headerText)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('INVOICE', width - 140, 26, { width: 100, align: 'right' })
    .font('Helvetica')
    .fontSize(9)
    .fillColor(PDF_THEME.gold)
    .text(seller.companyName, width - 200, 44, { width: 160, align: 'right' });

  doc.restore();
  doc.y = bandHeight + 24;
}

function drawMetaRow(doc, order, paymentMethod) {
  const ref = shortOrderId(order.id);
  const leftX = 40;
  const rightX = 310;
  const y = doc.y;

  doc.fillColor(PDF_THEME.muted).font('Helvetica-Bold').fontSize(8).text('INVOICE NUMBER', leftX, y);
  doc.fillColor(PDF_THEME.bodyText).font('Helvetica-Bold').fontSize(12).text(`#${ref}`, leftX, y + 12);

  doc.fillColor(PDF_THEME.muted).font('Helvetica-Bold').fontSize(8).text('DATE', leftX, y + 34);
  doc
    .fillColor(PDF_THEME.bodyText)
    .font('Helvetica')
    .fontSize(11)
    .text(formatInvoiceDate(order.paidAt), leftX, y + 46);

  doc.fillColor(PDF_THEME.muted).font('Helvetica-Bold').fontSize(8).text('PAYMENT', rightX, y + 34);
  doc
    .fillColor(PDF_THEME.bodyText)
    .font('Helvetica')
    .fontSize(11)
    .text(paymentMethod || 'Card', rightX, y + 46, { width: 240 });

  doc.y = y + 78;
}

function drawPartyBlocks(doc, buyer, seller, recipient) {
  const y = doc.y;
  const colWidth = 240;

  doc.fillColor(PDF_THEME.gold).font('Helvetica-Bold').fontSize(9).text('FROM', 40, y);
  doc
    .fillColor(PDF_THEME.bodyText)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(seller.companyName, 40, y + 14, { width: colWidth });
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(PDF_THEME.muted)
    .text(`Company no. ${seller.companyNumber}`, 40, doc.y + 2, { width: colWidth })
    .text(seller.address, 40, doc.y + 2, { width: colWidth })
    .text(seller.email, 40, doc.y + 2, { width: colWidth });

  const billToY = y;
  doc.fillColor(PDF_THEME.gold).font('Helvetica-Bold').fontSize(9).text('BILL TO', 310, billToY);
  doc
    .fillColor(PDF_THEME.bodyText)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(buyerDisplayName(buyer), 310, billToY + 14, { width: colWidth });

  const lines = buyerAddressLines(buyer);
  doc.font('Helvetica').fontSize(10).fillColor(PDF_THEME.muted);
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

function drawLineItemsTable(doc, lineItems, order) {
  const startX = 40;
  const tableWidth = doc.page.width - 80;
  const colWidths = [tableWidth * 0.46, tableWidth * 0.12, tableWidth * 0.2, tableWidth * 0.22];
  const headers = ['Description', 'Qty', 'Unit price', 'Total'];
  let y = doc.y + 8;

  doc.save();
  doc.rect(startX, y, tableWidth, 22).fill(PDF_THEME.headerBg);
  doc.fillColor(PDF_THEME.headerText).font('Helvetica-Bold').fontSize(8);

  let x = startX + 8;
  headers.forEach((header, index) => {
    const align = index === 0 ? 'left' : 'right';
    doc.text(header, x, y + 7, { width: colWidths[index] - 12, align });
    x += colWidths[index];
  });

  y += 22;
  doc.font('Helvetica').fontSize(10);

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
      .strokeColor(PDF_THEME.border)
      .moveTo(startX, y + rowHeight)
      .lineTo(startX + tableWidth, y + rowHeight)
      .stroke();

    x = startX + 8;
    const values = [line.title, formatQuantity(qty), unit, total];
    values.forEach((value, index) => {
      doc
        .fillColor(index === 3 ? PDF_THEME.gold : PDF_THEME.bodyText)
        .font(index === 3 ? 'Helvetica-Bold' : 'Helvetica')
        .text(value, x, y + 8, { width: colWidths[index] - 12, align: index === 0 ? 'left' : 'right' });
      x += colWidths[index];
    });

    y += rowHeight;
  }

  doc.restore();
  doc.y = y + 16;

  const totalLabelX = startX + tableWidth - 180;
  doc
    .fillColor(PDF_THEME.muted)
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('Total incl. VAT', totalLabelX, doc.y, { width: 100, align: 'right' });
  doc
    .fillColor(PDF_THEME.gold)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text(formatMoney(order.totalCents, order.currency), totalLabelX + 104, doc.y - 2, {
      width: 76,
      align: 'right',
    });

  doc.moveDown(2);
}

function drawFooter(doc) {
  const y = doc.page.height - 60;
  doc
    .strokeColor(PDF_THEME.border)
    .moveTo(40, y)
    .lineTo(doc.page.width - 40, y)
    .stroke();
  doc
    .fillColor(PDF_THEME.muted)
    .font('Helvetica')
    .fontSize(8)
    .text(
      `Digital goods delivered instantly to your ${brandName()} account. This document was generated automatically.`,
      40,
      y + 10,
      { width: doc.page.width - 80, align: 'center' },
    );
}

function buildInvoicePdf(payload) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { order, lineItems, buyer, seller, recipient, paymentMethod } = payload;

    doc.rect(0, 0, doc.page.width, doc.page.height).fill(PDF_THEME.bodyBg);

    drawHeaderBand(doc, seller);
    drawMetaRow(doc, order, paymentMethod);
    drawPartyBlocks(doc, buyer, seller, recipient);
    drawLineItemsTable(doc, lineItems, order);
    drawFooter(doc);

    doc.end();
  });
}

module.exports = { buildInvoicePdf, PDF_THEME };
