const express = require('express');
const { mailAuth } = require('./middleware/mailAuth');
const emailController = require('./controllers/emailController');
const hookController = require('./controllers/hookController');
const invoiceController = require('./controllers/invoiceController');
const withdrawalController = require('./controllers/withdrawalController');

function normalizeBasePath(basePath) {
  if (!basePath || basePath === '/') return '';
  return `/${basePath.replace(/^\/+|\/+$/g, '')}`;
}

function createApp({ basePath = process.env.BASE_PATH || '' } = {}) {
  const app = express();
  const base = normalizeBasePath(basePath);

  app.disable('x-powered-by');
  app.set('trust proxy', true);

  app.get(base || '/', (_req, res) => {
    res.json({
      service: 'voidborn-sendmail',
      basePath: base || '/',
      routes: {
        health: `${base}/health`,
        smtpHealth: `${base}/smtp-health`,
        test: `POST ${base}/test`,
        send: `POST ${base}/send`,
        invoice: `POST ${base}/invoice`,
        withdrawal: `POST ${base}/withdrawal`,
        hook: `POST ${base}/hook`,
      },
    });
  });

  app.get(`${base}/health`, (_req, res) => {
    res.json({ ok: true, service: 'voidborn-sendmail' });
  });

  // GoTrue hook — raw body required for Standard Webhooks signature
  app.post(
    `${base}/hook`,
    express.raw({ type: 'application/json', limit: '1mb' }),
    hookController.handleSendEmailHook,
  );

  app.use(express.json({ limit: '2mb' }));

  app.get(`${base}/smtp-health`, mailAuth, emailController.smtpHealth);
  app.post(`${base}/test`, mailAuth, emailController.sendTestEmail);
  app.post(`${base}/send`, mailAuth, emailController.sendEmail);
  app.post(`${base}/invoice`, mailAuth, invoiceController.sendInvoice);
  app.post(`${base}/withdrawal`, mailAuth, withdrawalController.sendWithdrawalConfirmation);

  app.use((err, _req, res, _next) => {
    console.error('[sendmail] unhandled:', err.message);
    res.status(500).json({ success: false, message: err.message });
  });

  return app;
}

module.exports = { createApp, normalizeBasePath };
