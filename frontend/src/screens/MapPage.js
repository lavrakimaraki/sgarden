import React, { useState, useCallback } from 'react';
import {
	Box,
	Typography,
	Paper,
	Button,
	TextField,
	Drawer,
	IconButton,
	Tooltip,
	Divider,
	Grid,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const REGIONS = [
	{ id: 'thessaloniki', name: 'Thessaloniki', x: 50, y: 50, width: 100, height: 80 },
	{ id: 'athens', name: 'Athens', x: 200, y: 80, width: 110, height: 90 },
	{ id: 'patras', name: 'Patras', x: 360, y: 70, width: 100, height: 80 },
	{ id: 'heraklion', name: 'Heraklion', x: 130, y: 200, width: 110, height: 70 },
	{ id: 'larissa', name: 'Larissa', x: 280, y: 210, width: 110, height: 70 },
];

const CATEGORIES = ['Sales', 'Marketing', 'Operations', 'R&D', 'Other'];

const emptyForm = {
	category: '',
	revenue: '',
	headcount: '',
	notes: '',
};

const STORAGE_KEY = 'map-region-data';

const getColorForValue = (value, max) => {
	if (!value || max === 0) return '#e0e0e0';
	const intensity = Math.min(1, value / max);
	const r = Math.round(33 + (220 - 33) * (1 - intensity));
	const g = Math.round(150 + (50 - 150) * intensity);
	const b = Math.round(243 + (50 - 243) * intensity);
	return `rgb(${r}, ${g}, ${b})`;
};

const MapPage = () => {
	const [selectedRegion, setSelectedRegion] = useState(null);
	const [hoveredRegion, setHoveredRegion] = useState(null);
	const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
	const [formData, setFormData] = useState(emptyForm);
	const [regionData, setRegionData] = useState(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? JSON.parse(stored) : {};
		} catch (e) {
			return {};
		}
	});

	const persistData = useCallback((data) => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch (e) { /* ignore */ }
	}, []);

	const handleRegionClick = useCallback((region) => {
		setSelectedRegion(region);
		const existing = regionData[region.id];
		setFormData(existing ? {
			category: existing.category || '',
			revenue: existing.revenue || '',
			headcount: existing.headcount || '',
			notes: existing.notes || '',
		} : emptyForm);
	}, [regionData]);

	const handleRegionHover = useCallback((region, e) => {
		setHoveredRegion(region);
		setTooltipPos({ x: e.clientX, y: e.clientY });
	}, []);

	const handleRegionLeave = useCallback(() => {
		setHoveredRegion(null);
	}, []);

	const handleFieldChange = useCallback((field) => (e) => {
		setFormData((prev) => ({ ...prev, [field]: e.target.value }));
	}, []);

	const handleSubmit = useCallback(() => {
		if (!selectedRegion) return;
		const updated = {
			...regionData,
			[selectedRegion.id]: {
				...formData,
				revenue: Number(formData.revenue) || 0,
				headcount: Number(formData.headcount) || 0,
			},
		};
		setRegionData(updated);
		persistData(updated);
		setSelectedRegion(null);
		setFormData(emptyForm);
	}, [selectedRegion, formData, regionData, persistData]);

	const handleCancel = useCallback(() => {
		setSelectedRegion(null);
		setFormData(emptyForm);
	}, []);

	const maxRevenue = Math.max(
		1,
		...Object.values(regionData).map((d) => d.revenue || 0)
	);

	const hasData = Object.keys(regionData).length > 0;

	return (
		<Box data-testid="map-page" sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
			<Paper elevation={3} sx={{ p: 4 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
					<Typography variant="h4">Regional Data Map</Typography>
					{hasData && (
						<Box
							data-testid="map-choropleth-active"
							sx={{
								px: 2,
								py: 0.5,
								bgcolor: 'success.light',
								color: 'success.contrastText',
								borderRadius: 1,
								fontSize: '0.85rem',
								fontWeight: 'bold',
							}}
						>
							Choropleth Active
						</Box>
					)}
				</Box>

				<Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
					Click a region to enter or edit its data. Hover for details.
				</Typography>

				{/* SVG Map */}
				<Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
					<svg
						viewBox="0 0 500 320"
						style={{ width: '100%', maxWidth: 700, border: '1px solid #ccc', background: '#f5f9fc' }}
					>
						{REGIONS.map((region) => {
							const data = regionData[region.id];
							const fillColor = data
								? getColorForValue(data.revenue, maxRevenue)
								: '#e0e0e0';
							const isSelected = selectedRegion?.id === region.id;
							return (
								<g key={region.id}>
									<rect
										data-testid={`map-region-${region.id}`}
										x={region.x}
										y={region.y}
										width={region.width}
										height={region.height}
										fill={fillColor}
										stroke={isSelected ? '#ff9800' : '#333'}
										strokeWidth={isSelected ? 4 : 1}
										style={{ cursor: 'pointer' }}
										onClick={() => handleRegionClick(region)}
										onMouseMove={(e) => handleRegionHover(region, e)}
										onMouseLeave={handleRegionLeave}
									/>
									<text
										x={region.x + region.width / 2}
										y={region.y + region.height / 2}
										textAnchor="middle"
										dominantBaseline="middle"
										fontSize="14"
										fontWeight="bold"
										fill="#000"
										pointerEvents="none"
									>
										{region.name}
									</text>
								</g>
							);
						})}
					</svg>

					{/* Selected region indicator */}
					{selectedRegion && (
						<Box
							data-testid="map-region-selected"
							sx={{
								position: 'absolute',
								top: 8,
								left: 8,
								bgcolor: 'warning.main',
								color: 'warning.contrastText',
								px: 1.5,
								py: 0.5,
								borderRadius: 1,
								fontSize: '0.85rem',
								fontWeight: 'bold',
							}}
						>
							Selected: {selectedRegion.name}
						</Box>
					)}

					{/* Hover tooltip */}
					{hoveredRegion && (
						<Box
							data-testid="map-tooltip"
							sx={{
								position: 'fixed',
								top: tooltipPos.y + 12,
								left: tooltipPos.x + 12,
								bgcolor: 'rgba(0,0,0,0.85)',
								color: 'white',
								px: 1.5,
								py: 1,
								borderRadius: 1,
								fontSize: '0.85rem',
								pointerEvents: 'none',
								zIndex: 1500,
								whiteSpace: 'nowrap',
							}}
						>
							<Typography variant="caption" fontWeight="bold" display="block">
								{hoveredRegion.name}
							</Typography>
							{regionData[hoveredRegion.id] ? (
								<>
									<Typography variant="caption" display="block">
										Category: {regionData[hoveredRegion.id].category || '-'}
									</Typography>
									<Typography variant="caption" display="block">
										Revenue: {regionData[hoveredRegion.id].revenue}
									</Typography>
									<Typography variant="caption" display="block">
										Headcount: {regionData[hoveredRegion.id].headcount}
									</Typography>
								</>
							) : (
								<Typography variant="caption" display="block">
									No data — click to add
								</Typography>
							)}
						</Box>
					)}
				</Box>

				{/* Legend */}
				<Box
					data-testid="map-legend"
					sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
				>
					<Typography variant="subtitle2" gutterBottom>
						Revenue Legend
					</Typography>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Typography variant="caption">Low</Typography>
						<Box
							sx={{
								flexGrow: 1,
								height: 20,
								background: 'linear-gradient(to right, rgb(33,150,243), rgb(220,50,50))',
								borderRadius: 0.5,
							}}
						/>
						<Typography variant="caption">High (max: {maxRevenue})</Typography>
					</Box>
				</Box>
			</Paper>

			{/* Data Entry Drawer */}
			<Drawer
				anchor="right"
				open={!!selectedRegion}
				onClose={handleCancel}
				PaperProps={{ sx: { width: { xs: '100%', sm: 380 } } }}
			>
				{selectedRegion && (
					<Box data-testid="map-data-form" sx={{ p: 3 }}>
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
							<Typography variant="h6">Region Data</Typography>
							<IconButton onClick={handleCancel} size="small">
								<CloseIcon />
							</IconButton>
						</Box>

						<Divider sx={{ mb: 2 }} />

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							<TextField
								data-testid="map-data-field-region-name"
								label="Region"
								value={selectedRegion.name}
								InputProps={{ readOnly: true }}
								fullWidth
							/>

							<TextField
								data-testid="map-data-field-category"
								label="Category"
								select
								SelectProps={{ native: true }}
								value={formData.category}
								onChange={handleFieldChange('category')}
								fullWidth
								InputLabelProps={{ shrink: true }}
							>
								<option value="">Select category</option>
								{CATEGORIES.map((c) => (
									<option key={c} value={c}>{c}</option>
								))}
							</TextField>

							<TextField
								data-testid="map-data-field-revenue"
								label="Revenue"
								type="number"
								value={formData.revenue}
								onChange={handleFieldChange('revenue')}
								fullWidth
							/>

							<TextField
								data-testid="map-data-field-headcount"
								label="Headcount"
								type="number"
								value={formData.headcount}
								onChange={handleFieldChange('headcount')}
								fullWidth
							/>

							<TextField
								data-testid="map-data-field-notes"
								label="Notes"
								multiline
								rows={3}
								value={formData.notes}
								onChange={handleFieldChange('notes')}
								fullWidth
							/>

							<Grid container spacing={2} sx={{ mt: 1 }}>
								<Grid item xs={6}>
									<Button
										data-testid="map-data-form-cancel"
										variant="outlined"
										fullWidth
										onClick={handleCancel}
									>
										Cancel
									</Button>
								</Grid>
								<Grid item xs={6}>
									<Button
										data-testid="map-data-form-submit"
										variant="contained"
										color="primary"
										fullWidth
										onClick={handleSubmit}
									>
										Save
									</Button>
								</Grid>
							</Grid>
						</Box>
					</Box>
				)}
			</Drawer>
		</Box>
	);
};

export default MapPage;
