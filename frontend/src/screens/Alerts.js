import React, { useState, useCallback } from 'react';
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
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	IconButton,
	Switch,
	List,
	ListItem,
	ListItemText,
	Divider,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Warning as WarningIcon } from '@mui/icons-material';

const METRICS = [
	'Monthly Revenue',
	'New Customers',
	'Active Subscriptions',
	'Weekly Sales',
	'Revenue Trend',
	'Customer Satisfaction',
];

const OPERATORS = [
	{ value: '>', label: 'Greater than (>)' },
	{ value: '<', label: 'Less than (<)' },
	{ value: '=', label: 'Equals (=)' },
];

const emptyForm = {
	metric: '',
	operator: '>',
	threshold: '',
};

const Alerts = () => {
	const [alerts, setAlerts] = useState([]);
	const [triggeredAlerts, setTriggeredAlerts] = useState([]);
	const [formOpen, setFormOpen] = useState(false);
	const [formData, setFormData] = useState(emptyForm);

	const handleOpenAdd = useCallback(() => {
		setFormData(emptyForm);
		setFormOpen(true);
	}, []);

	const handleCloseForm = useCallback(() => {
		setFormOpen(false);
		setFormData(emptyForm);
	}, []);

	const handleFieldChange = useCallback((field) => (e) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }));
	}, []);

	const handleSubmit = useCallback(() => {
		if (!formData.metric || !formData.threshold) {
			return;
		}
		const newAlert = {
			id: Date.now().toString(),
			metric: formData.metric,
			operator: formData.operator,
			threshold: Number(formData.threshold),
			enabled: true,
			createdAt: new Date().toISOString(),
		};
		setAlerts((prev) => [...prev, newAlert]);
		handleCloseForm();
	}, [formData, handleCloseForm]);

	const handleToggle = useCallback((id) => {
		setAlerts((prev) =>
			prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
		);
	}, []);

	const handleDelete = useCallback((id) => {
		setAlerts((prev) => prev.filter((a) => a.id !== id));
		setTriggeredAlerts((prev) => prev.filter((t) => t.alertId !== id));
	}, []);

	return (
		<Box data-testid="alerts-page" sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
			<Paper elevation={3} sx={{ p: 4 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
					<Typography variant="h4">Threshold Alerts</Typography>
					<Button
						data-testid="alerts-add-button"
						variant="contained"
						color="primary"
						startIcon={<AddIcon />}
						onClick={handleOpenAdd}
					>
						Create Alert
					</Button>
				</Box>

				{/* Alert Rules Section */}
				<Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
					Alert Rules
				</Typography>

				{alerts.length === 0 ? (
					<Box
						data-testid="alerts-empty"
						sx={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							py: 6,
							border: '1px dashed',
							borderColor: 'grey.400',
							borderRadius: 1,
						}}
					>
						<Typography variant="body1" color="textSecondary" gutterBottom>
							No alert rules created yet
						</Typography>
						<Typography variant="body2" color="textSecondary">
							Click "Create Alert" to add your first threshold alert
						</Typography>
					</Box>
				) : (
					<TableContainer component={Paper} variant="outlined">
						<Table data-testid="alerts-table">
							<TableHead>
								<TableRow sx={{ bgcolor: 'grey.100' }}>
									<TableCell><strong>Metric</strong></TableCell>
									<TableCell><strong>Operator</strong></TableCell>
									<TableCell><strong>Threshold</strong></TableCell>
									<TableCell><strong>Status</strong></TableCell>
									<TableCell align="right"><strong>Actions</strong></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{alerts.map((alert) => (
									<TableRow
										key={alert.id}
										data-testid={`alerts-row-${alert.id}`}
									>
										<TableCell>{alert.metric}</TableCell>
										<TableCell>{alert.operator}</TableCell>
										<TableCell>{alert.threshold}</TableCell>
										<TableCell>
											<Switch
												data-testid={`alerts-toggle-${alert.id}`}
												checked={alert.enabled}
												onChange={() => handleToggle(alert.id)}
												color="primary"
											/>
										</TableCell>
										<TableCell align="right">
											<IconButton
												data-testid={`alerts-delete-${alert.id}`}
												size="small"
												color="error"
												onClick={() => handleDelete(alert.id)}
											>
												<DeleteIcon fontSize="small" />
											</IconButton>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				)}

				<Divider sx={{ my: 4 }} />

				{/* Triggered Alerts Section */}
				<Typography variant="h6" sx={{ mb: 2 }}>
					Triggered Alerts
				</Typography>

				<Paper variant="outlined" sx={{ p: 2 }}>
					<List data-testid="alerts-triggered-list" dense>
						{triggeredAlerts.length === 0 ? (
							<ListItem>
								<ListItemText
									primary="No triggered alerts"
									secondary="Alerts will appear here when their thresholds are exceeded"
								/>
							</ListItem>
						) : (
							triggeredAlerts.map((trig) => (
								<ListItem
									key={trig.id}
									data-testid={`alerts-triggered-item-${trig.id}`}
								>
									<WarningIcon color="warning" sx={{ mr: 2 }} />
									<ListItemText
										primary={trig.message}
										secondary={new Date(trig.timestamp).toLocaleString()}
									/>
								</ListItem>
							))
						)}
					</List>
				</Paper>
			</Paper>

			{/* Create Alert Form Dialog */}
			<Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
				<DialogTitle>Create Alert Rule</DialogTitle>
				<DialogContent data-testid="alerts-form">
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
						<FormControl fullWidth>
							<InputLabel>Metric</InputLabel>
							<Select
								data-testid="alerts-field-metric"
								value={formData.metric}
								onChange={handleFieldChange('metric')}
								label="Metric"
							>
								{METRICS.map((m) => (
									<MenuItem key={m} value={m}>{m}</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl fullWidth>
							<InputLabel>Operator</InputLabel>
							<Select
								data-testid="alerts-field-operator"
								value={formData.operator}
								onChange={handleFieldChange('operator')}
								label="Operator"
							>
								{OPERATORS.map((op) => (
									<MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							data-testid="alerts-field-threshold"
							label="Threshold Value"
							type="number"
							value={formData.threshold}
							onChange={handleFieldChange('threshold')}
							fullWidth
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						data-testid="alerts-form-cancel"
						onClick={handleCloseForm}
					>
						Cancel
					</Button>
					<Button
						data-testid="alerts-form-submit"
						variant="contained"
						color="primary"
						onClick={handleSubmit}
					>
						Save Alert
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default Alerts;
