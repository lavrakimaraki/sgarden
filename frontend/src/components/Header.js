import { useState, memo } from "react";
import { styled } from "@mui/material/styles";
import { AppBar, Toolbar, Typography, Menu, MenuItem, IconButton, Button, Paper, Breadcrumbs, Box } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    ExpandMore,
    MoreVert as MoreIcon,
    AccountCircle,
    Brightness7 as SunIcon,
    Brightness4 as MoonIcon,
    Settings as SettingsIcon,
} from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { Image } from "mui-image";

import { jwt, capitalize } from "../utils/index.js";
import { useThemeMode } from "../index.js";
import logo from "../assets/images/logo.png";
import { ReactComponent as LogoutIcon } from "../assets/images/logout.svg";
import NotificationCenter from "./NotificationCenter.js";
import GlobalSearch from "./GlobalSearch.js";
import LanguageSwitcher from "./LanguageSwitcher.js";


const useStyles = makeStyles((theme) => ({
	grow: {
		flexGrow: 1,
		flexBasis: "auto",
		background: theme.palette.background.paper,
		zIndex: 1200,
		height: "70px",
	},
	root: {
		height: "30px",
		padding: theme.spacing(0.5),
		borderRadius: "0px",
		background: theme.palette.grey.main,
	},
	icon: {
		marginRight: 0.5,
		width: 20,
		height: 20,
	},
	expanded: {
		background: "transparent",
	},
	innerSmallAvatar: {
		color: theme.palette.common.black,
		fontSize: "inherit",
	},
	anchorOriginBottomRightCircular: {
		".MuiBadge-anchorOriginBottomRightCircular": {
			right: 0,
			bottom: 0,
		},
	},
	avatar: {
		width: "30px",
		height: "30px",
		background: theme.palette.mode === 'dark' ? theme.palette.grey[700] : "white",
	},
	iconButton: {
		padding: "3px 6px",
	},
	menuItemButton: {
		width: "100%",
		bgcolor: "grey.light",
		"&:hover": {
			bgcolor: "grey.dark",
		},
	},
	grey: {
		color: "grey.500",
	},
	svgIcon: {
		width: "100%",
		height: "100%",
		"& g": {
			"& path": {
				fill: theme.palette.secondary.main,
			},
		},
	},
}));

const ButtonWithText = ({ text, icon, more, handler, testId }) => (
	<Button 
		sx={{ height: "100%", display: "flex", flexDirection: "column", p: 1, mx: 1 }} 
		onClick={(event) => handler(event)}
		data-testid={testId}
	>
		<div style={{ width: "100%", height: "100%" }}>
			{icon}
		</div>
		<Typography align="center" color="secondary.main" fontSize="small" fontWeight="bold" display="flex" alignItems="center" sx={{ textTransform: "capitalize" }}>
			{text}
			{more && <ExpandMore />}
		</Typography>
	</Button>
);

const Header = ({ isAuthenticated }) => {
	const classes = useStyles();
	const { themeMode, onThemeToggle } = useThemeMode();

	const location = useLocation();
	const navigate = useNavigate();
	const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
	const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

	const handleMobileMenuClose = () => setMobileMoreAnchorEl(null);
	const handleMobileMenuOpen = (event) => setMobileMoreAnchorEl(event.currentTarget);

	const CrumpLink = styled(Link)(({ theme }) => ({ display: "flex", color: theme.palette.third.main }));

	const buttons = [
		{
			icon: <AccountCircle className={classes.svgIcon} />,
			text: "Profile",
			handler: () => navigate("/profile"),
			testId: "profile-nav-link"
		},
		    {
        icon: <SettingsIcon className={classes.svgIcon} />,
        text: "Settings",
        handler: () => navigate("/settings"),
        testId: "settings-nav-link"
    	},
		{
			icon: <LogoutIcon className={classes.svgIcon} />,
			text: "Logout",
			handler: () => {
				jwt.destroyToken();
				navigate("/");
			},
		},
	];

	const renderMobileMenu = (
		<Menu
			keepMounted
			anchorEl={mobileMoreAnchorEl}
			anchorOrigin={{ vertical: "top", horizontal: "right" }}
			transformOrigin={{ vertical: "top", horizontal: "right" }}
			open={isMobileMenuOpen}
			onClose={handleMobileMenuClose}
		>
			{buttons.map((button) => (
				<MenuItem key={button.text} onClick={button.handler}>
					{button.text === "Profile" ? (
						<AccountCircle sx={{ width: "20px", height: "20px", mr: "5px" }} />
					) : (
						<Box sx={{ width: "20px", height: "20px", mr: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
							{button.icon}
						</Box>
					)}
					<p style={{ marginLeft: "5px" }}>{button.text}</p>
					{button.more && <ExpandMore />}
				</MenuItem>
			))}
		</Menu>
	);

	const pathnames = location.pathname.split("/").filter(Boolean);

	return (
		<>
			<AppBar id="header" position="static" className={classes.grow}>
				<Toolbar className="header-container">
					<Box component={Link} to="/">
						<Image src={logo} alt="Logo" sx={{ p: 0, my: 0, height: "100%", maxWidth: "200px" }} />
					</Box>
					<Box className={classes.grow} style={{ height: "100%" }} />
					{isAuthenticated && <GlobalSearch />}
					{isAuthenticated && <LanguageSwitcher />}
					<IconButton
						onClick={onThemeToggle}
						data-testid="dark-mode-toggle"
						sx={{ mr: 2 }}
					>
						{themeMode === "light" ? (
							<SunIcon data-testid="theme-indicator-light" sx={{ color: "warning.main" }} />
						) : (
							<MoonIcon data-testid="theme-indicator-dark" sx={{ color: "info.main" }} />
						)}
					</IconButton>
					{isAuthenticated && <NotificationCenter />}
					{isAuthenticated
					&& (
						<>
							<Box sx={{ display: "flex", height: "100%", py: 1 }}>
								{buttons.map((button) => (
									<ButtonWithText
										key={button.text}
										icon={button.icon}
										text={button.text}
										handler={button.handler}
										more={button.more}
										testId={button.testId}
									/>
								))}
							</Box>
							<Box sx={{ display: "none" }}>
								<IconButton color="primary" onClick={handleMobileMenuOpen}><MoreIcon /></IconButton>
							</Box>
						</>
					)}
				</Toolbar>
			</AppBar>
			{isAuthenticated
			&& (
				<Paper elevation={0} className={classes.root} data-testid="breadcrumb-bar">
					<Breadcrumbs
						className="header-container"
						separator={<span data-testid="breadcrumb-separator">›</span>}
					>
						<Link to="/" data-testid="breadcrumb-home" style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}>
							Home
						</Link>
						{pathnames.map((path, ind) => {
							const isLast = ind === pathnames.length - 1;
							const text = capitalize(path);
							const to = `/${pathnames.slice(0, ind + 1).join("/")}`;
							if (isLast) {
								return (
									<span
										key={`crump_${ind}`}
										data-testid="breadcrumb-current"
										style={{ color: 'inherit' }}
									>
										{text}
									</span>
								);
							}
							return (
								<Link key={`crump_${ind}`} to={to} style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}>
									{text}
								</Link>
							);
						})}
					</Breadcrumbs>
				</Paper>
			)}
			{isAuthenticated
			&& (
				<>
					{renderMobileMenu}
				</>
			)}
		</>
	);
};

export default memo(Header);