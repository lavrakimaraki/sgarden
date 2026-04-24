import { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";
import { Button, Grid, Menu, MenuItem, Typography, Divider } from "@mui/material";
import Image from "mui-image";
import { ExpandMore } from "@mui/icons-material";

import Accordion from "./Accordion.js";
import { useBookmarks } from "../hooks/useBookmarks.js";

import { jwt } from "../utils/index.js";

const useStyles = makeStyles((theme) => ({
	sidebar: {
		height: "100%",
		position: "absolute",
		backgroundColor: theme.palette.secondary.main,
		color: "white",
		overflow: "auto",
	},
}));

const ButtonWithText = ({ text, icon, more, handler }) => {
	const getTestId = (buttonText) => {
	const mapping = {
		Activity: "sidebar-activity-link",
		Users: "sidebar-users-link",
		Overview: "sidebar-overview-link",
		Analytics: "sidebar-analytics-link",
		Insights: "sidebar-insights-link",
		Import: "sidebar-import-link",
		};
		return mapping[buttonText] || null;
	};

	return (
		<span key={text}>
			{!more
			&& (
				<Button 
					key={text} 
					data-testid={getTestId(text)}
					sx={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-start", padding: "8px 40px 8px 16px" }} 
					onClick={(event) => handler(event)}
				>
					{icon && (<Image src={icon} alt={text} fit="contain" width="25px" />)}
					<Typography align="center" color="white.main" fontSize="medium" ml={1} display="flex" alignItems="center" sx={{ textTransform: "capitalize" }}>
						{text}
						{more && <ExpandMore />}
					</Typography>
				</Button>
			)}
			{more
			&& (
				<Accordion
					key={text}
					title={(
						<Grid item sx={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-start" }}>
							<Image src={icon} alt={text} fit="contain" width="25px" />
							<Typography align="center" color="white.main" fontSize="medium" ml={1} display="flex" alignItems="center" sx={{ textTransform: "capitalize" }}>
								{text}
							</Typography>
						</Grid>
					)}
					content={(
						<Grid container flexDirection="column" width="100%">
							{more.map((el) => (
								<Button key={el.title} color="white" onClick={el.handler}>
								<Typography sx={{ textTransform: "capitalize" }}>{el.title}</Typography>
							</Button>
						))}
					</Grid>
				)}
				alwaysExpanded={false}
				titleBackground="transparent"
				expandIconColor="white"
			/>
		)}
	</span>
	);
};

const ButtonSimple = ({ text, icon, handler, ind }) => (
	<Button key={text} sx={{ minWidth: "30px!important", padding: "0px", marginTop: (ind === 0) ? "0px" : "10px" }} onClick={(event) => handler(event)}>
		<Image src={icon} alt={text} fit="contain" width="30px" />
	</Button>
);

const Sidebar = ({ isSmall: sidebarIsSmall }) => {
	const [isSmall, setIsSmall] = useState(false);
	const navigate = useNavigate();
	const classes = useStyles();
	const { getBookmarkedDashboards } = useBookmarks();
	const [bookmarkedDashboards, setBookmarkedDashboards] = useState([]);

	const isAdmin = jwt.isAdmin();

	useEffect(() => setIsSmall(sidebarIsSmall), [sidebarIsSmall]);

	useEffect(() => {
		const updateBookmarks = () => {
			setBookmarkedDashboards(getBookmarkedDashboards());
		};

		updateBookmarks();

		// Listen for storage changes
		window.addEventListener('storage', updateBookmarks);
		window.addEventListener('bookmarks-updated', updateBookmarks);

		return () => {
			window.removeEventListener('storage', updateBookmarks);
			window.removeEventListener('bookmarks-updated', updateBookmarks);
		};
	}, [getBookmarkedDashboards]);

	const buttons = [
		...(isAdmin ? [{
			text: "Activity",
			handler: () => {
				navigate("/activity");
			},
		}] : []),
		...(isAdmin ? [{
			text: "Users",
			handler: () => {
				navigate("/users");
			},
		}] : []),
		{
			text: "Import",
			handler: () => {
				navigate("/import");
			},
		},		
		{
			text: "Overview",
			handler: () => {
				navigate("/dashboard");
			},
		},
		{
			text: "Analytics",
			handler: () => {
				navigate("/dashboard1");
			},
		},
		{
			text: "Insights",
			handler: () => {
				navigate("/dashboard2");
			},
		},
	];

	return (
		<div className={classes.sidebar} style={{ width: (isSmall) ? "50px" : "200px", padding: (isSmall) ? "20px 5px" : "20px 5px", textAlign: "center" }}>
			{!isSmall && bookmarkedDashboards.length > 0 && (
				<div data-testid="sidebar-favorites-section" style={{ marginBottom: "20px" }}>
					<Typography variant="caption" color="white.main" sx={{ display: "block", mb: 1, opacity: 0.7, textTransform: "uppercase", fontSize: "0.7rem", fontWeight: "bold" }}>
						Favorites
					</Typography>
					{bookmarkedDashboards.map((dashboard) => (
						<Button
							key={dashboard.path}
							data-testid={`sidebar-favorite-${dashboard.path.replace('/', '')}`}
							sx={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "flex-start", padding: "8px 40px 8px 16px", fontSize: "0.9rem" }}
							onClick={() => navigate(dashboard.path)}
						>
							<Typography color="white.main" fontSize="medium" display="flex" alignItems="center" sx={{ textTransform: "capitalize" }}>
								⭐ {dashboard.title}
							</Typography>
						</Button>
					))}
					<Divider sx={{ my: 1, backgroundColor: "rgba(255, 255, 255, 0.2)" }} />
				</div>
			)}
			{!isSmall && buttons.map((button) => (
				<ButtonWithText
					key={button.text}
					icon={button.icon}
					text={button.text}
					handler={button.handler}
					more={button.more}
				/>
			))}
			{isSmall && buttons.map((button, ind) => (
				<ButtonSimple
					key={button.text}
					icon={button.icon}
					text={button.text}
					handler={button.handler}
					more={button.more}
					ind={ind}
				/>
			))}
		</div>
	);
};

export default Sidebar;
