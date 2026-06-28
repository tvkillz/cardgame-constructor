const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Stuttgart CRM - Email Service API',
			version: '1.0.0',
			description: 'Email service for sending emails with attachments via SMTP',
			contact: {
				name: 'Stuttgart CRM Team',
				email: 'sendmail@stuttgart.commercinfo.com',
			},
		},
		servers: [
			{
				url: 'http://localhost:6001',
				description: 'Development server',
			},
		],
		tags: [
			{
				name: 'Email',
				description: 'Email sending operations',
			},
		],
	},
	apis: ['./src/routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = {
	swaggerUi,
	specs,
};
