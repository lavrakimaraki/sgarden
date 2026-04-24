import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Box,
	Typography,
	Paper,
	Button,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Checkbox,
	FormControlLabel,
	FormGroup,
	Divider,
	Grid,
} from '@mui/material';
import {
	Add as AddIcon,
	Visibility as ViewIcon,
	Delete as DeleteIcon,
	Description as ReportIcon,
} from '@mui/icons-material';

const STORAGE_KEY = 'saved-reports';

const AVAILABLE_CHARTS = [
	'monthly-revenue',
	'new-customers',
	'active-subscriptions',
	'weekly-sales',
	'revenue-trend',
	'customer-satisfaction',
];

const emptyWizard = {
	title: '',
	dateFrom: '',
	dateTo: '',
	commentary: '',
	charts: {},
};

const Reports = () => {
	const navigate = useNavigate();
	const [reports, setReports] = useState([]);
	const [wizardOpen, setWizardOpen] = useState(false);
	const [wizard, setWizard] = useState(emptyWizard);
	const [previewMode, setPreviewMode] = useState(false);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) setReports(JSON.parse(stored));
		} catch (e) { /* ignore */ }
	}, []);

	const persistReports = useCallback((items) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		} catch (e) { /* ignore */ }
	}, []);

	const handleOpenWizard = useCallback(() => {
		setWizard(emptyWizard);
		setPreviewMode(false);
		setWizardOpen(true);
	}, []);

	const handleCloseWizard = useCallback(() => {
		setWizardOpen(false);
		setWizard(emptyWizard);
		setPreviewMode(false);
	}, []);

	const handleFieldChange = useCallback((field) => (e) => {
		setWizard((prev) => ({ ...prev, [field]: e.target.value }));
	}, []);

	const handleChartToggle = useCallback((chart) => (e) => {
		setWizard((prev) => ({
			...prev,
			charts: { ...prev.charts, [chart]: e.target.checked },
		}));
	}, []);

	const handlePreview = useCallback(() => {
		setPreviewMode((prev) => !prev);
	}, []);

	const handleSave = useCallback(() => {
		const newReport = {
			id: Date.now().toString(),
			title: wizard.title || 'Untitled Report',
			dateFrom: wizard.dateFrom,
			dateTo: wizard.dateTo,
			commentary: wizard.commentary,
			charts: Object.keys(wizard.charts).filter((k) => wizard.charts[k]),
			createdAt: new Date().toISOString(),
		};
		const updated = [newReport, ...reports];
		setReports(updated);
		persistReports(updated);
		handleCloseWizard();
	}, [wizard, reports, persistReports, handleCloseWizard]);

	const handleView = useCallback((id) => {
		navigate(`/reports/${id}`);
	}, [navigate]);

	const handleDelete = useCallback((id) => {
		const updated = reports.filter((r) => r.id !== id);
		setReports(updated);
		persistReports(updated);
	}, [reports, persistReports]);

	return (
		<Box data-testid="reports-page" sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
			<Paper elevation={3} sx={{ p: 4 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
					<Typography variant="h4">Reports</Typography>
					<Button
						data-testid="reports-create-button"
						variant="contained"
						color="primary"
						startIcon={<AddIcon />}
						onClick={handleOpenWizard}
					>
						New Report
					</Button>
				</Box>

				<Paper variant="outlined" sx={{ p: 2 }}>
					<List data-testid="reports-list" dense>
						{reports.length === 0 ? (
							<Box
								data-testid="reports-empty"
								sx={{
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'center',
									alignItems: 'center',
									py: 6,
								}}
							>
								<ReportIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
								<Typography variant="body1" color="textSecondary">
									No reports saved yet
								</Typography>
								<Typography variant="caption" color="textSecondary">
									Click "New Report" to create your first report
								</Typography>
							</Box>
						) : (
							reports.map((report) => (
								<React.Fragment key={report.id}>
									<ListItem
										data-testid={`reports-item-${report.id}`}
										secondaryAction={
											<Box sx={{ display: 'flex', gap: 1 }}>
												<IconButton
													data-testid={`reports-item-view-${report.id}`}
													size="small"
													color="primary"
													onClick={() => handleView(report.id)}
												>
													<ViewIcon fontSize="small" />
												</IconButton>
												<IconButton
													data-testid={`reports-item-delete-${report.id}`}
													size="small"
													color="error"
													onClick={() => handleDelete(report.id)}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Box>
										}
									>
										<ListItemText
											primary={
												<span data-testid={`reports-item-title-${report.id}`}>
													{report.title}
												</span>
											}
											secondary={
												<span data-testid={`reports-item-date-${report.id}`}>
													Created: {new Date(report.createdAt).toLocaleString()}
												</span>
											}
										/>
									</ListItem>
									<Divider component="li" />
								</React.Fragment>
							))
						)}
					</List>
				</Paper>
			</Paper>

			{/* Wizard Dialog */}
			<Dialog open={wizardOpen} onClose={handleCloseWizard} maxWidth="md" fullWidth>
				<DialogTitle>Create New Report</DialogTitle>
				<DialogContent data-testid="report-wizard">
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
						<TextField
							data-testid="report-wizard-title"
							label="Report Title"
							value={wizard.title}
							onChange={handleFieldChange('title')}
							fullWidth
						/>

						<Grid container spacing={2}>
							<Grid item xs={6}>
								<TextField
									data-testid="report-wizard-date-from"
									type="date"
									label="From Date"
									value={wizard.dateFrom}
									onChange={handleFieldChange('dateFrom')}
									InputLabelProps={{ shrink: true }}
									fullWidth
								/>
							</Grid>
							<Grid item xs={6}>
								<TextField
									data-testid="report-wizard-date-to"
									type="date"
									label="To Date"
									value={wizard.dateTo}
									onChange={handleFieldChange('dateTo')}
									InputLabelProps={{ shrink: true }}
									fullWidth
								/>
							</Grid>
						</Grid>

						<Box>
							<Typography variant="subtitle1" gutterBottom>
								Select Charts
							</Typography>
							<FormGroup data-testid="report-wizard-chart-select">
								{AVAILABLE_CHARTS.map((chart) => (
									<FormControlLabel
										key={chart}
										control={
											<Checkbox
												data-testid={`report-wizard-chart-option-${chart}`}
												checked={!!wizard.charts[chart]}
												onChange={handleChartToggle(chart)}
											/>
										}
										label={chart}
									/>
								))}
							</FormGroup>
						</Box>

						<TextField
							data-testid="report-wizard-commentary"
							label="Commentary"
							multiline
							rows={4}
							value={wizard.commentary}
							onChange={handleFieldChange('commentary')}
							fullWidth
						/>

						{previewMode && (
							<Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
								<Typography variant="h6">{wizard.title || 'Untitled Report'}</Typography>
								<Typography variant="caption" color="textSecondary">
									{wizard.dateFrom} → {wizard.dateTo}
								</Typography>
								<Divider sx={{ my: 1 }} />
								<Typography variant="body2">
									Charts: {Object.keys(wizard.charts).filter((k) => wizard.charts[k]).join(', ') || 'None selected'}
								</Typography>
								<Typography variant="body2" sx={{ mt: 1 }}>
									{wizard.commentary || 'No commentary.'}
								</Typography>
							</Paper>
						)}
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						data-testid="report-wizard-cancel"
						onClick={handleCloseWizard}
					>
						Cancel
					</Button>
					<Button
						data-testid="report-wizard-preview"
						onClick={handlePreview}
					>
						{previewMode ? 'Hide Preview' : 'Preview'}
					</Button>
					<Button
						data-testid="report-wizard-save"
						variant="contained"
						color="primary"
						onClick={handleSave}
					>
						Save Report
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default Reports;