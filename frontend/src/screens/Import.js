import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
	Box,
	Typography,
	Paper,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Alert,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Divider,
	List,
	ListItem,
	ListItemText,
} from '@mui/material';
import { CloudUpload as UploadIcon, Description as FileIcon, History as HistoryIcon } from '@mui/icons-material';

const TARGET_FIELDS = ['category', 'month', 'year', 'value', 'unit', 'notes', 'ignore'];
const HISTORY_KEY = 'import-history';

const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
        const row = {};
        headers.forEach((h, i) => {
            row[h] = values[i] !== undefined ? values[i] : '';
        });
        return row;
    });
    return { headers, rows };
};

const parseJSON = (text) => {
	const data = JSON.parse(text);
	const arr = Array.isArray(data) ? data : [data];
	if (arr.length === 0) return { headers: [], rows: [] };
	const headers = Object.keys(arr[0]);
	return { headers, rows: arr };
};

const validateRow = (row, headers) => {
	const errors = [];
	for (const h of headers) {
		if (row[h] === undefined || row[h] === null || row[h] === '') {
			errors.push(`Missing value for "${h}"`);
		}
	}
	return errors;
};

const Import = () => {
	const [fileName, setFileName] = useState('');
	const [headers, setHeaders] = useState([]);
	const [rows, setRows] = useState([]);
	const [errorRows, setErrorRows] = useState({});
	const [errorMessage, setErrorMessage] = useState('');
	const [summary, setSummary] = useState(null);
	const [isDragging, setIsDragging] = useState(false);
	const [columnMapping, setColumnMapping] = useState({});
	const [history, setHistory] = useState([]);
	const fileInputRef = useRef(null);

	// Load history on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem(HISTORY_KEY);
			if (stored) setHistory(JSON.parse(stored));
		} catch (e) { /* ignore */ }
	}, []);

	const persistHistory = useCallback((items) => {
		try {
			localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
		} catch (e) { /* ignore */ }
	}, []);

	const handleFile = useCallback((file) => {
		if (!file) return;
		setFileName(file.name);
		setSummary(null);
		setErrorMessage('');

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target.result;
			try {
				let parsed;
				if (file.name.toLowerCase().endsWith('.json')) {
					parsed = parseJSON(text);
				} else {
					parsed = parseCSV(text);
				}

				const { headers: hdrs, rows: rws } = parsed;

				if (hdrs.length === 0 || rws.length === 0) {
					setErrorMessage('File is empty or invalid format');
					setHeaders([]);
					setRows([]);
					setErrorRows({});
					setColumnMapping({});
					return;
				}

				// Auto-map columns
				const initialMapping = {};
				hdrs.forEach((h) => {
					const lower = h.toLowerCase();
					const match = TARGET_FIELDS.find((tf) => tf.toLowerCase() === lower);
					initialMapping[h] = match || 'ignore';
				});

				const errs = {};
				let errorCount = 0;
				rws.forEach((row, idx) => {
					const rowErrors = validateRow(row, hdrs);
					if (rowErrors.length > 0) {
						errs[idx] = rowErrors;
						errorCount++;
					}
				});

				setHeaders(hdrs);
				setRows(rws);
				setErrorRows(errs);
				setColumnMapping(initialMapping);

				if (errorCount > 0) {
					setErrorMessage(`Found ${errorCount} row(s) with validation errors. Please review.`);
				}
			} catch (error) {
				setErrorMessage(`Failed to parse file: ${error.message}`);
				setHeaders([]);
				setRows([]);
				setErrorRows({});
				setColumnMapping({});
			}
		};
		reader.readAsText(file);
	}, []);

	const handleDrop = useCallback((e) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file) handleFile(file);
	}, [handleFile]);

	const handleDragOver = useCallback((e) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleFileInputChange = useCallback((e) => {
		const file = e.target.files?.[0];
		if (file) handleFile(file);
	}, [handleFile]);

	const handleDropzoneClick = useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleColumnMappingChange = useCallback((header, value) => {
		setColumnMapping((prev) => ({ ...prev, [header]: value }));
	}, []);

	const handleSubmit = useCallback(() => {
		const errorCount = Object.keys(errorRows).length;
		const successCount = rows.length - errorCount;
		const newSummary = {
			total: rows.length,
			inserted: successCount,
			skipped: errorCount,
			fileName,
			timestamp: new Date().toISOString(),
		};
		setSummary(newSummary);

		// Add to history
		const newHistoryEntry = {
			id: Date.now().toString(),
			...newSummary,
		};
		const updatedHistory = [newHistoryEntry, ...history].slice(0, 20);
		setHistory(updatedHistory);
		persistHistory(updatedHistory);
	}, [rows, errorRows, fileName, history, persistHistory]);

	const handleCancel = useCallback(() => {
		setFileName('');
		setHeaders([]);
		setRows([]);
		setErrorRows({});
		setErrorMessage('');
		setSummary(null);
		setColumnMapping({});
		if (fileInputRef.current) fileInputRef.current.value = '';
	}, []);

	return (
		<Box data-testid="import-page" sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
			<Paper elevation={3} sx={{ p: 4 }}>
				<Typography variant="h4" gutterBottom>
					Data Import
				</Typography>
				<Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
					Upload a CSV or JSON file to import data
				</Typography>

				{/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    data-testid="import-file-input"
                    type="file"
                    accept=".csv,.json,text/csv,application/json"
                    onChange={handleFileInputChange}
                    style={{
                        position: 'absolute',
                        opacity: 0,
                        width: 1,
                        height: 1,
                        pointerEvents: 'none',
                    }}
                />

				{/* Dropzone */}
				<Box
					data-testid="import-dropzone"
					onClick={handleDropzoneClick}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					sx={{
						border: '2px dashed',
						borderColor: isDragging ? 'primary.main' : 'grey.400',
						borderRadius: 2,
						p: 6,
						textAlign: 'center',
						cursor: 'pointer',
						bgcolor: isDragging ? 'action.hover' : 'background.paper',
						transition: 'all 0.2s',
						'&:hover': {
							borderColor: 'primary.main',
							bgcolor: 'action.hover',
						},
					}}
				>
					<UploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
					<Typography variant="h6">
						Drag & drop a file here, or click to browse
					</Typography>
					<Typography variant="body2" color="textSecondary">
						Supports .csv and .json files
					</Typography>
				</Box>

				{/* File Name */}
				{fileName && (
					<Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
						<FileIcon color="primary" />
						<Typography data-testid="import-file-name" variant="body1">
							{fileName}
						</Typography>
					</Box>
				)}

				{/* Error Message */}
				{errorMessage && (
					<Alert
						data-testid="import-error-message"
						severity="warning"
						sx={{ mt: 2 }}
					>
						{errorMessage}
					</Alert>
				)}

				{/* Column Mapper */}
				{headers.length > 0 && (
					<Box data-testid="import-column-mapper" sx={{ mt: 3 }}>
						<Typography variant="h6" gutterBottom>
							Column Mapping
						</Typography>
						<Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
							Map your CSV columns to the target fields
						</Typography>
						<TableContainer component={Paper} variant="outlined">
							<Table size="small">
								<TableHead>
									<TableRow sx={{ bgcolor: 'grey.100' }}>
										<TableCell><strong>CSV Column</strong></TableCell>
										<TableCell><strong>Target Field</strong></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{headers.map((header) => (
										<TableRow
											key={header}
											data-testid={`import-column-mapper-row-${header}`}
										>
											<TableCell>{header}</TableCell>
											<TableCell>
												<FormControl size="small" sx={{ minWidth: 160 }}>
													<Select
														data-testid={`import-column-mapper-${header}`}
														value={columnMapping[header] || 'ignore'}
														onChange={(e) => handleColumnMappingChange(header, e.target.value)}
													>
														{TARGET_FIELDS.map((tf) => (
															<MenuItem key={tf} value={tf}>{tf}</MenuItem>
														))}
													</Select>
												</FormControl>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				)}

				{/* Preview Table */}
				{rows.length > 0 && (
					<Box sx={{ mt: 3 }}>
						<Typography variant="h6" gutterBottom>
							Preview ({rows.length} rows)
						</Typography>
						<TableContainer component={Paper} variant="outlined">
							<Table data-testid="import-preview-table" size="small">
								<TableHead>
									<TableRow sx={{ bgcolor: 'grey.100' }}>
										<TableCell><strong>#</strong></TableCell>
										{headers.map((h) => (
											<TableCell key={h}><strong>{h}</strong></TableCell>
										))}
										<TableCell><strong>Status</strong></TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{rows.map((row, idx) => {
										const hasError = !!errorRows[idx];
										return (
											<TableRow
												key={idx}
												data-testid={hasError ? `import-error-row-${idx}` : `import-preview-row-${idx}`}
												sx={{
													bgcolor: hasError ? 'error.light' : 'inherit',
													'&:hover': { bgcolor: hasError ? 'error.light' : 'action.hover' },
												}}
											>
												<TableCell>{idx + 1}</TableCell>
												{headers.map((h) => (
													<TableCell key={h}>{String(row[h] ?? '')}</TableCell>
												))}
												<TableCell>
													{hasError ? (
														<Typography variant="caption" color="error">
															{errorRows[idx].join(', ')}
														</Typography>
													) : (
														<Typography variant="caption" color="success.main">
															OK
														</Typography>
													)}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				)}

				{/* Action Buttons */}
				<Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
					<Button
						data-testid="import-submit"
						variant="contained"
						color="primary"
						onClick={handleSubmit}
						disabled={rows.length === 0}
					>
						Confirm Import
					</Button>
                    <Button
                        data-testid="import-commit-button"
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={rows.length === 0}
                    >
                        Commit Import
                    </Button>
					<Button
						data-testid="import-cancel"
						variant="outlined"
						onClick={handleCancel}
					>
						Cancel
					</Button>
				</Box>

				{/* Summary */}
				{summary && (
					<Box sx={{ mt: 3 }}>
						<Alert
							data-testid="import-summary"
							severity={summary.skipped > 0 ? 'warning' : 'success'}
						>
							<Typography variant="body1">
								<strong>Import Summary:</strong>
							</Typography>
							<Typography variant="body2">
								Total rows: {summary.total} | Inserted: {summary.inserted} | Skipped: {summary.skipped}
							</Typography>
						</Alert>

						{/* Detailed counts as separate testids */}
						<Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
							<Box>
								<Typography variant="caption" color="textSecondary">Success</Typography>
								<Typography
									data-testid="import-summary-success-count"
									variant="h6"
									color="success.main"
								>
									{summary.inserted}
								</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="textSecondary">Errors</Typography>
								<Typography
									data-testid="import-summary-error-count"
									variant="h6"
									color="error.main"
								>
									{summary.skipped}
								</Typography>
							</Box>
							<Box>
								<Typography variant="caption" color="textSecondary">Total</Typography>
								<Typography
									data-testid="import-summary-total-count"
									variant="h6"
								>
									{summary.total}
								</Typography>
							</Box>
						</Box>
					</Box>
				)}

				<Divider sx={{ my: 4 }} />

				{/* Import History */}
				<Box>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
						<HistoryIcon />
						<Typography variant="h6">Import History</Typography>
					</Box>

					<Paper variant="outlined" sx={{ p: 1 }}>
						<List data-testid="import-history" dense>
							{history.length === 0 ? (
								<ListItem>
									<ListItemText
										primary="No previous imports"
										secondary="Your import history will appear here"
									/>
								</ListItem>
							) : (
								history.map((entry, index) => (
									<ListItem
										key={entry.id}
										data-testid={`import-history-item-${index}`}
									>
										<ListItemText
											primary={`${entry.fileName} — ${entry.inserted} inserted, ${entry.skipped} skipped`}
											secondary={new Date(entry.timestamp).toLocaleString()}
										/>
									</ListItem>
								))
							)}
						</List>
					</Paper>
				</Box>
			</Paper>
		</Box>
	);
};

export default Import;

