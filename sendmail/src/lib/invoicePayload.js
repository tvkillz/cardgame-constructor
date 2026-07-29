const { getBrand, parseSiteIdFromEmail, siteIdFromAuthSuffix } = require('./siteBrands');

function defaultSeller(siteId) {
  const normalized = String(siteId || 'voidborn').trim().toLowerCase() || 'voidborn';
  const isVoidborn = normalized === 'voidborn';
  const prefix = isVoidborn ? 'INVOICE_COMPANY_' : `INVOICE_COMPANY_${normalized.toUpperCase()}_`;

  const fallbackEmail =
    normalized === 'iyashikei'
      ? 'play@komorebi.club'
      : normalized === 'helix'
        ? 'support@helixsignal.online'
        : normalized === 'final_whistle'
          ? 'support@finalwhistle.games'
          : 'support@voidborn.fun';

  const testDefaults = {
    companyName: 'Test LTD',
    companyNumber: '00000000',
    address: '123 Example Street, Testville, TE1 1ST, United Kingdom',
    email: fallbackEmail,
  };

  // Non-voidborn sites must never inherit voidborn production seller (INVOICE_COMPANY_* globals).
  if (!isVoidborn) {
    return {
      companyName: process.env[`${prefix}NAME`] || testDefaults.companyName,
      companyNumber: process.env[`${prefix}NUMBER`] || testDefaults.companyNumber,
      address: process.env[`${prefix}ADDRESS`] || testDefaults.address,
      email: process.env[`${prefix}EMAIL`] || testDefaults.email,
    };
  }

  return {
    companyName:
      process.env[`${prefix}NAME`] || process.env.INVOICE_COMPANY_NAME || testDefaults.companyName,
    companyNumber:
      process.env[`${prefix}NUMBER`] || process.env.INVOICE_COMPANY_NUMBER || testDefaults.companyNumber,
    address:
      process.env[`${prefix}ADDRESS`] ||
      process.env.INVOICE_COMPANY_ADDRESS ||
      testDefaults.address,
    email:
      process.env[`${prefix}EMAIL`] ||
      process.env.INVOICE_COMPANY_EMAIL ||
      process.env.SMTP_ADMIN_EMAIL ||
      testDefaults.email,
  };
}

function normalizeSiteId(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const id = raw.trim().toLowerCase();
  if (!id) return null;
  return siteIdFromAuthSuffix(id) || (getBrand(id).id === id ? id : null);
}

function resolveInvoiceSiteId(body) {
  const explicit = normalizeSiteId(body?.siteId ?? body?.site ?? body?.site_id);
  if (explicit) return explicit;
  return parseSiteIdFromEmail(body?.recipient) || 'voidborn';
}

function normalizeInvoicePayload(body) {
  const recipient = body?.recipient?.trim();
  if (!recipient) {
    throw Object.assign(new Error('recipient is required'), { status: 400 });
  }

  const order = body?.order;
  if (!order?.id) {
    throw Object.assign(new Error('order.id is required'), { status: 400 });
  }

  const lineItems = Array.isArray(body.lineItems) ? body.lineItems : [];
  if (!lineItems.length) {
    throw Object.assign(new Error('lineItems must contain at least one item'), { status: 400 });
  }

  const siteId = resolveInvoiceSiteId(body);

  return {
    recipient,
    order: {
      id: String(order.id),
      orderNumber: order.orderNumber ? String(order.orderNumber) : null,
      paidAt: order.paidAt || new Date().toISOString(),
      totalCents: Number(order.totalCents) || 0,
      currency: String(order.currency || 'eur').toLowerCase(),
      creditsGranted: Number(order.creditsGranted) || 0,
    },
    lineItems: lineItems.map((line) => ({
      title: String(line.title || 'Item'),
      quantity: Number(line.quantity) || 1,
      unitPriceCents: Number(line.unitPriceCents) || 0,
      ...(line.lineTotalCents != null ? { lineTotalCents: Number(line.lineTotalCents) } : {}),
    })),
    buyer: {
      firstName: String(body.buyer?.firstName ?? ''),
      lastName: String(body.buyer?.lastName ?? ''),
      addressLine1: String(body.buyer?.addressLine1 ?? ''),
      addressLine2: String(body.buyer?.addressLine2 ?? ''),
      city: String(body.buyer?.city ?? ''),
      stateProvince: String(body.buyer?.stateProvince ?? ''),
      postalCode: String(body.buyer?.postalCode ?? ''),
      country: String(body.buyer?.country ?? ''),
      phone: String(body.buyer?.phone ?? ''),
    },
    seller: defaultSeller(siteId),
    paymentMethod: String(body.paymentMethod || 'Test payment'),
    siteId,
  };
}

module.exports = {
  defaultSeller,
  normalizeInvoicePayload,
  resolveInvoiceSiteId,
  normalizeSiteId,
};
