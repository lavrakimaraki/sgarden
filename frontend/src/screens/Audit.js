import React, { useState, useEffect, useCallback } from 'react';
import {
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Button,
	Grid,
} from '@mui/material';

const STORAGE_KEY = 'audit-log-entries';

const ACTION_TYPES = [
	'user_invite',
	'user_delete',
	'role_change',
	'user_update',
	'settings_change',
];

const getActionLabel = (action) => {
	const labels = {
		user_invite: 'User Invite',
		user_delete: 'User Delete',
		role_change: 'Role Change',
		user_update: 'User Update',
		settings_change: 'Settings Change',
	};
	return labels[action] || action;
};

const formatDate = (dateString) => {
	if (!dateString) return 'N/A';
	return new Date(dateString).toLocaleString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

// Seed with some example entries so the table isn't empty
const SEED_ENTRIES = [
	{
		id: '1',
		admin: 'admin',
		action: 'user_invite',
		target: 'newuser@example.com',
		timestamp: new Date(Date.now() - 86400000).toISOString(),
	},
	{
		id: '2',
		admin: 'admin',
		action: 'role_change',
		target: 'jane.doe',
		timestamp: new Date(Date.now() - 43200000).toISOString(),
	},
	{
		id: '3',
		admin: 'admin',
		action: 'user_delete',
		target: 'olduser',
		timestamp: new Date(Date.now() - 3600000).toISOString(),
	},
];

const Audit = () => {
	const [entries, setEntries] = useState([]);
	const [filters, setFilters] = useState({
		action: '',
		dateFrom: '',
		dateTo: '',
	});

	// Load entries
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				setEntries(Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_ENTRIES);
			} else {
				setEntries(SEED_ENTRIES);
				localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ENTRIES));
			}
		} catch (e) {
			setEntries(SEED_ENTRIES);
		}
	}, []);

	const handleFilterChange = useCallback((field, value) => {
		setFilters((prev) => ({ ...prev, [field]: value }));
	}, []);

	const handleResetFilters = useCallback(() => {
		setFilters({ action: '', dateFrom: '', dateTo: '' });
	}, []);

	// Apply filters
	const filtered = entries.filter((entry) => {
		if (filters.action && entry.action !== filters.action) return false;
		if (filters.dateFrom) {
			const from = new Date(filters.dateFrom);
			if (new Date(entry.timestamp) < from) return false;
		}
		if (filters.dateTo) {
			const to = new Date(filters.dateTo);
			to.setHours(23, 59, 59, 999);
			if (new Date(entry.timestamp) > to) return false;
		}
		return true;
	});

	// Sort newest first
	const sorted = [...filtered].sort(
		(a, b) => new Date(b.timestamp) - new Date(a.timestamp)
	);

	return (
		<Box data-testid="audit-page" sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
			<Paper elevation={3} sx={{ p: 4 }}>
				<Typography variant="h4" gutterBottom>
					Audit Trail
				</Typography>
				<Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
					Chronological log of all administrative actions
				</Typography>

				{/* Filters */}
				<Box sx={{ mb: 3 }}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={4}>
							<TextField
								data-testid="audit-filter-action"
								label="Action Type"
								select
								SelectProps={{ native: true }}
								value={filters.action}
								onChange={(e) => handleFilterChange('action', e.target.value)}
								fullWidth
								InputLabelProps={{ shrink: true }}
							>
								<option value="">All Actions</option>
								{ACTION_TYPES.map((a) => (
									<option key={a} value={a}>{getActionLabel(a)}</option>
								))}
							</TextField>
						</Grid>

						<Grid item xs={12} sm={4}>
							<TextField
								data-testid="audit-filter-date-from"
								type="date"
								label="From Date"
								value={filters.dateFrom}
								onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
								InputLabelProps={{ shrink: true }}
								fullWidth
							/>
						</Grid>

						<Grid item xs={12} sm={4}>
							<TextField
								data-testid="audit-filter-date-to"
								type="date"
								label="To Date"
								value={filters.dateTo}
								onChange={(e) => handleFilterChange('dateTo', e.target.value)}
								InputLabelProps={{ shrink: true }}
								fullWidth
							/>
						</Grid>
					</Grid>

					<Box sx={{ mt: 2 }}>
						<Button variant="outlined" onClick={handleResetFilters}>
							Reset Filters
						</Button>
					</Box>
				</Box>

				{/* Audit Table - always rendered */}
				<TableContainer component={Paper} variant="outlined">
					<Table data-testid="audit-table">
						<TableHead>
							<TableRow sx={{ bgcolor: 'grey.100' }}>
								<TableCell><strong>Admin</strong></TableCell>
								<TableCell><strong>Action</strong></TableCell>
								<TableCell><strong>Target</strong></TableCell>
								<TableCell><strong>Timestamp</strong></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{sorted.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} align="center">
										<Box
											data-testid="audit-empty"
											sx={{ py: 4 }}
										>
											<Typography variant="body1" color="textSecondary">
												No audit entries found
											</Typography>
											<Typography variant="caption" color="textSecondary">
												Try adjusting your filters
											</Typography>
										</Box>
									</TableCell>
								</TableRow>
							) : (
								sorted.map((entry) => (
									<TableRow
										key={entry.id}
										data-testid={`audit-row-${entry.id}`}
									>
										<TableCell data-testid={`audit-row-admin-${entry.id}`}>
											{entry.admin}
										</TableCell>
										<TableCell data-testid={`audit-row-action-${entry.id}`}>
											{getActionLabel(entry.action)}
										</TableCell>
										<TableCell data-testid={`audit-row-target-${entry.id}`}>
											{entry.target}
										</TableCell>
										<TableCell data-testid={`audit-row-timestamp-${entry.id}`}>
											{formatDate(entry.timestamp)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>
		</Box>
	);
};

export default Audit;
