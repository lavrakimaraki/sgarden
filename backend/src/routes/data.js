import express from 'express';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname, basename, resolve, normalize, sep } from 'path';

const router = express.Router({ mergeParams: true });

// Constants
const MAX_CONTENT_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEMPLATE_SIZE = 10_000; // 10KB
const ALLOWED_REPORT_EXTENSIONS = ['.pdf', '.xlsx', '.docx', '.txt', '.csv'];
const ALLOWED_UPLOAD_EXTENSIONS = ['.txt', '.csv', '.json', '.xml'];
const ALLOWED_TEMPLATE_EXTENSIONS = ['.html', '.htm'];
const ALLOWED_TEMPLATE_KEYS = ['username', 'date', 'totalUsers'];

// Helper: Logger wrapper (replace console for production)
const logger = {
	error: (message, error) => {
		// eslint-disable-next-line no-console
		console.error(message, error);
		// TODO: Replace with proper logging library (winston, pino, etc.)
	},
};

/**
 * Sanitize filename - removes path separators and dangerous characters
 * This prevents path traversal attacks at the filename level
 */
const sanitizeFilename = (filename) => {
	if (!filename || typeof filename !== 'string') {
		throw new Error('Invalid filename');
	}

	// Remove any path separators, null bytes, and control characters
	let sanitized = filename
		.replace(/[/\\]/g, '') // Remove / and \
		.replace(/\.\./g, '') // Remove ..
		.replace(/\0/g, '') // Remove null bytes
		.replace(/[\x00-\x1f\x80-\x9f]/g, '') // Remove control characters
		.trim();

	// Ensure the filename doesn't start with a dot (hidden files)
	if (sanitized.startsWith('.')) {
		sanitized = sanitized.slice(1);
	}

	// Ensure filename is not empty after sanitization
	if (!sanitized || sanitized.length === 0) {
		throw new Error('Invalid filename after sanitization');
	}

	// Limit filename length
	if (sanitized.length > 255) {
		throw new Error('Filename too long');
	}

	return sanitized;
};

/**
 * Security: Path validation helper to prevent directory traversal
 * Returns a validated, safe absolute path within the allowed directory
 */
const validateFilePath = (userPath, allowedDir) => {
	if (!userPath || typeof userPath !== 'string') {
		throw new Error('Invalid file path');
	}

	// First, sanitize the user path to remove obvious traversal attempts
	const sanitized = userPath
		.replace(/\0/g, '') // Remove null bytes
		.replace(/[\x00-\x1f\x80-\x9f]/g, ''); // Remove control characters

	// Normalize and remove leading traversal attempts
	const normalized = normalize(sanitized).replace(/^(\.\.[\\/])+/, '');

	// Get absolute path of allowed directory
	const allowedDirResolved = resolve(allowedDir);

	// Construct the full path (DO NOT use user input directly in join)
	// Instead, use the normalized and sanitized path
	const fullPath = resolve(allowedDirResolved, normalized);

	// Critical: Ensure the resolved path is within the allowed directory
	// Use path.relative to check if we escaped the allowed directory
	const relativePath = fullPath.substring(allowedDirResolved.length);
	
	if (!fullPath.startsWith(allowedDirResolved + sep) && fullPath !== allowedDirResolved) {
		throw new Error('Path traversal attempt detected');
	}

	// Additional check: ensure no parent directory references in the final path
	if (relativePath.includes('..')) {
		throw new Error('Path traversal attempt detected');
	}

	return fullPath;
};

// Security: File extension validation helper
const validateFileExtension = (filename, allowedExtensions) => {
	const ext = extname(filename).toLowerCase();
	return allowedExtensions.includes(ext);
};

// Security: Content size validation helper
const validateContentSize = (content, maxSize = MAX_CONTENT_SIZE) => {
	if (typeof content === 'string') {
		return Buffer.byteLength(content, 'utf8') <= maxSize;
	}
	return content.length <= maxSize;
};

// Helper: Generate random data
const generateRandomData = (min = 0, max = 10) => {
	return Math.random() * (max - min) + min;
};

// Security: Safe template rendering using simple string replacement
const renderTemplate = (templateString, data) => {
	let result = templateString;

	for (const key of ALLOWED_TEMPLATE_KEYS) {
		if (data[key] !== undefined) {
			// Escape any potential HTML/script content
			const safeValue = String(data[key])
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#x27;');

			const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
			result = result.replace(regex, safeValue);
		}
	}

	return result;
};

// Routes

router.get('/', async (_req, res) => {
	try {
		const quarterlySalesDistribution = {
			Q1: Array.from({ length: 100 }, () => generateRandomData(0, 10)),
			Q2: Array.from({ length: 100 }, () => generateRandomData(0, 10)),
			Q3: Array.from({ length: 100 }, () => generateRandomData(0, 10)),
		};

		const budgetVsActual = {
			January: { budget: generateRandomData(0, 100), actual: generateRandomData(0, 100), forecast: generateRandomData(0, 100) },
			February: { budget: generateRandomData(0, 100), actual: generateRandomData(0, 100), forecast: generateRandomData(0, 100) },
			March: { budget: generateRandomData(0, 100), actual: generateRandomData(0, 100), forecast: generateRandomData(0, 100) },
			April: { budget: generateRandomData(0, 100), actual: generateRandomData(0, 100), forecast: generateRandomData(0, 100) },
			May: { budget: generateRandomData(0, 100), actual: generateRandomData(0, 100), forecast: generateRandomData(0, 100) },
			June: { budget: generateRandomData(0, 100), actual: generateRandomData(0, 100), forecast: generateRandomData(0, 100) },
		};

		const timePlot = {
			projected: Array.from({ length: 20 }, () => generateRandomData(0, 100)),
			actual: Array.from({ length: 20 }, () => generateRandomData(0, 100)),
			historicalAvg: Array.from({ length: 20 }, () => generateRandomData(0, 100)),
		};

		return res.json({
			success: true,
			quarterlySalesDistribution,
			budgetVsActual,
			timePlot,
		});
	} catch (error) {
		logger.error('Error in root endpoint:', error);
		return res.status(500).json({ message: 'Something went wrong.' });
	}
});

router.get('/download-report', (req, res) => {
	try {
		const { reportName } = req.query;

		if (!reportName || typeof reportName !== 'string') {
			return res.status(400).json({ message: 'Report name required' });
		}

		// Security: Sanitize filename FIRST
		const safeFilename = sanitizeFilename(reportName);

		// Security: Validate file extension
		if (!validateFileExtension(safeFilename, ALLOWED_REPORT_EXTENSIONS)) {
			return res.status(400).json({ message: 'File type not allowed' });
		}

		// Security: Prevent path traversal - use sanitized filename
		const reportPath = validateFilePath(safeFilename, './reports');

		if (!existsSync(reportPath)) {
			return res.status(404).json({ message: 'Report not found' });
		}

		const content = readFileSync(reportPath);

		// Use already sanitized filename for Content-Disposition
		res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
		return res.send(content);
	} catch (error) {
		logger.error('Error in download-report:', error);
		if (error.message && error.message.includes('Path traversal')) {
			return res.status(403).json({ message: 'Access denied' });
		}
		if (error.message && error.message.includes('Invalid filename')) {
			return res.status(400).json({ message: 'Invalid filename' });
		}
		if (error.code === 'ENOENT') {
			return res.status(404).json({ message: 'Report not found' });
		}
		return res.status(500).json({ message: 'Download failed' });
	}
});

router.get('/render-page', (req, res) => {
	try {
		const { template } = req.query;

		if (!template || typeof template !== 'string') {
			return res.status(400).json({ message: 'Template name required' });
		}

		// Security: Sanitize filename FIRST
		const safeTemplate = sanitizeFilename(template);

		// Security: Validate file extension
		if (!validateFileExtension(safeTemplate, ALLOWED_TEMPLATE_EXTENSIONS)) {
			return res.status(400).json({ message: 'Only HTML templates allowed' });
		}

		// Security: Prevent path traversal
		const templatePath = validateFilePath(safeTemplate, './templates');

		if (!existsSync(templatePath)) {
			return res.status(404).json({ message: 'Template not found' });
		}

		const templateContent = readFileSync(templatePath, 'utf8');
		return res.send(templateContent);
	} catch (error) {
		logger.error('Error in render-page:', error);
		if (error.message && error.message.includes('Path traversal')) {
			return res.status(403).json({ message: 'Access denied' });
		}
		if (error.message && error.message.includes('Invalid filename')) {
			return res.status(400).json({ message: 'Invalid template name' });
		}
		if (error.code === 'ENOENT') {
			return res.status(404).json({ message: 'Template not found' });
		}
		return res.status(500).json({ message: 'Template rendering failed' });
	}
});

router.post('/upload-file', (req, res) => {
	try {
		const { filename, content, destination } = req.body;

		if (!filename || !content || typeof filename !== 'string') {
			return res.status(400).json({ message: 'Filename and content required' });
		}

		// Security: Sanitize filename FIRST - CRITICAL
		const safeFilename = sanitizeFilename(filename);

		// Security: Validate file extension
		if (!validateFileExtension(safeFilename, ALLOWED_UPLOAD_EXTENSIONS)) {
			return res.status(400).json({ message: 'File type not allowed' });
		}

		// Security: Validate content size (5MB limit)
		if (!validateContentSize(content)) {
			return res.status(400).json({ message: 'File too large (max 5MB)' });
		}

		// Security: Handle destination directory
		const baseUploadDir = './uploads';
		let validatedUploadDir = resolve(baseUploadDir);

		if (destination) {
			if (typeof destination !== 'string') {
				return res.status(400).json({ message: 'Invalid destination' });
			}
			// Validate destination is within base upload directory
			validatedUploadDir = validateFilePath(destination, baseUploadDir);
		}

		if (!existsSync(validatedUploadDir)) {
			return res.status(400).json({ message: 'Upload directory does not exist' });
		}

		// CRITICAL: Use validated directory + sanitized filename
		// DO NOT use join with user input directly
		const uploadPath = resolve(validatedUploadDir, safeFilename);

		// Double-check the final path is still within the upload directory
		if (!uploadPath.startsWith(validatedUploadDir + sep)) {
			throw new Error('Path traversal attempt detected');
		}

		writeFileSync(uploadPath, content);

		return res.json({
			success: true,
			// Don't expose full server path
			filename: safeFilename,
			message: 'File uploaded successfully',
		});
	} catch (error) {
		logger.error('Error in upload-file:', error);
		if (error.message && error.message.includes('Path traversal')) {
			return res.status(403).json({ message: 'Access denied' });
		}
		if (error.message && error.message.includes('Invalid filename')) {
			return res.status(400).json({ message: 'Invalid filename' });
		}
		return res.status(500).json({ message: 'Upload failed' });
	}
});

router.get('/export-csv', (req, res) => {
	try {
		const { dataFile } = req.query;

		if (!dataFile || typeof dataFile !== 'string') {
			return res.status(400).json({ message: 'Data file required' });
		}

		// Security: Sanitize filename FIRST
		const safeFilename = sanitizeFilename(dataFile);

		// Security: Validate file extension properly
		if (extname(safeFilename).toLowerCase() !== '.csv') {
			return res.status(400).json({ message: 'Only CSV files allowed' });
		}

		// Security: Prevent path traversal
		const csvPath = validateFilePath(safeFilename, './data');

		if (!existsSync(csvPath)) {
			return res.status(404).json({ message: 'CSV file not found' });
		}

		const csvData = readFileSync(csvPath, 'utf8');

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
		return res.send(csvData);
	} catch (error) {
		logger.error('Error in export-csv:', error);
		if (error.message && error.message.includes('Path traversal')) {
			return res.status(403).json({ message: 'Access denied' });
		}
		if (error.message && error.message.includes('Invalid filename')) {
			return res.status(400).json({ message: 'Invalid filename' });
		}
		if (error.code === 'ENOENT') {
			return res.status(404).json({ message: 'CSV file not found' });
		}
		return res.status(500).json({ message: 'Export failed' });
	}
});

router.get('/browse-files', (req, res) => {
	try {
		const { directory } = req.query;

		if (!directory || typeof directory !== 'string') {
			return res.status(400).json({ message: 'Directory required' });
		}

		// Security: Prevent path traversal
		const dirPath = validateFilePath(directory, './files');

		if (!existsSync(dirPath)) {
			return res.status(404).json({ message: 'Directory not found' });
		}

		const files = readdirSync(dirPath);

		const fileList = files.map((file) => {
			// Security: Sanitize each filename from directory listing
			// Even though these come from the filesystem, still validate
			const safeFile = sanitizeFilename(file);
			const filePath = resolve(dirPath, safeFile);

			// Ensure the file is still within the allowed directory
			if (!filePath.startsWith(dirPath + sep)) {
				throw new Error('Path traversal attempt detected');
			}

			const stats = statSync(filePath);

			return {
				name: safeFile,
				size: stats.size,
				isDirectory: stats.isDirectory(),
				modified: stats.mtime,
			};
		});

		return res.json({ success: true, files: fileList });
	} catch (error) {
		logger.error('Error in browse-files:', error);
		if (error.message && error.message.includes('Path traversal')) {
			return res.status(403).json({ message: 'Access denied' });
		}
		if (error.code === 'ENOENT') {
			return res.status(404).json({ message: 'Directory not found' });
		}
		return res.status(500).json({ message: 'Could not list directory' });
	}
});

router.get('/config/load', (req, res) => {
	try {
		const { configFile } = req.query;

		if (!configFile || typeof configFile !== 'string') {
			return res.status(400).json({ message: 'Config file required' });
		}

		// Security: Sanitize filename FIRST
		const safeFilename = sanitizeFilename(configFile);

		// Security: Validate file extension properly
		if (extname(safeFilename).toLowerCase() !== '.json') {
			return res.status(400).json({ message: 'Only JSON config files allowed' });
		}

		// Security: Prevent path traversal
		const configPath = validateFilePath(safeFilename, './config');

		if (!existsSync(configPath)) {
			return res.status(404).json({ message: 'Config file not found' });
		}

		const configContent = readFileSync(configPath, 'utf8');

		// Security: Validate JSON before parsing
		let config;
		try {
			config = JSON.parse(configContent);
		} catch (parseError) {
			logger.error('JSON parse error:', parseError);
			return res.status(400).json({ message: 'Invalid JSON configuration file' });
		}

		return res.json({ success: true, config });
	} catch (error) {
		logger.error('Error in config/load:', error);
		if (error.message && error.message.includes('Path traversal')) {
			return res.status(403).json({ message: 'Access denied' });
		}
		if (error.message && error.message.includes('Invalid filename')) {
			return res.status(400).json({ message: 'Invalid config filename' });
		}
		if (error.code === 'ENOENT') {
			return res.status(404).json({ message: 'Config file not found' });
		}
		return res.status(500).json({ message: 'Could not load config' });
	}
});

router.post('/generate-custom-report', (req, res) => {
	try {
		const { templateString, data } = req.body;

		if (!templateString || typeof templateString !== 'string') {
			return res.status(400).json({ message: 'Template string required' });
		}

		// Security: Limit template size
		if (templateString.length > MAX_TEMPLATE_SIZE) {
			return res.status(400).json({ message: 'Template string too large' });
		}

		const reportData = data || {
			username: 'Unknown',
			date: new Date().toLocaleDateString(),
			totalUsers: 100,
		};

		// Security: Use safe template rendering instead of eval
		const report = renderTemplate(templateString, reportData);

		return res.json({
			success: true,
			report,
			generatedAt: new Date(),
		});
	} catch (error) {
		logger.error('Error in generate-custom-report:', error);
		return res.status(500).json({ message: 'Report generation failed' });
	}
});

export default router;