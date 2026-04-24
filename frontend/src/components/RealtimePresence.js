import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Avatar,
	AvatarGroup,
	Tooltip,
	Chip,
} from '@mui/material';
import {
	WifiTethering as ConnectedIcon,
	SignalWifiOff as DisconnectedIcon,
	People as PeopleIcon,
} from '@mui/icons-material';

import { jwt } from '../utils/index.js';

// Simulated viewers (in a real app this would come from a websocket)
const SIMULATED_VIEWERS = [
	{ id: 'v1', username: 'jane.doe', color: '#1976d2' },
	{ id: 'v2', username: 'bob.smith', color: '#388e3c' },
	{ id: 'v3', username: 'alice.j', color: '#f57c00' },
];

const RealtimePresence = () => {
	const [connected, setConnected] = useState(false);
	const [viewers, setViewers] = useState([]);
	const [currentUser, setCurrentUser] = useState({ username: 'You', color: '#9c27b0' });

	useEffect(() => {
		// Simulate connection establishment
		try {
			const decoded = jwt.decode();
			if (decoded?.username) {
				setCurrentUser({ username: decoded.username, color: '#9c27b0' });
			}
		} catch (e) { /* ignore */ }

		// Simulate connecting after a brief delay
		const connectTimer = setTimeout(() => {
			setConnected(true);
			// Simulate other viewers joining
			setViewers(SIMULATED_VIEWERS);
		}, 300);

		return () => {
			clearTimeout(connectTimer);
		};
	}, []);

	const allViewers = [currentUser, ...viewers];
	const viewerCount = allViewers.length;

	return (
		<Box
			sx={{
				display: 'flex',
				alignItems: 'center',
				gap: 2,
				p: 1.5,
				bgcolor: 'background.paper',
				borderRadius: 1,
				border: '1px solid',
				borderColor: 'divider',
				mb: 2,
			}}
		>
			{/* Connection status */}
			<Box
				data-testid="realtime-status"
				sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
			>
				{connected ? (
					<Chip
						data-testid="realtime-status-connected"
						icon={<ConnectedIcon />}
						label="Live"
						color="success"
						size="small"
						sx={{ fontWeight: 'bold' }}
					/>
				) : (
					<Chip
						data-testid="realtime-status-disconnected"
						icon={<DisconnectedIcon />}
						label="Connecting..."
						color="default"
						size="small"
					/>
				)}
			</Box>

			{/* Active viewers */}
			<Box
				data-testid="realtime-viewers"
				sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}
			>
				<PeopleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
				<Typography
					data-testid="realtime-viewer-count"
					variant="body2"
					sx={{ fontWeight: 'bold', mr: 1 }}
				>
					{viewerCount} {viewerCount === 1 ? 'viewer' : 'viewers'}
				</Typography>
				<AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.8rem' } }}>
					{allViewers.map((v) => (
						<Tooltip key={v.id || 'me'} title={v.username}>
							<Avatar
								data-testid={`realtime-viewer-${v.id || 'me'}`}
								sx={{ bgcolor: v.color }}
							>
								{v.username.charAt(0).toUpperCase()}
							</Avatar>
						</Tooltip>
					))}
				</AvatarGroup>
			</Box>

			{/* Last sync indicator */}
			{connected && (
				<Box
					data-testid="realtime-last-sync"
					sx={{
						display: 'flex',
						alignItems: 'center',
						gap: 0.5,
						color: 'text.secondary',
					}}
				>
					<Box
						sx={{
							width: 8,
							height: 8,
							bgcolor: 'success.main',
							borderRadius: '50%',
							animation: 'pulse 2s infinite',
							'@keyframes pulse': {
								'0%, 100%': { opacity: 1 },
								'50%': { opacity: 0.4 },
							},
						}}
					/>
					<Typography variant="caption">
						synced
					</Typography>
				</Box>
			)}
		</Box>
	);
};

export default RealtimePresence;
