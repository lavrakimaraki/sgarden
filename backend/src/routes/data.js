import express from "express";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, extname, basename, resolve, normalize } from "path";

const router = express.Router({ mergeParams: true });

// Security: Path validation helper to prevent directory traversal
const validateFilePath = (userPath, allowedDir) => {
    if (!userPath || typeof userPath !== 'string') {
        throw new Error('Invalid file path');
    }
    
    // Remove any path traversal attempts and normalize
    const safePath = normalize(userPath).replace(/^(\.\.[\/\\])+/, '');
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
const validateContentSize = (content, maxSize = 5 * 1024 * 1024) => { // Default 5MB
    if (typeof content === 'string') {
        return Buffer.byteLength(content, 'utf8') <= maxSize;
    }
    return content.length <= maxSize;
};

const generateRandomData = (min = 0, max = 10) => Math.random() * (max - min) + min;

router.get("/", async (req, res) => {
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
        console.error('Error in root endpoint:', error);
        return res.status(500).json({ message: "Something went wrong." });
    }
});

router.get("/download-report", (req, res) => {
    try {
        const { reportName } = req.query;

        if (!reportName || typeof reportName !== 'string') {
            return res.status(400).json({ message: "Report name required" });
        }

        // Security: Validate file extension
        const allowedExtensions = ['.pdf', '.xlsx', '.docx', '.txt', '.csv'];
        if (!validateFileExtension(reportName, allowedExtensions)) {
            return res.status(400).json({ message: "File type not allowed" });
        }

        // Security: Prevent path traversal
        const reportPath = validateFilePath(reportName, "./reports");

        if (existsSync(reportPath)) {
            const content = readFileSync(reportPath);
            
            // Security: Sanitize filename for download
            const safeFilename = basename(reportName);
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
            return res.send(content);
        }

        return res.status(404).json({ message: "Report not found" });
    } catch (error) {
        console.error('Error in download-report:', error);
        if (error.message.includes('Path traversal')) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (error.code === 'ENOENT') {
            return res.status(404).json({ message: "Report not found" });
        }
        return res.status(500).json({ message: "Download failed" });
    }
});

router.get("/render-page", (req, res) => {
    try {
        const { template } = req.query;

        if (!template || typeof template !== 'string') {
            return res.status(400).json({ message: "Template name required" });
        }

        // Security: Validate file extension
        const allowedExtensions = ['.html', '.htm'];
        if (!validateFileExtension(template, allowedExtensions)) {
            return res.status(400).json({ message: "Only HTML templates allowed" });
        }

        // Security: Prevent path traversal
        const templatePath = validateFilePath(template, "./templates");

        if (existsSync(templatePath)) {
            const templateContent = readFileSync(templatePath, 'utf8');
            return res.send(templateContent);
        }

        return res.status(404).json({ message: "Template not found" });
    } catch (error) {
        console.error('Error in render-page:', error);
        if (error.message.includes('Path traversal')) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (error.code === 'ENOENT') {
            return res.status(404).json({ message: "Template not found" });
        }
        return res.status(500).json({ message: "Template rendering failed" });
    }
});

router.post("/upload-file", (req, res) => {
    try {
        const { filename, content, destination } = req.body;

        if (!filename || !content || typeof filename !== 'string') {
            return res.status(400).json({ message: "Filename and content required" });
        }

        // Security: Validate file extension
        const allowedExtensions = ['.txt', '.csv', '.json', '.xml'];
        if (!validateFileExtension(filename, allowedExtensions)) {
            return res.status(400).json({ message: "File type not allowed" });
        }

        // Security: Validate content size (5MB limit)
        if (!validateContentSize(content)) {
            return res.status(400).json({ message: "File too large (max 5MB)" });
        }

        // Security: Sanitize filename and destination
        const safeFilename = basename(filename);
        const baseUploadDir = "./uploads";
        let uploadDir = baseUploadDir;
        
        if (destination) {
            uploadDir = validateFilePath(destination, baseUploadDir);
        }

        const uploadPath = join(uploadDir, safeFilename);

        // Ensure upload directory exists
        try {
            if (!existsSync(uploadDir)) {
                return res.status(400).json({ message: "Upload directory does not exist" });
            }
        } catch (dirError) {
            console.error('Directory check error:', dirError);
            return res.status(500).json({ message: "Upload failed" });
        }

        writeFileSync(uploadPath, content);

        return res.json({ 
            success: true, 
            path: uploadPath,
            message: "File uploaded successfully"
        });
    } catch (error) {
        console.error('Error in upload-file:', error);
        if (error.message.includes('Path traversal')) {
            return res.status(403).json({ message: "Access denied" });
        }
        return res.status(500).json({ message: "Upload failed" });
    }
});

router.get("/export-csv", (req, res) => {
    try {
        const { dataFile } = req.query;

        if (!dataFile || typeof dataFile !== 'string') {
            return res.status(400).json({ message: "Data file required" });
        }

        // Security: Validate file extension properly
        if (extname(dataFile).toLowerCase() !== '.csv') {
            return res.status(400).json({ message: "Only CSV files allowed" });
        }

        // Security: Prevent path traversal
        const csvPath = validateFilePath(dataFile, "./data");

        if (existsSync(csvPath)) {
            const csvData = readFileSync(csvPath, 'utf8');

            res.setHeader('Content-Type', 'text/csv');
            // Security: Sanitize filename for download
            const safeFilename = basename(dataFile);
            res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
            return res.send(csvData);
        }

        return res.status(404).json({ message: "CSV file not found" });
    } catch (error) {
        console.error('Error in export-csv:', error);
        if (error.message.includes('Path traversal')) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (error.code === 'ENOENT') {
            return res.status(404).json({ message: "CSV file not found" });
        }
        return res.status(500).json({ message: "Export failed" });
    }
});

router.get("/browse-files", (req, res) => {
    try {
        const { directory } = req.query;

        if (!directory || typeof directory !== 'string') {
            return res.status(400).json({ message: "Directory required" });
        }

        // Security: Prevent path traversal
        const dirPath = validateFilePath(directory, "./files");

        if (existsSync(dirPath)) {
            const files = readdirSync(dirPath);

            const fileList = files.map(file => {
                const filePath = join(dirPath, file);
                const stats = statSync(filePath);

                return {
                    name: file,
                    size: stats.size,
                    isDirectory: stats.isDirectory(),
                    modified: stats.mtime
                };
            });

            return res.json({ success: true, files: fileList });
        }

        return res.status(404).json({ message: "Directory not found" });
    } catch (error) {
        console.error('Error in browse-files:', error);
        if (error.message.includes('Path traversal')) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (error.code === 'ENOENT') {
            return res.status(404).json({ message: "Directory not found" });
        }
        return res.status(500).json({ message: "Could not list directory" });
    }
});

router.get("/config/load", (req, res) => {
    try {
        const { configFile } = req.query;

        if (!configFile || typeof configFile !== 'string') {
            return res.status(400).json({ message: "Config file required" });
        }

        // Security: Validate file extension properly
        if (extname(configFile).toLowerCase() !== '.json') {
            return res.status(400).json({ message: "Only JSON config files allowed" });
        }

        // Security: Prevent path traversal
        const configPath = validateFilePath(configFile, "./config");

        if (existsSync(configPath)) {
            const configContent = readFileSync(configPath, 'utf8');
            
            // Security: Validate JSON before parsing
            let config;
            try {
                config = JSON.parse(configContent);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                return res.status(400).json({ message: "Invalid JSON configuration file" });
            }
            
            return res.json({ success: true, config });
        }

        return res.status(404).json({ message: "Config file not found" });
    } catch (error) {
        console.error('Error in config/load:', error);
        if (error.message.includes('Path traversal')) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (error.code === 'ENOENT') {
            return res.status(404).json({ message: "Config file not found" });
        }
        return res.status(500).json({ message: "Could not load config" });
    }
});

// Security: Safe template rendering using simple string replacement
const renderTemplate = (templateString, data) => {
    // Allow only specific placeholders with alphanumeric keys
    const allowedKeys = ['username', 'date', 'totalUsers'];
    let result = templateString;
    
    for (const key of allowedKeys) {
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

router.post("/generate-custom-report", (req, res) => {
    try {
        const { templateString, data } = req.body;

        if (!templateString || typeof templateString !== 'string') {
            return res.status(400).json({ message: "Template string required" });
        }

        // Security: Limit template size
        if (templateString.length > 10000) {
            return res.status(400).json({ message: "Template string too large" });
        }

        const reportData = data || {
            username: "Unknown",
            date: new Date().toLocaleDateString(),
            totalUsers: 100
        };

        // Security: Use safe template rendering instead of eval
        const report = renderTemplate(templateString, reportData);

        return res.json({ 
            success: true, 
            report,
            generatedAt: new Date()
        });
    } catch (error) {
        console.error('Error in generate-custom-report:', error);
        return res.status(500).json({ message: "Report generation failed" });
    }
});

export default router;
