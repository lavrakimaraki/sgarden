/**
 * Utility functions for exporting data to CSV format
 */

/**
 * Converts an array of objects to CSV string
 * @param {Array} data - Array of objects where each object represents a row
 * @param {Array} headers - Optional array of header names. If not provided, uses keys from first object
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data, headers = null) => {
	if (!data || data.length === 0) {
		return '';
	}

	// Determine headers
	const actualHeaders = headers || Object.keys(data[0]);

	// Create CSV header row
	const csvHeaders = actualHeaders.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(',');

	// Create CSV data rows
	const csvRows = data.map((row) =>
		actualHeaders.map((header) => {
			const value = row[header];
			// Handle null/undefined
			if (value === null || value === undefined) {
				return '';
			}
			// Escape quotes and wrap in quotes if contains comma or quotes
			const stringValue = String(value);
			if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
				return `"${stringValue.replace(/"/g, '""')}"`;
			}
			return stringValue;
		}).join(',')
	);

	return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Exports chart data to CSV and triggers browser download
 * @param {Array} data - Array of data objects to export
 * @param {string} filename - Name of the CSV file (without extension)
 * @param {Array} headers - Optional array of header names
 */
export const exportToCSV = (data, filename, headers = null) => {
	const csv = convertToCSV(data, headers);

	// Create blob
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

	// Create temporary URL
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	// Set link attributes and trigger download
	link.setAttribute('href', url);
	link.setAttribute('download', `${filename}.csv`);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Clean up
	URL.revokeObjectURL(url);
};

/**
 * Exports array data (like chart values) to CSV
 * @param {Array} values - Array of numeric values
 * @param {Array} labels - Array of labels (x-axis labels)
 * @param {string} filename - Name of the CSV file
 */
export const exportArrayToCSV = (values, labels, filename) => {
	if (!values || values.length === 0) {
		console.error('No data to export');
		return;
	}

	// Create data array with labels and values
	const data = (labels || values).map((label, index) => ({
		label: labels ? label : `Item ${index + 1}`,
		value: values[index] || 0,
	}));

	exportToCSV(data, filename, ['label', 'value']);
};
