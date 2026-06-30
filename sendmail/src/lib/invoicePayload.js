function defaultSeller() {
  return {
    companyName: process.env.INVOICE_COMPANY_NAME || 'Test LTD',
    companyNumber: process.env.INVOICE_COMPANY_NUMBER || '00000000',
    address:
      process.env.INVOICE_COMPANY_ADDRESS ||
      '123 Example Street, Testville, TE1 1ST, United Kingdom',
    email: process.env.INVOICE_COMPANY_EMAIL || process.env.SMTP_ADMIN_EMAIL || 'support@voidborn.fun',
  };
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

  return {
    recipient,
    order: {
      id: String(order.id),
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
    seller: {
      ...defaultSeller(),
      ...(body.seller || {}),
    },
    paymentMethod: String(body.paymentMethod || 'Test payment'),
  };
}

module.exports = { defaultSeller, normalizeInvoicePayload };
