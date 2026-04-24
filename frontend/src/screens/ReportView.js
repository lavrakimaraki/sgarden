import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Box,
	Typography,
	Paper,
	Button,
	Divider,
	Chip,
} from '@mui/material';
import { Print as PrintIcon, ArrowBack as BackIcon } from '@mui/icons-material';

const STORAGE_KEY = 'saved-reports';

const ReportView = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [report, setReport] = useState(null);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const reports = JSON.parse(stored);
				const found = reports.find((r) => r.id === id);
				setReport(found || null);
			}
		} catch (e) { /* ignore */ }
	}, [id]);

	const handlePrint = () => {
		window.print();
	};

	const handleBack = () => {
		navigate('/reports');
	};

	return (
		<Box data-testid="report-view-page" sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
			<Paper elevation={3} sx={{ p: 4 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
					<Button
						startIcon={<BackIcon />}
						onClick={handleBack}
						className="no-print"
					>
						Back to Reports
					</Button>
					<Button
						data-testid="report-view-print"
						variant="contained"
						color="primary"
						startIcon={<PrintIcon />}
						onClick={handlePrint}
						className="no-print"
					>
						Print
					</Button>
				</Box>

				<Divider sx={{ mb: 3 }} />

				{report ? (
					<>
						<Typography variant="h3" gutterBottom>
							{report.title}
						</Typography>
						<Typography variant="caption" color="textSecondary" display="block" gutterBottom>
							Created: {new Date(report.createdAt).toLocaleString()}
						</Typography>
						{(report.dateFrom || report.dateTo) && (
							<Typography variant="body2" color="textSecondary" gutterBottom>
								Period: {report.dateFrom || 'N/A'} → {report.dateTo || 'N/A'}
							</Typography>
						)}

						<Divider sx={{ my: 3 }} />

						<Typography variant="h6" gutterBottom>
							Selected Charts
						</Typography>
						<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
							{(report.charts || []).length > 0 ? (
								report.charts.map((c) => (
									<Chip key={c} label={c} color="primary" variant="outlined" />
								))
							) : (
								<Typography variant="body2" color="textSecondary">
									No charts selected
								</Typography>
							)}
						</Box>

						<Divider sx={{ my: 3 }} />

						<Typography variant="h6" gutterBottom>
							Commentary
						</Typography>
						<Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
							{report.commentary || 'No commentary provided.'}
						</Typography>
					</>
				) : (
					<Typography variant="body1" color="textSecondary">
						Report not found
					</Typography>
				)}
			</Paper>

			{/* Print styles */}
			<style>{`
				@media print {
					.no-print { display: none !important; }
				}
			`}</style>
		</Box>
	);
};

export default ReportView;
