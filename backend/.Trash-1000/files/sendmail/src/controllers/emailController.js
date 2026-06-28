const { createTransporter } = require('../config/email');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
	transports: [
		new winston.transports.File({ filename: 'error.log', level: 'error' }),
		new winston.transports.File({ filename: 'combined.log' }),
		new winston.transports.Console({
			format: winston.format.simple(),
		}),
	],
});

/**
 * Send email endpoint
 */
const sendEmail = async (req, res) => {
	try {
		const { recipients, cc, subject, body, attachments } = req.body;

		// Validate required fields
		if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Recipients array is required and must not be empty',
			});
		}

		if (!subject || !body) {
			return res.status(400).json({
				success: false,
				message: 'Subject and body are required',
			});
		}

		// Create transporter
		const transporter = createTransporter();

		// Prepare email options
		const mailOptions = {
			from: `"Stuttgart Workshop" <${process.env.SMTP_USER || 'sendmail@stuttgart.commercinfo.com'}>`,
			to: recipients.join(', '),
			subject: subject,
			html: body,
		};

		// Add CC if provided
		if (cc && Array.isArray(cc) && cc.length > 0) {
			mailOptions.cc = cc.join(', ');
		}

		// Add attachments if provided
		if (attachments && Array.isArray(attachments) && attachments.length > 0) {
			mailOptions.attachments = attachments.map((attachment) => ({
				filename: attachment.filename,
				content: attachment.content,
				encoding: attachment.encoding || 'base64',
			}));
		}

		// Send email
		const info = await transporter.sendMail(mailOptions);

		logger.info('Email sent successfully', {
			messageId: info.messageId,
			recipients: recipients,
			subject: subject,
		});

		res.status(200).json({
			success: true,
			message: 'Email sent successfully',
			messageId: info.messageId,
		});
	} catch (error) {
		logger.error('Error sending email', {
			error: error.message,
			stack: error.stack,
		});

		res.status(500).json({
			success: false,
			message: 'Failed to send email',
			error: error.message,
		});
	}
};

/**
 * Health check endpoint
 */
const healthCheck = async (req, res) => {
	try {
		const transporter = createTransporter();
		await transporter.verify();

		res.status(200).json({
			success: true,
			message: 'Email service is healthy',
			smtp: {
				host: process.env.SMTP_HOST || 'mail.stuttgart.commercinfo.com',
				port: process.env.SMTP_PORT || 465,
				user: process.env.SMTP_USER || 'sendmail@stuttgart.commercinfo.com',
			},
		});
	} catch (error) {
		logger.error('SMTP connection failed', {
			error: error.message,
		});

		res.status(500).json({
			success: false,
			message: 'Email service is not healthy',
			error: error.message,
		});
	}
};

module.exports = {
	sendEmail,
	healthCheck,
};
