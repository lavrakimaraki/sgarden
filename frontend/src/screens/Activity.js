import React, { useState, useEffect } from 'react';
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
	CircularProgress,
	Pagination,
	Grid,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import { jwt } from '../utils/index.js';

const actionTypes = ['login', 'password_change', 'profile_update', 'dashboard_view'];

const getActionLabel = (actionType) => {
	const labels = {
		login: 'Login',
		password_change: 'Password Change',
		profile_update: 'Profile Update',
		dashboard_view: 'Dashboard View',
	};
	return labels[actionType] || actionType;
};

const formatDate = (dateString) => {
	if (!dateString) return 'N/A';
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

const Activity = () => {
	const [loading, setLoading] = useState(true);
	const [activities, setActivities] = useState([]);
	const [users, setUsers] = useState([]);
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState({ total: 0, pages: 1 });
	const [limit] = useState(20);

	const [filters, setFilters] = useState({
		userId: '',
		actionType: '',
		dateFrom: '',
		dateTo: '',
	});

	useEffect(() => {
		fetchActivities();
	}, [page, filters]);

	const fetchActivities = async () => {
		try {
			setLoading(true);
			const token = jwt.getToken();
			const params = new URLSearchParams({
				page,
				limit,
				...(filters.userId && { userId: filters.userId }),
				...(filters.actionType && { actionType: filters.actionType }),
				...(filters.dateFrom && { dateFrom: filters.dateFrom }),
				...(filters.dateTo && { dateTo: filters.dateTo }),
			});

			const response = await fetch(`/api/activity?${params}`, {
				headers: {
					'x-access-token': token,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Failed to fetch activities');
			}

			const data = await response.json();
			setActivities(data.data || []);
			setPagination(data.pagination || { total: 0, pages: 1 });
			setUsers(data.users || []);
		} catch (error) {
			console.error('Error fetching activities:', error);
			setActivities([]);
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = (field, value) => {
		setFilters({
			...filters,
			[field]: value,
		});
		setPage(1);
	};

	const handleResetFilters = () => {
		setFilters({
			userId: '',
			actionType: '',
			dateFrom: '',
			dateTo: '',
		});
		setPage(1);
	};

	return (
		<Box data-testid="activity-page" sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
			<Paper elevation={3} sx={{ p: 4 }}>
				<Typography variant="h4" gutterBottom>
					Activity Log
				</Typography>

				{/* Filters - always visible */}
				<Box sx={{ mt: 3, mb: 3 }}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6} md={3}>
							<FormControl fullWidth>
								<InputLabel>Filter by User</InputLabel>
								<Select
									data-testid="activity-filter-user"
									value={filters.userId}
									onChange={(e) => handleFilterChange('userId', e.target.value)}
									label="Filter by User"
								>
									<MenuItem value="">All Users</MenuItem>
									{users.map((user) => (
										<MenuItem key={user._id} value={user._id}>
											{user.username}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<FormControl fullWidth>
								<InputLabel>Filter by Action</InputLabel>
								<Select
									data-testid="activity-filter-action"
									value={filters.actionType}
									onChange={(e) => handleFilterChange('actionType', e.target.value)}
									label="Filter by Action"
								>
									<MenuItem value="">All Actions</MenuItem>
									{actionTypes.map((action) => (
										<MenuItem key={action} value={action}>
											{getActionLabel(action)}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<TextField
								data-testid="activity-filter-date-from"
								type="date"
								label="From Date"
								value={filters.dateFrom}
								onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
								InputLabelProps={{ shrink: true }}
								fullWidth
							/>
						</Grid>

						<Grid item xs={12} sm={6} md={3}>
							<TextField
								data-testid="activity-filter-date-to"
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
						<Button
							variant="outlined"
							onClick={handleResetFilters}
							sx={{ mr: 1 }}
						>
							Reset Filters
						</Button>
					</Box>
				</Box>

				{/* Activity Table - ALWAYS rendered */}
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
						<CircularProgress />
					</Box>
				) : (
					<>
						<TableContainer>
							<Table data-testid="activity-table">
								<TableHead>
									<TableRow sx={{ backgroundColor: '#f5f5f5' }}>
										<TableCell>User</TableCell>
										<TableCell>Action</TableCell>
										<TableCell>Date/Time</TableCell>
										<TableCell>IP Address</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{activities.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} align="center">
												<Box
													data-testid="activity-empty"
													sx={{
														display: 'flex',
														justifyContent: 'center',
														alignItems: 'center',
														minHeight: '200px',
													}}
												>
													<Typography variant="body1" color="textSecondary">
														No activity logs found
													</Typography>
												</Box>
											</TableCell>
										</TableRow>
									) : (
										activities.map((activity) => (
											<TableRow
												key={activity._id}
												data-testid={`activity-row-${activity._id}`}
											>
												<TableCell>{activity.username}</TableCell>
												<TableCell>{getActionLabel(activity.actionType)}</TableCell>
												<TableCell>{formatDate(activity.createdAt)}</TableCell>
												<TableCell>{activity.ipAddress || 'N/A'}</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>

						{/* Pagination - ALWAYS rendered */}
						<Box
							data-testid="activity-pagination"
							sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}
						>
							<Button
								data-testid="activity-pagination-prev"
								onClick={() => setPage(Math.max(1, page - 1))}
								disabled={page === 1}
								variant="outlined"
							>
								Previous
							</Button>

							<Pagination
								count={pagination.pages || 1}
								page={page}
								onChange={(e, value) => setPage(value)}
							/>

							<Button
								data-testid="activity-pagination-next"
								onClick={() => setPage(Math.min(pagination.pages || 1, page + 1))}
								disabled={page === (pagination.pages || 1)}
								variant="outlined"
							>
								Next
							</Button>
						</Box>
					</>
				)}
			</Paper>
		</Box>
	);
};

export default Activity;
