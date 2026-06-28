/**
 * cPanel entrypoint — Application startup file in Node.js Selector.
 * Set BASE_PATH=/api/sendmail when the app is mounted at voidborn.fun/api/sendmail
 */
require('dotenv').config();

const { createApp } = require('./src/app');

const port = Number(process.env.PORT) || 6001;
const basePath = process.env.BASE_PATH || '';

const app = createApp({ basePath });

app.listen(port, '0.0.0.0', () => {
  console.log(
    `[sendmail] listening on :${port} basePath=${basePath || '/'} env=${process.env.NODE_ENV || 'development'}`,
  );
});
