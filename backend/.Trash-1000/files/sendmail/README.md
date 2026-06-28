# Stuttgart CRM - Email Service

A Node.js microservice for sending emails via SMTP with support for attachments and HTML content.

## Features

- Send emails with HTML content
- Support for multiple recipients and CC
- File attachments support
- SMTP configuration via environment variables
- Health check endpoint
- Swagger API documentation
- Request logging with Winston
- Docker containerized

## API Endpoints

### Send Email

- **POST** `/api/email/send`
- Send an email with optional attachments

### Health Check

- **GET** `/api/email/health`
- Check SMTP connection and service status

### API Documentation

- **GET** `/api-docs`
- Swagger UI documentation

## Environment Variables

```env
# SMTP Configuration
SMTP_HOST=mail.stuttgart.commercinfo.com
SMTP_PORT=465
SMTP_USER=sendmail@stuttgart.commercinfo.com
SMTP_PASSWORD=your_email_password

# Service Configuration
PORT=6001
NODE_ENV=development
```

## Request Example

```json
{
	"recipients": ["user1@example.com", "user2@example.com"],
	"cc": ["manager@example.com"],
	"subject": "Important Notification",
	"body": "<h1>Hello</h1><p>This is an important message with <strong>HTML</strong> formatting.</p>",
	"attachments": [
		{
			"filename": "document.pdf",
			"content": "JVBERi0xLjQKJcOkw7zDtsO...",
			"encoding": "base64"
		}
	]
}
```

## Response Example

```json
{
	"success": true,
	"message": "Email sent successfully",
	"messageId": "<abc123@mail.stuttgart.commercinfo.com>"
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Docker

The service is containerized and can be run with Docker:

```bash
# Build image
docker build -t stuttgart-sendmail .

# Run container
docker run -p 6001:6001 stuttgart-sendmail
```
