const nodemailer = require('nodemailer');

// Test different SMTP configurations
const testConfigs = [
	{
	name: 'Port 25 (Plain)',
	host: 'mail.stw.lv',
	port: 25,
	secure: false,           // plaintext
	requireTLS: false,       // do not force TLS
	auth: {
		user: 'no-reply@stw.lv',
		pass: process.env.SMTP_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
	connectionTimeout: 5000,  // 5s max to connect
	greetingTimeout: 5000,    // 5s max wait
	}

	// {
	// 	name: 'Port 465 (SSL)',
	// 	host: '91.105.203.99',
	// 	port: 465,
	// 	secure: true,
	// 	auth: {
	// 		user: 'sendmail@stuttgart.commercinfo.com',
	// 		pass: process.env.SMTP_PASSWORD,
	// 	},
	// 	tls: {
	// 		rejectUnauthorized: false,
	// 	},
	// },
	// {
	// 	name: 'Port 587 (STARTTLS)',
	// 	host: '91.105.203.99',
	// 	port: 587,
	// 	secure: false,
	// 	requireTLS: true,
	// 	auth: {
	// 		user: 'sendmail@stuttgart.commercinfo.com',
	// 		pass: process.env.SMTP_PASSWORD,
	// 	},
	// 	tls: {
	// 		rejectUnauthorized: false,
	// 	},
	// },
	// {
	// 	name: 'Port 25 (Plain)',
	// 	host: '91.105.203.99',
	// 	port: 25,
	// 	secure: false,
	// 	auth: {
	// 		user: 'sendmail@stuttgart.commercinfo.com',
	// 		pass: process.env.SMTP_PASSWORD,
	// 	},
	// 	tls: {
	// 		rejectUnauthorized: false,
	// 	},
	// },
];




async function testSMTPConnection(config) {
	console.log(`\n🔍 Testing ${config.name}...`);
	console.log(`Host: ${config.host}:${config.port}`);

	try {
		const transporter = nodemailer.createTransport(config);
		await transporter.verify();
		console.log(`✅ ${config.name} - Connection successful!`);
		return true;
	} catch (error) {
		console.log(`❌ ${config.name} - Connection failed:`, error.message);
		return false;
	}
}

async function runTests() {
	console.log('🚀 Testing SMTP connections...\n');

	if (!process.env.SMTP_PASSWORD) {
		console.log('❌ SMTP_PASSWORD environment variable is not set!');
		return;
	}

	for (const config of testConfigs) {
		await testSMTPConnection(config);
	}

	console.log('\n✨ Test completed!');
}

// runTests().catch(console.error);

(async () => {
  const transporter = nodemailer.createTransport({
    host: 'mail.stw.lv',
    port: 25,
    secure: false,
    auth: {
      user: 'no-reply@stw.lv',
      pass: process.env.SMTP_PASSWORD,
    },
    ignoreTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    logger: true,
    debug: true,
  });

  const info = await transporter.sendMail({
    from: 'no-reply@stw.lv',
    to: 'andrewmalewski@gmail.com',
    subject: 'Node SMTP test',
    text: 'This should work exactly like swaks',
  });

  console.log('SENT:', info.messageId);
})();

