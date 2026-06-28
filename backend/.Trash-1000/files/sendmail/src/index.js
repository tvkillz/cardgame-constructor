const express = require('express');
const cors = require('cors');
const winston = require('winston');
const emailRoutes = require('./routes/emailRoutes');
const { swaggerUi, specs } = require('./swagger/swagger');

const app = express();
const PORT = process.env.PORT || 6001;

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

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
	logger.info(`${req.method} ${req.path}`, {
		ip: req.ip,
		userAgent: req.get('User-Agent'),
	});
	next();
});

// Routes
app.use('/api/email', emailRoutes);

// Swagger documentation
app.use(
	'/api-docs',
	swaggerUi.serve,
	swaggerUi.setup(specs, {
		explorer: true,
		customCss: '.swagger-ui .topbar { display: none }',
		customSiteTitle: 'Stuttgart CRM - Email Service API',
	})
);

// Root endpoint
app.get('/', (req, res) => {
	res.json({
		service: 'Stuttgart CRM - Email Service',
		version: '1.0.0',
		status: 'running',
		documentation: '/api-docs',
		endpoints: {
			sendEmail: 'POST /api/email/send',
			healthCheck: 'GET /api/email/health',
		},
	});
});

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({
		status: 'healthy',
		timestamp: new Date().toISOString(),
		service: 'sendmail-service',
	});
});

// Error handling middleware
app.use((error, req, res, next) => {
	logger.error('Unhandled error', {
		error: error.message,
		stack: error.stack,
		path: req.path,
		method: req.method,
	});

	res.status(500).json({
		success: false,
		message: 'Internal server error',
		error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
	});
});

// 404 handler
app.use('*', (req, res) => {
	res.status(404).json({
		success: false,
		message: 'Endpoint not found',
		path: req.originalUrl,
	});
});

// Start server
app.listen(PORT, () => {
	logger.info(`Email service started on port ${PORT}`);
	logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
	console.log(`🚀 Email service running on port ${PORT}`);
	console.log(`📚 API docs: http://localhost:${PORT}/api-docs`);
});
