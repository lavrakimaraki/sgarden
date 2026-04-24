import { Activity } from "../models/index.js";

const logActivity = async (userId, username, actionType, details = {}, req) => {
	try {
		const ipAddress = req.ip || req.connection.remoteAddress || "";
		const userAgent = req.get("user-agent") || "";

		await Activity.create({
			userId,
			username,
			actionType,
			details,
			ipAddress,
			userAgent,
		});
	} catch (error) {
		console.error("Error logging activity:", error);
	}
};

export default {
	logActivity,
};
