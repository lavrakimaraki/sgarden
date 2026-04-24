import express from "express";
import { Activity, User } from "../models/index.js";

const router = express.Router();

// Get paginated activity log (admin only)
router.get("/activity", async (req, res) => {
	try {
		// Check if user is admin
		if (!req.user || req.user.role !== "admin") {
			return res.status(403).json({ message: "Access denied" });
		}

		const { page = 1, limit = 20, userId, actionType, dateFrom, dateTo } = req.query;
		const pageNum = Math.max(1, parseInt(page) || 1);
		const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
		const skip = (pageNum - 1) * limitNum;

		// Build filter object
		const filter = {};

		if (userId) {
			filter.userId = userId;
		}

		if (actionType) {
			filter.actionType = actionType;
		}

		// Handle date range filtering
		if (dateFrom || dateTo) {
			filter.createdAt = {};

			if (dateFrom) {
				const from = new Date(dateFrom);
				from.setHours(0, 0, 0, 0);
				filter.createdAt.$gte = from;
			}

			if (dateTo) {
				const to = new Date(dateTo);
				to.setHours(23, 59, 59, 999);
				filter.createdAt.$lte = to;
			}
		}

		// Get total count
		const total = await Activity.countDocuments(filter);

		// Get paginated activities
		const activities = await Activity.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limitNum)
			.lean();

		// Get list of users for filter dropdown
		const users = await User.find({}, "username _id").lean();

		res.json({
			success: true,
			data: activities,
			pagination: {
				total,
				page: pageNum,
				limit: limitNum,
				pages: Math.ceil(total / limitNum),
			},
			users,
		});
	} catch (error) {
		console.error("Error fetching activities:", error);
		res.status(500).json({ message: "Failed to fetch activities" });
	}
});

// Log activity endpoint (for frontend to call)
router.post("/activity/log", async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const { actionType, details } = req.body;

		const activity = new Activity({
			userId: req.user.id,
			username: req.user.username,
			actionType,
			details,
			ipAddress: req.ip,
			userAgent: req.headers["user-agent"],
		});

		await activity.save();

		res.json({
			success: true,
			message: "Activity logged successfully",
		});
	} catch (error) {
		console.error("Error logging activity:", error);
		res.status(500).json({ message: "Failed to log activity" });
	}
});

export default router;
