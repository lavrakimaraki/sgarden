import { jwtDecode } from "jwt-decode";

import cookie from "./cookie.js";

const jwt = {
	getToken: () => cookie.get("_sgarden"),
	setToken: (token) => token && cookie.set("_sgarden", token),
	destroyToken: () => {
		cookie.remove("_sgarden");
	},
	isAuthenticated: () => {
		const token = cookie.get("_sgarden");
		return token && token !== "undefined";
	},
	isAdmin: () => {
		const token = cookie.get("_sgarden");
		if (token) {
			const { role } = jwtDecode(token);
			return role === "admin";
		}
		return false
	},
	decode: () => {
		const token = cookie.get("_sgarden");
		if (token) return jwtDecode(token);
		cookie.remove("_mycookie");
		window.location.href = "/";
		return null;
	},
};

export default jwt;
