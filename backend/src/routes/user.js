import express from "express";
import { email, validations } from "../utils/index.js";
import { User, Invitation } from "../models/index.js";

const router = express.Router({ mergeParams: true });

// Middleware: Require authentication
const requireAuth = (req, res, next) => {
  if (!res.locals.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Middleware: Require admin role
const requireAdmin = (req, res, next) => {
  if (!res.locals.user || res.locals.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Middleware: Require owner or admin
const requireOwnerOrAdmin = (req, res, next) => {
  const requestedUserId = req.params.userId || req.params.id || req.body.id;
  const currentUser = res.locals.user;
  
  if (!currentUser) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (currentUser.id !== requestedUserId && currentUser.role !== 'admin') {
    return res.status(403).json({ message: "Access denied" });
  }
  
  next();
};

// GET /decode - Get current user info
router.get("/decode/", requireAuth, (req, res) => {
  const { password, ...safeUser } = res.locals.user;
  return res.json(safeUser);
});

// GET /attempt-auth - Health check
router.get("/attempt-auth/", (req, res) => res.json({ ok: true }));

// GET / - List all users (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    // Don't expose sensitive fields
    const users = await User.find().select('-password');
    return res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
});

// POST / - Invite new user (admin only)
router.post("/",
  requireAdmin,
  (req, res, next) => validations.validate(req, res, next, "invite"),
  async (req, res) => {
    try {
      const { email: userEmail } = req.body;

      const existingUser = await User.findOne({ email: userEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "A user with this email already exists",
        });
      }

      const token = validations.jwtSign({ email: userEmail }, '24h');
      
      // Remove old invitations
      await Invitation.deleteMany({ email: userEmail });
      
      // Create new invitation
      await Invitation.create({
        email: userEmail,
        token,
        createdAt: new Date(),
      });

      await email.inviteUser(userEmail, token);
      
      return res.json({
        success: true,
        message: "Invitation email sent successfully",
      });
    } catch (error) {
      console.error("Error inviting user:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send invitation",
      });
    }
  }
);

// POST /delete - Delete user (admin only)
router.post("/delete", requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID required" });
    }

    // Prevent self-deletion
    if (id === res.locals.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
});

// POST /role - Update user role (admin only)
router.post("/role", requireAdmin, async (req, res) => {
  try {
    const { id, role } = req.body;

    if (!id || !role) {
      return res.status(400).json({ message: "User ID and role required" });
    }

    // Validate role
    const ALLOWED_ROLES = ['user', 'admin', 'moderator'];
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prevent self-demotion from admin
    if (id === res.locals.user.id && role !== 'admin') {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      id, 
      { role, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({ message: "Failed to update role" });
  }
});

// GET /profile/:userId - Get user profile (owner or admin only)
router.get("/profile/:userId", requireOwnerOrAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ 
      success: true, 
      profile: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastActive: user.lastActiveAt,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// POST /settings/update - Update user settings
router.post("/settings/update", requireAuth, async (req, res) => {
  try {
    const userId = res.locals.user.id;
    const userSettings = req.body;

    if (!userSettings || typeof userSettings !== 'object') {
      return res.status(400).json({ message: "Settings object required" });
    }

    const defaultSettings = {
      theme: "light",
      language: "en",
      notifications: true
    };

    // Whitelist allowed settings to prevent prototype pollution
    const ALLOWED_SETTINGS = ['theme', 'language', 'notifications'];
    const finalSettings = { ...defaultSettings };
    
    for (const key of ALLOWED_SETTINGS) {
      if (key in userSettings) {
        finalSettings[key] = userSettings[key];
      }
    }

    // Save to database
    await User.findByIdAndUpdate(userId, { settings: finalSettings });

    return res.json({ 
      success: true, 
      settings: finalSettings,
      userId
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({ message: "Failed to update settings" });
  }
});

// POST /search - Search users (authenticated users only)
router.post("/search", requireAuth, async (req, res) => {
  try {
    const { query, role, limit = 50 } = req.body;

    // Validate inputs
    if (typeof query !== 'string' || query.length < 3) {
      return res.status(400).json({ message: "Query must be at least 3 characters" });
    }

    if (query.length > 100) {
      return res.status(400).json({ message: "Query too long" });
    }

    // Build search criteria
    const searchCriteria = {
      username: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
    };

    // Add role filter if provided
    const ALLOWED_ROLES = ['user', 'admin', 'moderator'];
    if (role && ALLOWED_ROLES.includes(role)) {
      // Only admins can search for admins
      if (role === 'admin' && res.locals.user.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      searchCriteria.role = role;
    }

    const results = await User.find(searchCriteria)
      .select('-password')
      .limit(Math.min(limit, 100))
      .sort({ username: 1 });

    return res.json({ success: true, results });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ message: "Search failed" });
  }
});

export default router;