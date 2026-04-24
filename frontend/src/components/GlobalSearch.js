import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
	Dialog,
	DialogContent,
	IconButton,
	TextField,
	Box,
	Typography,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	ListItemIcon,
	Tooltip,
	Divider,
	InputAdornment,
} from '@mui/material';
import {
	Search as SearchIcon,
	Close as CloseIcon,
	Dashboard as DashboardIcon,
	Person as PersonIcon,
	History as HistoryIcon,
	Insights as InsightsIcon,
	Analytics as AnalyticsIcon,
	Notifications as NotificationsIcon,
	Description as PageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { jwt } from '../utils/index.js';

const RECENT_KEY = 'global-search-recent';
const MAX_RECENT = 5;

// Static searchable items (pages + dashboards)
const SEARCHABLE_ITEMS = [
	{ id: 'page-overview', category: 'Dashboards', title: 'Overview', path: '/dashboard', icon: <DashboardIcon /> },
	{ id: 'page-analytics', category: 'Dashboards', title: 'Analytics', path: '/dashboard1', icon: <AnalyticsIcon /> },
	{ id: 'page-insights', category: 'Dashboards', title: 'Insights', path: '/dashboard2', icon: <InsightsIcon /> },
	{ id: 'page-profile', category: 'Pages', title: 'Profile', path: '/profile', icon: <PersonIcon /> },
	{ id: 'page-import', category: 'Pages', title: 'Import Data', path: '/import', icon: <PageIcon /> },
	{ id: 'page-sales', category: 'Pages', title: 'Sales Records', path: '/data/manage', icon: <PageIcon /> },
	{ id: 'page-alerts', category: 'Pages', title: 'Threshold Alerts', path: '/alerts', icon: <NotificationsIcon /> },
	{ id: 'page-activity', category: 'Admin', title: 'Activity Log', path: '/activity', icon: <HistoryIcon />, adminOnly: true },
	{ id: 'page-users', category: 'Admin', title: 'Users', path: '/users', icon: <PersonIcon />, adminOnly: true },
];

const GlobalSearch = () => {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const [recent, setRecent] = useState([]);
	const inputRef = useRef(null);

	const isAdmin = jwt.isAdmin();

	// Load recent searches
	useEffect(() => {
		try {
			const stored = localStorage.getItem(RECENT_KEY);
			if (stored) setRecent(JSON.parse(stored));
		} catch (e) {
			// ignore
		}
	}, []);

	// Keyboard shortcut Ctrl+K / Cmd+K
	useEffect(() => {
		const handler = (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
			if (e.key === 'Escape' && open) {
				setOpen(false);
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [open]);

	const handleOpen = useCallback(() => {
		setOpen(true);
	}, []);

	const handleClose = useCallback(() => {
		setOpen(false);
		setQuery('');
	}, []);

	const persistRecent = useCallback((items) => {
		try {
			localStorage.setItem(RECENT_KEY, JSON.stringify(items));
		} catch (e) {
			// ignore
		}
	}, []);

	const addRecent = useCallback((searchTerm) => {
		if (!searchTerm.trim()) return;
		setRecent((prev) => {
			const filtered = prev.filter((r) => r !== searchTerm);
			const updated = [searchTerm, ...filtered].slice(0, MAX_RECENT);
			persistRecent(updated);
			return updated;
		});
	}, [persistRecent]);

	const handleResultClick = useCallback((item) => {
		addRecent(query || item.title);
		navigate(item.path);
		handleClose();
	}, [query, addRecent, navigate, handleClose]);

	const handleRecentClick = useCallback((term) => {
		setQuery(term);
		if (inputRef.current) inputRef.current.focus();
	}, []);

	// Filter items based on query and admin status
	const visibleItems = SEARCHABLE_ITEMS.filter((item) => !item.adminOnly || isAdmin);
	const filteredItems = query.trim()
		? visibleItems.filter((item) =>
			item.title.toLowerCase().includes(query.toLowerCase())
			|| item.category.toLowerCase().includes(query.toLowerCase())
		)
		: [];

	// Group by category
	const grouped = filteredItems.reduce((acc, item) => {
		if (!acc[item.category]) acc[item.category] = [];
		acc[item.category].push(item);
		return acc;
	}, {});

	const showRecent = !query.trim() && recent.length > 0;
	const showNoResults = query.trim() && filteredItems.length === 0;

	return (
		<>
			<Tooltip title="Search (Ctrl+K)">
				<IconButton
					data-testid="global-search-trigger"
					onClick={handleOpen}
					sx={{ mr: 1 }}
				>
					<SearchIcon sx={{ color: 'secondary.main' }} />
				</IconButton>
			</Tooltip>

			<Dialog
				open={open}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: { position: 'absolute', top: 80 },
				}}
			>
				<Box data-testid="global-search-dialog">
					{/* Search input header */}
					<Box
						sx={{
							display: 'flex',
							alignItems: 'center',
							p: 2,
							borderBottom: '1px solid',
							borderColor: 'divider',
						}}
					>
						<TextField
							inputRef={inputRef}
							data-testid="global-search-input"
							autoFocus
							fullWidth
							placeholder="Search dashboards, pages, users..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							variant="standard"
							InputProps={{
								disableUnderline: true,
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon color="action" />
									</InputAdornment>
								),
							}}
						/>
						<IconButton
							data-testid="global-search-close"
							onClick={handleClose}
							size="small"
							sx={{ ml: 1 }}
						>
							<CloseIcon />
						</IconButton>
					</Box>

					{/* Results */}
					<DialogContent sx={{ p: 0, minHeight: 200, maxHeight: 500 }}>
						<Box data-testid="global-search-results">
							{/* Recent searches when no query */}
							{showRecent && (
								<Box data-testid="global-search-recent" sx={{ p: 2 }}>
									<Typography
										variant="caption"
										color="text.secondary"
										sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
									>
										Recent Searches
									</Typography>
									<List dense>
										{recent.map((term, index) => (
											<ListItemButton
												key={`${term}-${index}`}
												data-testid={`global-search-recent-item-${index}`}
												onClick={() => handleRecentClick(term)}
											>
												<ListItemIcon sx={{ minWidth: 36 }}>
													<HistoryIcon fontSize="small" />
												</ListItemIcon>
												<ListItemText primary={term} />
											</ListItemButton>
										))}
									</List>
								</Box>
							)}

							{/* Empty initial state - no recent, no query */}
							{!query.trim() && recent.length === 0 && (
								<Box sx={{ p: 4, textAlign: 'center' }}>
									<Typography variant="body2" color="text.secondary">
										Start typing to search across dashboards, pages, and more
									</Typography>
									<Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
										Tip: Press Ctrl+K (or Cmd+K) to open search anywhere
									</Typography>
								</Box>
							)}

							{/* No results found */}
							{showNoResults && (
								<Box
									data-testid="global-search-no-results"
									sx={{ p: 4, textAlign: 'center' }}
								>
									<Typography variant="body1" color="text.secondary">
										No results found for "{query}"
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Try a different search term
									</Typography>
								</Box>
							)}

							{/* Grouped results */}
							{Object.entries(grouped).map(([category, items]) => (
								<Box key={category}>
									<Box
										data-testid={`global-search-category-${category.toLowerCase()}`}
										sx={{
											px: 2,
											py: 1,
											bgcolor: 'action.hover',
										}}
									>
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
										>
											{category}
										</Typography>
									</Box>
									<List disablePadding dense>
										{items.map((item) => (
											<ListItem
												key={item.id}
												data-testid={`global-search-result-${item.id}`}
												disablePadding
											>
												<ListItemButton onClick={() => handleResultClick(item)}>
													<ListItemIcon sx={{ minWidth: 40 }}>
														{item.icon}
													</ListItemIcon>
													<ListItemText
														primary={
															<span data-testid={`global-search-result-title-${item.id}`}>
																{item.title}
															</span>
														}
														secondary={item.path}
													/>
												</ListItemButton>
											</ListItem>
										))}
									</List>
									<Divider />
								</Box>
							))}
						</Box>
					</DialogContent>
				</Box>
			</Dialog>
		</>
	);
};

export default GlobalSearch;
