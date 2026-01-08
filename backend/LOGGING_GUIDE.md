# Logging Guide

## Overview
The backend uses Winston for comprehensive logging. All logs are written to files in the `logs/` directory and also displayed in the console during development.

## Log Files

The following log files are created in the `backend/logs/` directory:

1. **combined.log** - All logs (info, warn, error, debug)
2. **error.log** - Only error level logs
3. **exceptions.log** - Uncaught exceptions
4. **rejections.log** - Unhandled promise rejections

## Log Levels

- **error** - Error events that might still allow the application to continue
- **warn** - Warning messages for potentially harmful situations
- **info** - Informational messages about general application flow
- **debug** - Detailed information for debugging

## Configuration

Log level can be configured via environment variable:

```bash
LOG_LEVEL=debug  # Options: error, warn, info, debug
```

Default log level is `info`.

## Log File Rotation

- Maximum file size: 5MB
- Maximum files: 5 (keeps 5 rotated files)
- Files are automatically rotated when they reach the size limit

## Usage in Code

### Basic Logging

```javascript
import logger from './config/logger.js';

// Info log
logger.info('User action', { userId: 1, action: 'login' });

// Warning log
logger.warn('Potential issue', { userId: 1, reason: 'multiple attempts' });

// Error log
logger.error('Error occurred', { error: err.message, stack: err.stack });

// Debug log (only in development)
logger.debug('Debug information', { data: someData });
```

### Logging with Context

Always include relevant context in your logs:

```javascript
logger.info('Hotel created', {
  hotelId: hotel.id,
  hotelName: hotel.name,
  userId: req.user.id,
  ip: req.ip
});
```

## Request Logging

All HTTP requests are automatically logged via the `requestLogger` middleware:

- Request method, URL, IP, user agent
- Response status code and duration
- Errors are logged with full context

## Error Logging

Errors are automatically logged with:
- Error message and stack trace
- Request details (method, URL, IP)
- Request body, params, and query (for debugging)

## Best Practices

1. **Include Context**: Always include relevant IDs, user info, and request details
2. **Use Appropriate Levels**: 
   - Use `error` for actual errors
   - Use `warn` for warnings
   - Use `info` for important events
   - Use `debug` for detailed debugging info
3. **Don't Log Sensitive Data**: Never log passwords, tokens, or sensitive user data
4. **Structured Logging**: Use objects for structured data instead of string concatenation

## Viewing Logs

### In Development
Logs are displayed in the console with colors for easy reading.

### In Production
View log files directly:

```bash
# View all logs
tail -f logs/combined.log

# View only errors
tail -f logs/error.log

# Search logs
grep "ERROR" logs/combined.log

# View recent errors
tail -n 100 logs/error.log
```

## Log File Locations

All log files are stored in: `backend/logs/`

**Note**: The `logs/` directory is in `.gitignore` and should not be committed to version control.

## Environment-Specific Behavior

- **Development**: Logs to both console and files
- **Production**: Logs only to files (no console output)

Set `NODE_ENV=production` to enable production mode.

## Monitoring

For production environments, consider:
- Setting up log aggregation (e.g., ELK stack, CloudWatch)
- Setting up alerts for error logs
- Regular log rotation and cleanup
- Monitoring log file sizes

