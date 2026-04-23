import express from 'express';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname, basename, resolve, normalize } from 'path';

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

// Security: Path validation helper to prevent directory traversal
const validateFilePath = (userPath, allowedDir) => {
	if (!userPath || typeof userPath !== 'string') {
		throw new Error('Invalid file path');
	}

	// Remove any path traversal attempts and normalize
	const safePath = normalize(userPath).replace(/^(\.\.[\\/])+/, '');
	const fullPath = resolve(join(allowedDir, safePath));
	const allowedDirResolved = resolve(allowedDir);

	// Ensure the resolved path is within the allowed directory
	if (!fullPath.startsWith(allowedDirResolved)) {
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

		// Security: Validate file extension
		if (!validateFileExtension(reportName, ALLOWED_REPORT_EXTENSIONS)) {
			return res.status(400).json({ message: 'File type not allowed' });
		}

		// Security: Prevent path traversal
		const reportPath = validateFilePath(reportName, './reports');

		if (!existsSync(reportPath)) {
			return res.status(404).json({ message: 'Report not found' });
		}

		const content = readFileSync(reportPath);

		// Security: Sanitize filename for download
		const safeFilename = basename(reportName);
		res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
		return res.send(content);
	} catch (error) {
		logger.error('Error in download-report:', error);
		if (error.message && error.message.includes('Path traversal')) {
			return res.status(403).json({ message: 'Access denied' });
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

		// Security: Validate file extension
		if (!validateFileExtension(template, ALLOWED_TEMPLATE_EXTENSIONS)) {
			return res.status(400).json({ message: 'Only HTML templates allowed' });
		}

		// Security: Prevent path traversal
		const templatePath = validateFilePath(template, './templates');

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

		// Security: Validate file extension
		if (!validateFileExtension(filename, ALLOWED_UPLOAD_EXTENSIONS)) {
			return res.status(400).json({ message: 'File type not allowed' });
		}

		// Security: Validate content size (5MB limit)
		if (!validateContentSize(content)) {
			return res.status(400).json({ message: 'File too large (max 5MB)' });
		}

		// Security: Sanitize filename and destination
		const safeFilename = basename(filename);
		const baseUploadDir = './uploads';
		let uploadDir = baseUploadDir;

		if (destination) {
			if (typeof destination !== 'string') {
				return res.status(400).json({ message: 'Invalid destination' });
			}
			uploadDir = validateFilePath(destination, baseUploadDir);
		}

		if (!existsSync(uploadDir)) {
			return res.status(400).json({ message: 'Upload directory does not exist' });
		}

		const uploadPath = join(uploadDir, safeFilename);
		writeFileSync(uploadPath, content);

		return res.json({
			success: true,
			path: uploadPath,
			message: 'File uploaded successfully',
		});
	} catch (error) {
		logger.error('Error in upload-file:', error);
		if (error.message && error.message.includes('Path traversal')) {
			return res.status(403).json({ message: 'Access denied' });
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

		// Security: Validate file extension properly
		if (extname(dataFile).toLowerCase() !== '.csv') {
			return res.status(400).json({ message: 'Only CSV files allowed' });
		}

		// Security: Prevent path traversal
		const csvPath = validateFilePath(dataFile, './data');

		if (!existsSync(csvPath)) {
			return res.status(404).json({ message: 'CSV file not found' });
		}

		const csvData = readFileSync(csvPath, 'utf8');

		res.setHeader('Content-Type', 'text/csv');
		// Security: Sanitize filename for download
		const safeFilename = basename(dataFile);
		res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
		return res.send(csvData);
	} catch (error) {
		logger.error('Error in export-csv:', error);
		if (error.message && error.message.includes('Path traversal')) {
			return res.status(403).json({ message: 'Access denied' });
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
			const filePath = join(dirPath, file);
			const stats = statSync(filePath);

			return {
				name: file,
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

		// Security: Validate file extension properly
		if (extname(configFile).toLowerCase() !== '.json') {
			return res.status(400).json({ message: 'Only JSON config files allowed' });
		}

		// Security: Prevent path traversal
		const configPath = validateFilePath(configFile, './config');

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