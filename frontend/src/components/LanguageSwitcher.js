import React, { useState, useCallback } from 'react';
import {
	Button,
	Menu,
	MenuItem,
	Box,
	Typography,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import { Language as LanguageIcon, Check as CheckIcon } from '@mui/icons-material';

import { useI18n } from '../utils/i18n.js';

const LANGUAGES = [
	{ code: 'en', label: 'English', flag: '🇬🇧' },
	{ code: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
];

const LanguageSwitcher = () => {
	const { language, setLanguage } = useI18n();
	const [anchorEl, setAnchorEl] = useState(null);

	const handleOpen = useCallback((e) => {
		setAnchorEl(e.currentTarget);
	}, []);

	const handleClose = useCallback(() => {
		setAnchorEl(null);
	}, []);

	const handleSelect = useCallback((code) => {
		setLanguage(code);
		setAnchorEl(null);
	}, [setLanguage]);

	const activeLabel = language.toUpperCase();

	return (
		<>
			<Button
				data-testid="language-switcher"
				onClick={handleOpen}
				startIcon={<LanguageIcon />}
				sx={{ color: 'secondary.main', mr: 1 }}
			>
				<Typography
					data-testid="language-active"
					variant="body2"
					fontWeight="bold"
				>
					{activeLabel}
				</Typography>
			</Button>

			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				{LANGUAGES.map((lang) => (
					<MenuItem
						key={lang.code}
						data-testid={`language-option-${lang.code}`}
						onClick={() => handleSelect(lang.code)}
						selected={language === lang.code}
					>
						<ListItemIcon>
							<Box sx={{ fontSize: '1.25rem' }}>{lang.flag}</Box>
						</ListItemIcon>
						<ListItemText primary={lang.label} />
						{language === lang.code && (
							<CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />
						)}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default LanguageSwitcher;
