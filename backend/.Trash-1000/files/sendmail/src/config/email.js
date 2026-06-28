const nodemailer = require('nodemailer');

/**
 * Create email transporter with SMTP configuration
 */
const createTransporter = () => {
	const port = parseInt(process.env.SMTP_PORT) || 587;
	const config = {
		host: process.env.SMTP_HOST,
		port: port,
		secure: port === 465, // true for 465, false for other ports like 587
		auth: {
			user: process.env.SMTP_USER || 'sendmail@stuttgart.commercinfo.com',
			pass: process.env.SMTP_PASSWORD,
		},
		tls: {
			rejectUnauthorized: false,
			ciphers: 'SSLv3',
		},
		connectionTimeout: 60000, // 60 seconds
		greetingTimeout: 30000, // 30 seconds
		socketTimeout: 60000, // 60 seconds
		debug: process.env.NODE_ENV === 'development', // Enable debug in development
	};

	// If port is 587, enable STARTTLS
	if (port === 587) {
		config.requireTLS = true;
	}

	console.log('SMTP Config:', {
		host: config.host,
		port: config.port,
		user: config.auth.user,
		secure: config.secure,
		requireTLS: config.requireTLS,
	});

	return nodemailer.createTransport(config);
};

module.exports = {
	createTransporter,
};
