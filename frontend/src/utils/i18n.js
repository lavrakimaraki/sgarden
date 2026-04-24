import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TRANSLATIONS = {
	en: {
		// Header
		'header.profile': 'Profile',
		'header.logout': 'Logout',
		'header.search': 'Search',
		'header.notifications': 'Notifications',

		// Sidebar
		'sidebar.activity': 'Activity',
		'sidebar.users': 'Users',
		'sidebar.audit': 'Audit',
		'sidebar.import': 'Import',
		'sidebar.salesData': 'Sales Data',
		'sidebar.alerts': 'Alerts',
		'sidebar.reports': 'Reports',
		'sidebar.overview': 'Overview',
		'sidebar.analytics': 'Analytics',
		'sidebar.insights': 'Insights',

		// Dashboards
		'dashboard.overview': 'Overview',
		'dashboard.analytics': 'Analytics',
		'dashboard.insights': 'Insights',
		'dashboard.region': 'Region',
		'dashboard.from': 'From',
		'dashboard.to': 'To',

		// Common
		'common.save': 'Save',
		'common.cancel': 'Cancel',
		'common.delete': 'Delete',
		'common.edit': 'Edit',
		'common.add': 'Add',
		'common.search': 'Search',
		'common.loading': 'Loading...',
		'common.noResults': 'No results found',
	},
	el: {
		// Header
		'header.profile': 'Προφίλ',
		'header.logout': 'Αποσύνδεση',
		'header.search': 'Αναζήτηση',
		'header.notifications': 'Ειδοποιήσεις',

		// Sidebar
		'sidebar.activity': 'Δραστηριότητα',
		'sidebar.users': 'Χρήστες',
		'sidebar.audit': 'Έλεγχος',
		'sidebar.import': 'Εισαγωγή',
		'sidebar.salesData': 'Πωλήσεις',
		'sidebar.alerts': 'Ειδοποιήσεις',
		'sidebar.reports': 'Αναφορές',
		'sidebar.overview': 'Επισκόπηση',
		'sidebar.analytics': 'Αναλυτικά',
		'sidebar.insights': 'Πληροφορίες',

		// Dashboards
		'dashboard.overview': 'Επισκόπηση',
		'dashboard.analytics': 'Αναλυτικά',
		'dashboard.insights': 'Πληροφορίες',
		'dashboard.region': 'Περιοχή',
		'dashboard.from': 'Από',
		'dashboard.to': 'Έως',

		// Common
		'common.save': 'Αποθήκευση',
		'common.cancel': 'Ακύρωση',
		'common.delete': 'Διαγραφή',
		'common.edit': 'Επεξεργασία',
		'common.add': 'Προσθήκη',
		'common.search': 'Αναζήτηση',
		'common.loading': 'Φόρτωση...',
		'common.noResults': 'Δεν βρέθηκαν αποτελέσματα',
	},
};

const STORAGE_KEY = 'app-language';

const I18nContext = createContext({
	language: 'en',
	setLanguage: () => {},
	t: (key) => key,
});

export const I18nProvider = ({ children }) => {
	const [language, setLanguageState] = useState(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored || 'en';
		} catch (e) {
			return 'en';
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, language);
		} catch (e) { /* ignore */ }
	}, [language]);

	const setLanguage = useCallback((lang) => {
		if (TRANSLATIONS[lang]) {
			setLanguageState(lang);
		}
	}, []);

	const t = useCallback((key) => {
		const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
		return dict[key] || TRANSLATIONS.en[key] || key;
	}, [language]);

	return (
		<I18nContext.Provider value={{ language, setLanguage, t }}>
			{children}
		</I18nContext.Provider>
	);
};

export const useI18n = () => useContext(I18nContext);