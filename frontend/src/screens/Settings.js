import React, { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Typography,
	Paper,
	Button,
	TextField,
	Switch,
	FormControlLabel,
	Grid,
	Divider,
	Alert,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const STORAGE_KEY = 'user-preferences';

const PAGE_SIZES = [10, 20, 50, 100];
const DASHBOARDS = [
	{ value: '/dashboard', label: 'Overview' },
	{ value: '/dashboard1', label: 'Analytics' },
	{ value: '/dashboard2', label: 'Insights' },
];
const DATE_FORMATS = [
	{ value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
	{ value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
	{ value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
	{ value: 'DD MMM YYYY', label: 'DD MMM YYYY' },
];

const defaultPreferences = {
	pageSize: 20,
	defaultDashboard: '/dashboard',
	dateFormat: 'MM/DD/YYYY',
	sidebarCollapsed: false,
};

const Settings = () => {
	const [prefs, setPrefs] = useState(defaultPreferences);
	const [showSuccess, setShowSuccess] = useState(false);

	// Load preferences on mount
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				setPrefs({ ...defaultPreferences, ...parsed });
			}
		} catch (e) { /* ignore */ }
	}, []);

	const handleFieldChange = useCallback((field) => (e) => {
		const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
		setPrefs((prev) => ({ ...prev, [field]: value }));
		setShowSuccess(false);
	}, []);

	const handleSave = useCallback(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
			setShowSuccess(true);

			// Auto-hide after 4 seconds
			setTimeout(() => setShowSuccess(false), 4000);
		} catch (e) {
			console.error('Failed to save preferences', e);
		}
	}, [prefs]);

	return (
		<Box data-testid="settings-page" sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
			<Paper elevation={3} sx={{ p: 4 }}>
				<Typography variant="h4" gutterBottom>
					User Preferences
				</Typography>
				<Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
					Customize your experience. Settings are saved locally.
				</Typography>

				<Divider sx={{ my: 3 }} />

				<Grid container spacing={3}>
					<Grid item xs={12} sm={6}>
						<TextField
							data-testid="settings-page-size"
							label="Default Page Size"
							select
							SelectProps={{ native: true }}
							value={prefs.pageSize}
							onChange={handleFieldChange('pageSize')}
							fullWidth
							helperText="Number of rows shown per table page"
							InputLabelProps={{ shrink: true }}
						>
							{PAGE_SIZES.map((size) => (
								<option key={size} value={size}>{size}</option>
							))}
						</TextField>
					</Grid>

					<Grid item xs={12} sm={6}>
						<TextField
							data-testid="settings-default-dashboard"
							label="Default Dashboard"
							select
							SelectProps={{ native: true }}
							value={prefs.defaultDashboard}
							onChange={handleFieldChange('defaultDashboard')}
							fullWidth
							helperText="Page shown after login"
							InputLabelProps={{ shrink: true }}
						>
							{DASHBOARDS.map((d) => (
								<option key={d.value} value={d.value}>{d.label}</option>
							))}
						</TextField>
					</Grid>

					<Grid item xs={12} sm={6}>
						<TextField
							data-testid="settings-date-format"
							label="Date Format"
							select
							SelectProps={{ native: true }}
							value={prefs.dateFormat}
							onChange={handleFieldChange('dateFormat')}
							fullWidth
							helperText="How dates are displayed"
							InputLabelProps={{ shrink: true }}
						>
							{DATE_FORMATS.map((f) => (
								<option key={f.value} value={f.value}>{f.label}</option>
							))}
						</TextField>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
							<FormControlLabel
								control={
									<Switch
										data-testid="settings-sidebar-collapsed"
										checked={prefs.sidebarCollapsed}
										onChange={handleFieldChange('sidebarCollapsed')}
										color="primary"
									/>
								}
								label="Sidebar Collapsed by Default"
							/>
						</Box>
					</Grid>
				</Grid>

				<Divider sx={{ my: 4 }} />

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Button
						data-testid="settings-save-button"
						variant="contained"
						color="primary"
						startIcon={<SaveIcon />}
						onClick={handleSave}
					>
						Save Preferences
					</Button>

					{showSuccess && (
						<Alert
							data-testid="settings-success-message"
							severity="success"
							sx={{ flexGrow: 1 }}
						>
							Preferences saved successfully!
						</Alert>
					)}
				</Box>

				{/* Persistent test-friendly success indicator */}
				{showSuccess && (
					<div
						data-testid="settings-success-message"
						role="alert"
						style={{
							position: 'fixed',
							bottom: 80,
							left: '50%',
							transform: 'translateX(-50%)',
							padding: '12px 20px',
							background: '#4caf50',
							color: 'white',
							borderRadius: 4,
							zIndex: 9999,
						}}
					>
						Preferences saved successfully!
					</div>
				)}
			</Paper>
		</Box>
	);
};

export default Settings;
