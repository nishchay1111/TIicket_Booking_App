import express, { Request, Response, Router } from 'express';
import { loadData, saveData } from '../jsonStore';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fetchuser, { CustomRequest } from '../fetchuser/fetchuser';
import { json } from 'stream/consumers';

const router: Router = express.Router();

// Professional Practice: Use two different secrets
const JWT_SECRET = 'ThisEndsRightHere^71364andNow'; 
const REFRESH_SECRET = 'AnotherSuperSecretStringForRefreshOnly'; 

// --- Helper: Generate Tokens & Set Cookie ---
const generateAndSendTokens = (res: Response, userId: string, userPayload: any) => {
    // 1. Generate short-lived Access Token (15 min)
    const authtoken = jwt.sign({ user: { id: userId } }, JWT_SECRET, { expiresIn: '15m' });

    // 2. Generate long-lived Refresh Token (7 days)
    const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });

    // 3. Set Refresh Token as an HttpOnly Cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // Critical: Frontend JS cannot read this
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return authtoken;
};

// --- Route 1: Create a User ---
router.post('/createuser', [
    body('name', 'Enter a valid Name').isLength({ min: 1 }),
    body('email', 'Enter a valid E-Mail').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req: Request, res: Response) => {
    let success = false;
    let errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(401).json({success:false,errors: errors.array()})
    try {
        const users = loadData('users');
        const { name, email, password } = req.body;

        let userExists = users.find((u: any) => u.user_email === email);
        if (userExists) return res.status(400).json({ success: false, error: "A user with this E-Mail already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            user_id:        crypto.randomUUID(),
            user_name:      name,
            user_password:  hashedPassword,
            user_email:     email,
            date_created:   new Date().toISOString()
        };

        users.push(newUser);
        saveData('users', users);

        // USE REFRESH STRATEGY HERE
        const authtoken = generateAndSendTokens(res, newUser.user_id, { id: newUser.user_id });
        
        res.json({ success: true, authtoken });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Route 2: Login ---
router.post('/login', [   
    body('email', 'Enter a valid E-Mail').isEmail().exists(),    
    body('password', 'Password cannot be blank').exists().isLength({min: 6})   
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
        const users = loadData('users');
        const userCheck = users.find((u: any) => u.user_email === email);

        if (!userCheck) return res.status(400).json({ success: false, error: "No user found" });

        const passwordCheck = await bcrypt.compare(password, userCheck.user_password);
        if (!passwordCheck) return res.status(400).json({ success: false, error: "Invalid password" });

        // USE REFRESH STRATEGY HERE
        const authtoken = generateAndSendTokens(res, userCheck.user_id, { id: userCheck.user_id });

        res.json({ success: true, authtoken });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// --- NEW ROUTE: Refresh Token ---
router.post('/refresh-token', (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({ success: false, error: 'No refresh token' });

    jwt.verify(refreshToken, REFRESH_SECRET, (err: any, decoded: any) => {
        if (err) return res.status(403).json({ success: false, error: 'Invalid refresh token' });

        // Generate a fresh 15-minute Access Token
        const data = { user: { id: decoded.id } };
        const authtoken = jwt.sign(data, JWT_SECRET, { expiresIn: '15m' });

        res.json({ success: true, authtoken });
    });
});

// --- NEW ROUTE: Logout (Clear the cookie) ---
router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('refreshToken');
    res.json({ success: true, message: "Logged out successfully" });
});

// --- Route 3: Get User Details ---
router.post('/getuser', fetchuser, async (req: CustomRequest, res: Response) => {
    try {
        let success = false;
        let users = loadData('users');

        const user = users.find((u: any) => u.user_id === req.user?.id);

        if (user) {
            success = true;
            const { user_password, ...userWithoutPassword } = user;
            return res.json({ success, user: userWithoutPassword });
        } else {
            return res.status(404).json({ success, error: "User not found" });
        }
    } catch (error: any) {
        console.error("Getuser Error:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

export default router;