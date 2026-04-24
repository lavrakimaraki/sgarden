import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'dashboard-bookmarks';

const DASHBOARD_TITLES = {
	'/dashboard': 'Overview',
	'/dashboard1': 'Analytics',
	'/dashboard2': 'Insights',
};

const readBookmarks = () => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch (e) {
		return [];
	}
};

const writeBookmarks = (bookmarks) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
		// Notify listeners (Sidebar, etc.)
		window.dispatchEvent(new Event('bookmarks-updated'));
	} catch (e) { /* ignore */ }
};

export const useBookmarks = () => {
	const [bookmarks, setBookmarks] = useState(() => readBookmarks());

	// Sync with other tabs/components
	useEffect(() => {
		const handler = () => setBookmarks(readBookmarks());
		window.addEventListener('storage', handler);
		window.addEventListener('bookmarks-updated', handler);
		return () => {
			window.removeEventListener('storage', handler);
			window.removeEventListener('bookmarks-updated', handler);
		};
	}, []);

	const isBookmarked = useCallback((path) => {
		return bookmarks.includes(path);
	}, [bookmarks]);

	const toggleBookmark = useCallback((path) => {
		const current = readBookmarks();
		const updated = current.includes(path)
			? current.filter((p) => p !== path)
			: [...current, path];
		writeBookmarks(updated);
		setBookmarks(updated);
	}, []);

	const getBookmarkedDashboards = useCallback(() => {
		return bookmarks.map((path) => ({
			path,
			title: DASHBOARD_TITLES[path] || path,
		}));
	}, [bookmarks]);

	return {
		bookmarks,
		isBookmarked,
		toggleBookmark,
		getBookmarkedDashboards,
	};
};