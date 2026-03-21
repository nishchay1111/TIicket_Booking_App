import express, { Request, Response, Router } from 'express';
import { loadData, saveData } from '../jsonStore';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fetchuser, { CustomRequest } from '../fetchuser/fetchuser';

const router: Router = express.Router();
const JWT_SECRET = 'ThisEndsRightHere^71364andNow';

// --- Route 1: Create a User ---
router.post('/createuser', [
    body('name', 'Enter a valid Name').isLength({ min: 3 }),
    body('email', 'Enter a valid E-Mail').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 })
], async (req: Request, res: Response) => {
    let success = false;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const users = loadData('users');
        const { name, email, password } = req.body;

        let userExists = users.find((u: any) => u.user_email === email);
        if (userExists) {
            return res.status(400).json({ success, error: "A user with this E-Mail already exists" });
        }

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

        const data = {
            user: {
                id: newUser.user_id
            }
        };

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        
        res.json({ success, authtoken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Route 2: Login ---
router.post('/login', [   
    body('email', 'Enter a valid E-Mail').isEmail().exists(),    
    body('password', 'Password cannot be blank').exists()   
], async (req: Request, res: Response) => {

    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const users = loadData('users');
        const userCheck = users.find((u: any) => u.user_email === email);

        if (!userCheck) {
            return res.status(400).json({
                success: false,
                error: "No user found with this E-Mail"
            });
        }

        const passwordCheck = await bcrypt.compare(password, userCheck.user_password);
        if (!passwordCheck) {
            return res.status(400).json({
                success: false,
                error: "Invalid password"
            });
        }

        console.log(`✅ LOGIN SUCCESS: ${userCheck.user_email} (${userCheck.user_id})`);

        const data = {
            user: {
                id: userCheck.user_id
            }
        };

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// --- Route 3: Get User Details ---
// Note: We use CustomRequest here so TS knows req.user exists!
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