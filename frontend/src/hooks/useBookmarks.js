import { useState, useEffect } from 'react';

const BOOKMARKS_KEY = 'dashboard_bookmarks';

const dashboards = {
	'/dashboard': 'Overview',
	'/dashboard1': 'Analytics',
	'/dashboard2': 'Insights',
};

export const useBookmarks = () => {
	const [bookmarks, setBookmarks] = useState([]);

	// Initialize bookmarks from localStorage on mount
	useEffect(() => {
		const saved = localStorage.getItem(BOOKMARKS_KEY);
		if (saved) {
			try {
				setBookmarks(JSON.parse(saved));
			} catch (error) {
				console.error('Error parsing bookmarks:', error);
				setBookmarks([]);
			}
		}
	}, []);

	const toggleBookmark = (path) => {
		setBookmarks((prev) => {
			const updated = prev.includes(path)
				? prev.filter((p) => p !== path)
				: [...prev, path];
			localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
			// Dispatch event to notify other components
			window.dispatchEvent(new CustomEvent('bookmarks-updated', { detail: updated }));
			return updated;
		});
	};

	const isBookmarked = (path) => bookmarks.includes(path);

	const getBookmarkedDashboards = () => {
		return bookmarks.map((path) => ({
			path,
			title: dashboards[path],
		})).filter((item) => item.title);
	};

	return {
		bookmarks,
		toggleBookmark,
		isBookmarked,
		getBookmarkedDashboards,
	};
};
