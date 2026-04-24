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
	Pagination,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Books', 'Other'];
const MONTHS = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
];
const UNITS = ['USD', 'EUR', 'GBP', 'units', 'kg', 'pcs'];
const PAGE_SIZE = 10;

const emptyForm = {
	category: '',
	month: '',
	year: new Date().getFullYear(),
	value: '',
	unit: '',
	notes: '',
};

const SalesData = () => {
	const [records, setRecords] = useState([
		{
			id: '1',
			category: 'Electronics',
			month: 'January',
			year: 2024,
			value: 5000,
			unit: 'USD',
			notes: 'Q1 sales',
		},
		{
			id: '2',
			category: 'Clothing',
			month: 'February',
			year: 2024,
			value: 3200,
			unit: 'USD',
			notes: 'Spring collection',
		},
	]);

	const [formOpen, setFormOpen] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [formData, setFormData] = useState(emptyForm);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleteTargetId, setDeleteTargetId] = useState(null);
	const [page, setPage] = useState(1);

	const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
	const paginatedRecords = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const handleOpenAdd = useCallback(() => {
		setEditingId(null);
		setFormData(emptyForm);
		setFormOpen(true);
	}, []);

	const handleOpenEdit = useCallback((record) => {
		setEditingId(record.id);
		setFormData({
			category: record.category,
			month: record.month,
			year: record.year,
			value: record.value,
			unit: record.unit,
			notes: record.notes,
		});
		setFormOpen(true);
	}, []);

	const handleCloseForm = useCallback(() => {
		setFormOpen(false);
		setEditingId(null);
		setFormData(emptyForm);
	}, []);

	const handleFieldChange = useCallback((field) => (e) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }));
	}, []);

	const handleSubmit = useCallback(() => {
		if (editingId) {
			setRecords((prev) =>
				prev.map((r) => (r.id === editingId ? { ...r, ...formData, id: editingId } : r))
			);
		} else {
			const newRecord = {
				...formData,
				id: Date.now().toString(),
			};
			setRecords((prev) => [...prev, newRecord]);
		}
		handleCloseForm();
	}, [editingId, formData, handleCloseForm]);

	const handleOpenDelete = useCallback((id) => {
		setDeleteTargetId(id);
		setDeleteDialogOpen(true);
	}, []);

	const handleConfirmDelete = useCallback(() => {
		setRecords((prev) => prev.filter((r) => r.id !== deleteTargetId));
		setDeleteDialogOpen(false);
		setDeleteTargetId(null);
	}, [deleteTargetId]);

	const handleCancelDelete = useCallback(() => {
		setDeleteDialogOpen(false);
		setDeleteTargetId(null);
	}, []);

	return (
		<Box data-testid="sales-data-page" sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
			<Paper elevation={3} sx={{ p: 4 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
					<Typography variant="h4">Sales Records</Typography>
					<Button
						data-testid="sales-data-add-button"
						variant="contained"
						color="primary"
						startIcon={<AddIcon />}
						onClick={handleOpenAdd}
					>
						Add Record
					</Button>
				</Box>

				{/* Table - always rendered */}
				<TableContainer component={Paper} variant="outlined">
					<Table data-testid="sales-data-table">
						<TableHead>
							<TableRow sx={{ bgcolor: 'grey.100' }}>
								<TableCell><strong>Category</strong></TableCell>
								<TableCell><strong>Month</strong></TableCell>
								<TableCell><strong>Year</strong></TableCell>
								<TableCell><strong>Value</strong></TableCell>
								<TableCell><strong>Unit</strong></TableCell>
								<TableCell><strong>Notes</strong></TableCell>
								<TableCell align="right"><strong>Actions</strong></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginatedRecords.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} align="center">
										<Box
											data-testid="sales-data-empty"
											sx={{ py: 4 }}
										>
											<Typography variant="body1" color="textSecondary">
												No sales records found
											</Typography>
										</Box>
									</TableCell>
								</TableRow>
							) : (
								paginatedRecords.map((record) => (
									<TableRow
										key={record.id}
										data-testid={`sales-data-row-${record.id}`}
									>
										<TableCell>{record.category}</TableCell>
										<TableCell>{record.month}</TableCell>
										<TableCell>{record.year}</TableCell>
										<TableCell>{record.value}</TableCell>
										<TableCell>{record.unit}</TableCell>
										<TableCell>{record.notes}</TableCell>
										<TableCell align="right">
											<IconButton
												data-testid={`sales-data-edit-${record.id}`}
												size="small"
												onClick={() => handleOpenEdit(record)}
											>
												<EditIcon fontSize="small" />
											</IconButton>
											<IconButton
												data-testid={`sales-data-delete-${record.id}`}
												size="small"
												color="error"
												onClick={() => handleOpenDelete(record.id)}
											>
												<DeleteIcon fontSize="small" />
											</IconButton>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>

				{/* Pagination - always rendered */}
				<Box
					data-testid="sales-data-pagination"
					sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}
				>
					<Pagination
						count={totalPages}
						page={page}
						onChange={(_, value) => setPage(value)}
					/>
				</Box>
			</Paper>

			{/* Add/Edit Form Dialog */}
			<Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
				<DialogTitle>{editingId ? 'Edit Record' : 'Add Record'}</DialogTitle>
				<DialogContent data-testid="sales-data-form">
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
						<FormControl fullWidth>
							<InputLabel>Category</InputLabel>
							<Select
								data-testid="sales-data-field-category"
								value={formData.category}
								onChange={handleFieldChange('category')}
								label="Category"
							>
								{CATEGORIES.map((cat) => (
									<MenuItem key={cat} value={cat}>{cat}</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl fullWidth>
							<InputLabel>Month</InputLabel>
							<Select
								data-testid="sales-data-field-month"
								value={formData.month}
								onChange={handleFieldChange('month')}
								label="Month"
							>
								{MONTHS.map((m) => (
									<MenuItem key={m} value={m}>{m}</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							data-testid="sales-data-field-year"
							label="Year"
							type="number"
							value={formData.year}
							onChange={handleFieldChange('year')}
							fullWidth
						/>

						<TextField
							data-testid="sales-data-field-value"
							label="Value"
							type="number"
							value={formData.value}
							onChange={handleFieldChange('value')}
							fullWidth
						/>

						<FormControl fullWidth>
							<InputLabel>Unit</InputLabel>
							<Select
								data-testid="sales-data-field-unit"
								value={formData.unit}
								onChange={handleFieldChange('unit')}
								label="Unit"
							>
								{UNITS.map((u) => (
									<MenuItem key={u} value={u}>{u}</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							data-testid="sales-data-field-notes"
							label="Notes"
							multiline
							rows={3}
							value={formData.notes}
							onChange={handleFieldChange('notes')}
							fullWidth
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						data-testid="sales-data-form-cancel"
						onClick={handleCloseForm}
					>
						Cancel
					</Button>
					<Button
						data-testid="sales-data-form-submit"
						variant="contained"
						color="primary"
						onClick={handleSubmit}
					>
						{editingId ? 'Update' : 'Save'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
					<Typography>Are you sure you want to delete this record?</Typography>
				</DialogContent>
				<DialogActions>
					<Button
						data-testid="sales-data-delete-cancel"
						onClick={handleCancelDelete}
					>
						Cancel
					</Button>
					<Button
						data-testid="sales-data-delete-confirm"
						variant="contained"
						color="error"
						onClick={handleConfirmDelete}
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default SalesData;
