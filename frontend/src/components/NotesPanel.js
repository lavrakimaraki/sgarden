import React, { useState, useCallback, useEffect } from 'react';
import {
	Box,
	Drawer,
	IconButton,
	Typography,
	TextField,
	Button,
	List,
	ListItem,
	ListItemText,
	Divider,
	Tooltip,
	Fab,
} from '@mui/material';
import {
	Notes as NotesIcon,
	Close as CloseIcon,
	Edit as EditIcon,
	Delete as DeleteIcon,
	PushPin as PushPinIcon,
	PushPinOutlined as PushPinOutlinedIcon,
	Save as SaveIcon,
	Cancel as CancelIcon,
} from '@mui/icons-material';

const NotesPanel = ({ dashboardId }) => {
	const storageKey = `notes-${dashboardId}`;
	const [open, setOpen] = useState(false);
	const [notes, setNotes] = useState([]);
	const [newNoteText, setNewNoteText] = useState('');
	const [editingId, setEditingId] = useState(null);
	const [editingText, setEditingText] = useState('');

	// Load notes from localStorage
	useEffect(() => {
		try {
			const stored = localStorage.getItem(storageKey);
			if (stored) {
				setNotes(JSON.parse(stored));
			}
		} catch (e) {
			console.error('Failed to load notes', e);
		}
	}, [storageKey]);

	// Persist notes to localStorage
	const persistNotes = useCallback((updatedNotes) => {
		try {
			localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
		} catch (e) {
			console.error('Failed to save notes', e);
		}
	}, [storageKey]);

	const handleToggle = useCallback(() => {
		setOpen((prev) => !prev);
	}, []);

	const handleClose = useCallback(() => {
		setOpen(false);
	}, []);

	const handleAddNote = useCallback(() => {
		if (!newNoteText.trim()) return;
		const newNote = {
			id: Date.now().toString(),
			content: newNoteText.trim(),
			pinned: false,
			createdAt: new Date().toISOString(),
		};
		const updated = [newNote, ...notes];
		setNotes(updated);
		persistNotes(updated);
		setNewNoteText('');
	}, [newNoteText, notes, persistNotes]);

	const handleDeleteNote = useCallback((id) => {
		const updated = notes.filter((n) => n.id !== id);
		setNotes(updated);
		persistNotes(updated);
	}, [notes, persistNotes]);

	const handleTogglePin = useCallback((id) => {
		const updated = notes.map((n) =>
			n.id === id ? { ...n, pinned: !n.pinned } : n
		);
		setNotes(updated);
		persistNotes(updated);
	}, [notes, persistNotes]);

	const handleStartEdit = useCallback((note) => {
		setEditingId(note.id);
		setEditingText(note.content);
	}, []);

	const handleSaveEdit = useCallback(() => {
		const updated = notes.map((n) =>
			n.id === editingId ? { ...n, content: editingText.trim() } : n
		);
		setNotes(updated);
		persistNotes(updated);
		setEditingId(null);
		setEditingText('');
	}, [editingId, editingText, notes, persistNotes]);

	const handleCancelEdit = useCallback(() => {
		setEditingId(null);
		setEditingText('');
	}, []);

	// Sort: pinned first, then by createdAt desc
	const sortedNotes = [...notes].sort((a, b) => {
		if (a.pinned && !b.pinned) return -1;
		if (!a.pinned && b.pinned) return 1;
		return new Date(b.createdAt) - new Date(a.createdAt);
	});

	return (
		<>
			{/* Floating toggle button */}
			<Tooltip title="Toggle Notes">
				<Fab
					data-testid="notes-toggle-button"
					color="primary"
					onClick={handleToggle}
					sx={{
						position: 'fixed',
						bottom: 24,
						right: 24,
						zIndex: 1200,
					}}
				>
					<NotesIcon />
				</Fab>
			</Tooltip>

			{/* Notes Drawer */}
			<Drawer
				anchor="right"
				open={open}
				onClose={handleClose}
				PaperProps={{
					sx: { width: { xs: '100%', sm: 380 } },
				}}
			>
				<Box
					data-testid="notes-panel"
					sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
				>
					{/* Header */}
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							p: 2,
							borderBottom: '1px solid',
							borderColor: 'divider',
						}}
					>
						<Typography variant="h6">Notes</Typography>
						<IconButton onClick={handleClose} size="small">
							<CloseIcon />
						</IconButton>
					</Box>

					{/* Add Note Section */}
					<Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
						<TextField
							data-testid="notes-add-input"
							fullWidth
							multiline
							rows={2}
							placeholder="Add a new note..."
							value={newNoteText}
							onChange={(e) => setNewNoteText(e.target.value)}
							variant="outlined"
							size="small"
						/>
						<Button
							data-testid="notes-add-submit"
							variant="contained"
							color="primary"
							fullWidth
							onClick={handleAddNote}
							disabled={!newNoteText.trim()}
							sx={{ mt: 1 }}
						>
							Add Note
						</Button>
					</Box>

					{/* Notes List */}
					<Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
						<List data-testid="notes-list" disablePadding>
							{sortedNotes.length === 0 ? (
								<Box
									data-testid="notes-empty"
									sx={{
										display: 'flex',
										flexDirection: 'column',
										justifyContent: 'center',
										alignItems: 'center',
										py: 6,
										px: 2,
									}}
								>
									<Typography variant="body2" color="textSecondary">
										No notes yet
									</Typography>
									<Typography variant="caption" color="textSecondary">
										Add your first note above
									</Typography>
								</Box>
							) : (
								sortedNotes.map((note, index) => (
									<React.Fragment key={note.id}>
										<ListItem
											data-testid={`notes-item-${note.id}`}
											sx={{
												flexDirection: 'column',
												alignItems: 'stretch',
												bgcolor: note.pinned ? 'action.hover' : 'inherit',
												py: 1.5,
											}}
										>
											{/* Pinned indicator */}
											{note.pinned && (
												<Box
													data-testid={`notes-item-pinned-${note.id}`}
													sx={{
														display: 'flex',
														alignItems: 'center',
														mb: 0.5,
														color: 'primary.main',
													}}
												>
													<PushPinIcon fontSize="small" sx={{ mr: 0.5 }} />
													<Typography variant="caption" fontWeight="bold">
														Pinned
													</Typography>
												</Box>
											)}

											{/* Content - editable or view */}
											{editingId === note.id ? (
												<TextField
													fullWidth
													multiline
													rows={2}
													value={editingText}
													onChange={(e) => setEditingText(e.target.value)}
													size="small"
													autoFocus
												/>
											) : (
												<Typography
													data-testid={`notes-item-content-${note.id}`}
													variant="body2"
													sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
												>
													{note.content}
												</Typography>
											)}

											{/* Actions */}
											<Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 0.5 }}>
												{editingId === note.id ? (
													<>
														<Tooltip title="Save">
															<IconButton size="small" color="primary" onClick={handleSaveEdit}>
																<SaveIcon fontSize="small" />
															</IconButton>
														</Tooltip>
														<Tooltip title="Cancel">
															<IconButton size="small" onClick={handleCancelEdit}>
																<CancelIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</>
												) : (
													<>
														<Tooltip title={note.pinned ? 'Unpin' : 'Pin'}>
															<IconButton
																data-testid={`notes-item-pin-${note.id}`}
																size="small"
																onClick={() => handleTogglePin(note.id)}
															>
																{note.pinned ? (
																	<PushPinIcon fontSize="small" color="primary" />
																) : (
																	<PushPinOutlinedIcon fontSize="small" />
																)}
															</IconButton>
														</Tooltip>
														<Tooltip title="Edit">
															<IconButton
																data-testid={`notes-item-edit-${note.id}`}
																size="small"
																onClick={() => handleStartEdit(note)}
															>
																<EditIcon fontSize="small" />
															</IconButton>
														</Tooltip>
														<Tooltip title="Delete">
															<IconButton
																data-testid={`notes-item-delete-${note.id}`}
																size="small"
																color="error"
																onClick={() => handleDeleteNote(note.id)}
															>
																<DeleteIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													</>
												)}
											</Box>
										</ListItem>
										{index < sortedNotes.length - 1 && <Divider />}
									</React.Fragment>
								))
							)}
						</List>
					</Box>
				</Box>
			</Drawer>
		</>
	);
};

export default NotesPanel;
