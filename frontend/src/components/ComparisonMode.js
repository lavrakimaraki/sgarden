import React, { useState, useCallback } from 'react';
import {
	Box,
	Button,
	Paper,
	Typography,
	TextField,
	Grid,
	IconButton,
	Tooltip,
} from '@mui/material';
import { Compare as CompareIcon, Close as CloseIcon } from '@mui/icons-material';

const METRICS = [
	'Monthly Revenue',
	'New Customers',
	'Active Subscriptions',
	'Weekly Sales',
	'Revenue Trend',
	'Customer Satisfaction',
];

// Generate fake numeric value for a given metric + date range
const generateMetricValue = (metric, dateFrom, dateTo) => {
	if (!metric) return 0;
	let seed = 0;
	const str = `${metric}-${dateFrom}-${dateTo}`;
	for (let i = 0; i < str.length; i++) {
		seed = (seed * 31 + str.charCodeAt(i)) % 100000;
	}
	return Math.round((seed % 9000) + 1000);
};

const ComparisonPanel = ({ side, metric, onMetricChange, dateFrom, onDateFromChange, dateTo, onDateToChange, value }) => (
	<Paper
		variant="outlined"
		data-testid={`compare-panel-${side}`}
		sx={{ p: 2, height: '100%' }}
	>
		<Typography variant="h6" gutterBottom>
			{side === 'left' ? 'Panel A' : 'Panel B'}
		</Typography>

		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<TextField
				data-testid={`compare-filter-${side}-metric`}
				label="Metric"
				select
				SelectProps={{ native: true }}
				value={metric}
				onChange={(e) => onMetricChange(e.target.value)}
				fullWidth
				size="small"
				InputLabelProps={{ shrink: true }}
			>
				<option value="">Select metric</option>
				{METRICS.map((m) => (
					<option key={m} value={m}>{m}</option>
				))}
			</TextField>

			<TextField
				data-testid={`compare-filter-${side}-date-from`}
				label="From Date"
				type="date"
				value={dateFrom}
				onChange={(e) => onDateFromChange(e.target.value)}
				InputLabelProps={{ shrink: true }}
				fullWidth
				size="small"
			/>

			<TextField
				data-testid={`compare-filter-${side}-date-to`}
				label="To Date"
				type="date"
				value={dateTo}
				onChange={(e) => onDateToChange(e.target.value)}
				InputLabelProps={{ shrink: true }}
				fullWidth
				size="small"
			/>

			<Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
				<Typography variant="caption" color="textSecondary">
					Computed Value
				</Typography>
				<Typography variant="h4" color="primary">
					{value || '—'}
				</Typography>
			</Box>
		</Box>
	</Paper>
);

const ComparisonMode = () => {
	const [active, setActive] = useState(false);
	const [leftMetric, setLeftMetric] = useState('Monthly Revenue');
	const [rightMetric, setRightMetric] = useState('Monthly Revenue');
	const [leftDateFrom, setLeftDateFrom] = useState('2024-01-01');
	const [leftDateTo, setLeftDateTo] = useState('2024-06-30');
	const [rightDateFrom, setRightDateFrom] = useState('2024-07-01');
	const [rightDateTo, setRightDateTo] = useState('2024-12-31');

	const handleToggle = useCallback(() => {
		setActive((prev) => !prev);
	}, []);

	const handleClose = useCallback(() => {
		setActive(false);
	}, []);

	const leftValue = generateMetricValue(leftMetric, leftDateFrom, leftDateTo);
	const rightValue = generateMetricValue(rightMetric, rightDateFrom, rightDateTo);
	const delta = rightValue - leftValue;
	const deltaPct = leftValue !== 0 ? ((delta / leftValue) * 100).toFixed(1) : '0';

	return (
		<Box sx={{ mb: 2 }}>
			{/* Toggle button - always present */}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
				<Button
					data-testid="compare-toggle"
					variant={active ? 'contained' : 'outlined'}
					color="primary"
					startIcon={<CompareIcon />}
					onClick={handleToggle}
				>
					{active ? 'Comparison Mode On' : 'Compare'}
				</Button>

				{active && (
					<>
						<Box
							data-testid="compare-active-indicator"
							sx={{
								px: 1.5,
								py: 0.5,
								bgcolor: 'success.main',
								color: 'white',
								borderRadius: 1,
								fontSize: '0.8rem',
								fontWeight: 'bold',
							}}
						>
							● COMPARING
						</Box>

						<Tooltip title="Close comparison">
							<IconButton
								data-testid="compare-close"
								color="error"
								onClick={handleClose}
								size="small"
							>
								<CloseIcon />
							</IconButton>
						</Tooltip>
					</>
				)}
			</Box>

			{/* Comparison panels */}
			{active && (
				<>
					<Grid container spacing={2}>
						<Grid item xs={12} md={6}>
							<ComparisonPanel
								side="left"
								metric={leftMetric}
								onMetricChange={setLeftMetric}
								dateFrom={leftDateFrom}
								onDateFromChange={setLeftDateFrom}
								dateTo={leftDateTo}
								onDateToChange={setLeftDateTo}
								value={leftValue}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<ComparisonPanel
								side="right"
								metric={rightMetric}
								onMetricChange={setRightMetric}
								dateFrom={rightDateFrom}
								onDateFromChange={setRightDateFrom}
								dateTo={rightDateTo}
								value={rightValue}
							/>
						</Grid>
					</Grid>

					{/* Delta display */}
					<Paper
						data-testid="compare-delta-display"
						elevation={2}
						sx={{
							mt: 2,
							p: 2,
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							bgcolor: delta >= 0 ? 'success.light' : 'error.light',
						}}
					>
						<Typography variant="subtitle1" fontWeight="bold">
							Delta (B − A)
						</Typography>
						<Box sx={{ textAlign: 'right' }}>
							<Typography variant="h5" fontWeight="bold">
								{delta >= 0 ? '+' : ''}{delta}
							</Typography>
							<Typography variant="caption">
								{delta >= 0 ? '+' : ''}{deltaPct}% change
							</Typography>
						</Box>
					</Paper>
				</>
			)}
		</Box>
	);
};

export default ComparisonMode;
