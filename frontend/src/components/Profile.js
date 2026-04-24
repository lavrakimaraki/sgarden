import React, { useState, useEffect } from 'react';
import {
	Paper,
	Typography,
	TextField,
	Button,
	Grid,
	Snackbar,
	Alert,
	Box,
	Divider,
	IconButton,
	InputAdornment,
	CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jwt } from '../utils/index.js';

const Profile = () => {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [editMode, setEditMode] = useState(false);
	const [saving, setSaving] = useState(false);

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [snackbar, setSnackbar] = useState({
		open: false,
		message: '',
		severity: 'success',
	});

	useEffect(() => {
		try {
			if (!jwt.isAuthenticated()) {
				navigate('/');
				return;
			}

			const decoded = jwt.decode();
			if (decoded) {
				const userData = {
					username: decoded.username || '',
					email: decoded.email || '',
					role: decoded.role || 'user',
					createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : new Date().toISOString(),
					lastActiveAt: new Date().toISOString(),
				};
				setUser(userData);
				setUsername(userData.username);
				setEmail(userData.email);
			}
			setLoading(false);
		} catch (error) {
			console.error('Error loading profile:', error);
			setLoading(false);
		}
	}, [navigate]);

	const handleSaveProfile = async () => {
		try {
			setSaving(true);

			if (!username.trim() || !email.trim()) {
				setSnackbar({ open: true, message: 'Username and email are required', severity: 'error' });
				setSaving(false);
				return;
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				setSnackbar({ open: true, message: 'Invalid email format', severity: 'error' });
				setSaving(false);
				return;
			}

			const token = jwt.getToken();
			const response = await fetch('/api/user/profile', {
				method: 'PUT',
				credentials: 'include',
				headers: { 'x-access-token': token, 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, email }),
			});

			if (response.ok) {
				const data = await response.json();
				if (data.user) setUser(data.user);
				setEditMode(false);
				setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
			} else {
				const errData = await response.json().catch(() => ({}));
				setSnackbar({ open: true, message: errData.message || 'Failed to update profile', severity: 'error' });
			}
		} catch (error) {
			setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
		} finally {
			setSaving(false);
		}
	};

	const handleChangePassword = async () => {
		try {
			setSaving(true);

			if (!currentPassword || !newPassword || !confirmPassword) {
				setSnackbar({ open: true, message: 'All password fields are required', severity: 'error' });
				setSaving(false);
				return;
			}

			if (newPassword.length < 8) {
				setSnackbar({ open: true, message: 'New password must be at least 8 characters', severity: 'error' });
				setSaving(false);
				return;
			}

			if (newPassword !== confirmPassword) {
				setSnackbar({ open: true, message: 'New passwords do not match', severity: 'error' });
				setSaving(false);
				return;
			}

			const token = jwt.getToken();
			const response = await fetch('/api/user/password', {
				method: 'PUT',
				credentials: 'include',
				headers: { 'x-access-token': token, 'Content-Type': 'application/json' },
				body: JSON.stringify({ currentPassword, newPassword }),
			});

			if (response.ok) {
				setCurrentPassword('');
				setNewPassword('');
				setConfirmPassword('');
				setSnackbar({ open: true, message: 'Password changed successfully', severity: 'success' });
			} else {
				const errData = await response.json().catch(() => ({}));
				setSnackbar({ open: true, message: errData.message || 'Failed to change password', severity: 'error' });
			}
		} catch (error) {
			setSnackbar({ open: true, message: 'Failed to change password', severity: 'error' });
		} finally {
			setSaving(false);
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
		});
	};

	const handleCancelEdit = () => {
		setEditMode(false);
		setUsername(user.username);
		setEmail(user.email);
	};

	const handleSnackbarClose = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	if (loading) {
		return (
			<Box data-testid="profile-page" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
				<CircularProgress />
			</Box>
		);
	}

	if (!user) {
		return (
			<Box data-testid="profile-page" sx={{ height: '100%' }}>
				<Typography>Failed to load profile</Typography>
			</Box>
		);
	}

	return (
		<Box data-testid="profile-page" sx={{ p: 4, overflowY: 'auto', height: '100%' }}>
			<Paper elevation={3} sx={{ p: 4 }}>
				<Typography variant="h4" gutterBottom>Profile Settings</Typography>

				<Divider sx={{ my: 3 }} />

				<Box sx={{ mb: 4 }}>
					<Typography variant="h6" gutterBottom>Profile Information</Typography>

					<Grid container spacing={3} sx={{ mt: 1 }}>
						<Grid item xs={12} sm={6}>
							{editMode ? (
								<Box data-testid="profile-username">
									<TextField fullWidth label="Username" value={username} onChange={(e) => setUsername(e.target.value)} variant="outlined" />
								</Box>
							) : (
								<Typography data-testid="profile-username" variant="body1" sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
									<strong>Username:</strong> {user.username}
								</Typography>
							)}
						</Grid>

						<Grid item xs={12} sm={6}>
							{editMode ? (
								<Box data-testid="profile-email">
									<TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} variant="outlined" />
								</Box>
							) : (
								<Typography data-testid="profile-email" variant="body1" sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
									<strong>Email:</strong> {user.email}
								</Typography>
							)}
						</Grid>

						<Grid item xs={12} sm={6}>
							<Typography data-testid="profile-role" variant="body1" sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
								<strong>Role:</strong> {user.role || 'user'}
							</Typography>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Typography data-testid="profile-created-at" variant="body1" sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
								<strong>Account Created:</strong> {formatDate(user.createdAt)}
							</Typography>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Typography data-testid="profile-last-active" variant="body1" sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
								<strong>Last Active:</strong> {formatDate(user.lastActiveAt || user.updatedAt)}
							</Typography>
						</Grid>
					</Grid>

					<Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
						{!editMode ? (
							<Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditMode(true)} data-testid="profile-edit-button" disabled={saving}>
								Edit Profile
							</Button>
						) : (
							<React.Fragment>
								<Button variant="contained" color="primary" onClick={handleSaveProfile} data-testid="profile-save-button" disabled={saving}>
									{saving ? 'Saving...' : 'Save Changes'}
								</Button>
								<Button variant="outlined" onClick={handleCancelEdit} disabled={saving}>Cancel</Button>
							</React.Fragment>
						)}
					</Box>
				</Box>

				<Divider sx={{ my: 3 }} />

				<Box>
					<Typography variant="h6" gutterBottom>Change Password</Typography>

					<Grid container spacing={3} sx={{ mt: 1 }}>
						<Grid item xs={12}>
							<TextField fullWidth label="Current Password" type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} data-testid="profile-password-current" variant="outlined"
								InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">{showCurrentPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField fullWidth label="New Password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} data-testid="profile-password-new" variant="outlined" helperText="Minimum 8 characters"
								InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">{showNewPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<TextField fullWidth label="Confirm New Password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} data-testid="profile-password-confirm" variant="outlined"
								InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }}
							/>
						</Grid>
					</Grid>

					<Box sx={{ mt: 3 }}>
						<Button variant="contained" color="secondary" onClick={handleChangePassword} data-testid="profile-password-save" disabled={saving}>
							{saving ? 'Changing...' : 'Change Password'}
						</Button>
					</Box>
				</Box>
			</Paper>

			<Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
				<Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} data-testid={snackbar.severity === 'success' ? 'profile-success-message' : 'profile-error-message'}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
};

export default Profile;
