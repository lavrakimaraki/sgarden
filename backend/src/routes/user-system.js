import express from 'express';
import crypto from 'crypto';
import { promisify } from 'util';
import { validations, email } from '../utils/index.js';
import { User, Reset, Invitation } from '../models/index.js';

const router = express.Router();

// Constants
const BCRYPT_ROUNDS = 12;
const TOKEN_EXPIRY_HOURS = 24;

// Helper: Sanitize output to prevent XSS
const sanitizeOutput = (str) => {
	if (typeof str !== 'string') return str;
	
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g, '&#x2F;');
};

// Helper: Create user (DRY principle)
const createUserHelper = async (username, password, userEmail) => {
	const existingUser = await User.findOne({ 
		$or: [{ username }, { email: userEmail }] 
	});
	
	if (existingUser) {
		return {
			success: false,
			status: 409,
			message: 'Registration Error: A user with that e-mail or username already exists.',
		};
	}

	await new User({
		username,
		password,
		email: userEmail,
	}).save();

	return {
		success: true,
		message: 'User created successfully',
	};
};

// Routes

router.post(
	'/createUser',
	(req, res, next) => validations.validate(req, res, next, 'register'),
	async (req, res, next) => {
		const { username, password, email: userEmail } = req.body;
		try {
			const result = await createUserHelper(username, password, userEmail);
			return res.json(result);
		} catch (error) {
			return next(error);
		}
	}
);

router.post(
	'/createUserInvited',
	(req, res, next) => validations.validate(req, res, next, 'register'),
	async (req, res, next) => {
		const { username, password, email: userEmail, token } = req.body;
		try {
			// Validate invitation token first
			const invitation = await Invitation.findOne({ token });

			if (!invitation) {
				return res.status(400).json({
					success: false,
					message: 'Invalid invitation token',
				});
			}

			// Create user using shared helper
			const result = await createUserHelper(username, password, userEmail);

			// Only delete invitation if user creation was successful
			if (result.success) {
				await Invitation.deleteOne({ token });
			}

			return res.json(result);
		} catch (error) {
			return next(error);
		}
	}
);

router.post(
	'/authenticate',
	(req, res, next) => validations.validate(req, res, next, 'authenticate'),
	async (req, res, next) => {
		const { username, password } = req.body;
		try {
			const user = await User.findOne({ username }).select('+password');
			
			if (!user) {
				// Use generic message to prevent user enumeration
				return res.status(401).json({
					success: false,
					message: 'Authentication failed. Invalid credentials.',
				});
			}

			if (!user.comparePassword(password, user.password)) {
				// Use same generic message
				return res.status(401).json({
					success: false,
					message: 'Authentication failed. Invalid credentials.',
				});
			}

			// Sanitize user data before sending
			return res.json({
				success: true,
				user: {
					username: sanitizeOutput(user.username),
					id: user._id,
					email: sanitizeOutput(user.email),
					role: user.role,
				},
				token: validations.jwtSign({ 
					username: user.username, 
					id: user._id, 
					email: user.email, 
					role: user.role 
				}),
			});
		} catch (error) {
			return next(error);
		}
	}
);

router.post(
	'/forgotpassword',
	(req, res, next) => validations.validate(req, res, next, 'request'),
	async (req, res, next) => {
		try {
			const { username } = req.body;

			const user = await User.findOne({ username }).select('+password');
			
			if (!user) {
				// Return success even if user not found (prevent enumeration)
				return res.json({
					success: true,
					message: 'If that user exists, a password reset email has been sent.',
				});
			}

			if (!user?.password) {
				// Same generic message
				return res.json({
					success: true,
					message: 'If that user exists, a password reset email has been sent.',
				});
			}

			const token = validations.jwtSign({ username });
			await Reset.findOneAndDelete({ username });
			await new Reset({
				username,
				token,
			}).save();

			await email.forgotPassword(user.email, token);
			
			return res.json({
				success: true,
				message: 'If that user exists, a password reset email has been sent.',
			});
		} catch (error) {
			return next(error);
		}
	}
);

router.post('/resetpassword', async (req, res, next) => {
	const { token, password } = req.body;

	try {
		if (!token || !password) {
			return res.status(400).json({
				success: false,
				message: 'Token and password are required',
			});
		}

		const reset = await Reset.findOne({ token });

		if (!reset) {
			return res.status(400).json({
				success: false,
				message: 'Invalid or expired token',
			});
		}

		const now = new Date();

		if (reset.expireAt < now) {
			await Reset.deleteOne({ _id: reset._id });
			return res.status(400).json({
				success: false,
				message: 'Invalid or expired token',
			});
		}

		const user = await User.findOne({ username: reset.username });
		
		if (!user) {
			return res.status(400).json({
				success: false,
				message: 'Invalid or expired token',
			});
		}

		user.password = password;
		await user.save();
		await Reset.deleteOne({ _id: reset._id });

		return res.json({
			success: true,
			message: 'Password updated successfully',
		});
	} catch (error) {
		return next(error);
	}
});

// ⚠️ REMOVED DANGEROUS ENDPOINTS
// The following endpoints are EXTREMELY DANGEROUS and should NEVER be in production:
// - /system/execute (Remote Code Execution)
// - /system/spawn (Remote Code Execution)
// - /compress-files (Command Injection)

// If you absolutely need system command execution (which you shouldn't),
// implement it with:
// 1. Strong authentication and authorization
// 2. Command whitelisting (not user input)
// 3. Proper input validation and escaping
// 4. Audit logging
// 5. Rate limiting

// 🔒 SECURE ALTERNATIVE: Hash password using bcrypt
router.post('/hash-password', async (req, res, next) => {
	try {
		const { password } = req.body;

		if (!password || typeof password !== 'string') {
			return res.status(400).json({ 
				success: false,
				message: 'Password is required' 
			});
		}

		if (password.length < 8) {
			return res.status(400).json({ 
				success: false,
				message: 'Password must be at least 8 characters' 
			});
		}

		// Use bcrypt instead of MD5
		const bcrypt = await import('bcryptjs');
		const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

		return res.json({ 
			success: true, 
			hash 
		});
	} catch (error) {
		return next(error);
	}
});

// 🔒 SECURE ALTERNATIVE: Encrypt data using AES-256-GCM
router.post('/encrypt-data', async (req, res, next) => {
	try {
		const { data, password } = req.body;

		if (!data || !password) {
			return res.status(400).json({ 
				success: false,
				message: 'Data and password required' 
			});
		}

		if (typeof data !== 'string' || typeof password !== 'string') {
			return res.status(400).json({ 
				success: false,
				message: 'Data and password must be strings' 
			});
		}

		// Derive key from password using PBKDF2
		const salt = crypto.randomBytes(16);
		const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');

		// Use AES-256-GCM (authenticated encryption)
		const iv = crypto.randomBytes(12);
		const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
		
		let encrypted = cipher.update(data, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		
		const authTag = cipher.getAuthTag();

		// Return all components needed for decryption
		return res.json({ 
			success: true, 
			encrypted,
			salt: salt.toString('hex'),
			iv: iv.toString('hex'),
			authTag: authTag.toString('hex'),
			algorithm: 'aes-256-gcm'
		});
	} catch (error) {
		return next(error);
	}
});

// 🔒 SECURE ALTERNATIVE: Decrypt data using AES-256-GCM
router.post('/decrypt-data', async (req, res, next) => {
	try {
		const { encrypted, password, salt, iv, authTag } = req.body;

		if (!encrypted || !password || !salt || !iv || !authTag) {
			return res.status(400).json({ 
				success: false,
				message: 'All encryption parameters required' 
			});
		}

		// Derive same key from password
		const saltBuffer = Buffer.from(salt, 'hex');
		const key = crypto.pbkdf2Sync(password, saltBuffer, 100000, 32, 'sha256');

		const decipher = crypto.createDecipheriv(
			'aes-256-gcm', 
			key, 
			Buffer.from(iv, 'hex')
		);
		
		decipher.setAuthTag(Buffer.from(authTag, 'hex'));

		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');

		return res.json({ 
			success: true, 
			decrypted 
		});
	} catch (error) {
		// Don't expose decryption errors (could leak info)
		return res.status(400).json({ 
			success: false,
			message: 'Decryption failed. Invalid password or corrupted data.' 
		});
	}
});

export default router;
