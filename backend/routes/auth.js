const express = require('express');
const {loadData, saveData} = require('../jsonStore')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../fetchuser/fetchuser');
const crypto = require('crypto');


const JWT_SECRET = 'ThisEndsRightHere^71364andNow'

// Route 1: Create a User using: POST "/api/auth/". Does not require Auth

router.post('/createuser', [
    body('name', 'Enter a valid Name').isLength({ min: 3 }),
    body('email', 'Enter a valid E-Mail').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    
    // 1. Validate Input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const users = loadData('users');
        const { name, email, password } = req.body;

        // 2. Check if user already exists by EMAIL (not ID)
        let userExists = users.find(u => u.user_email === email);
        if (userExists) {
            return res.status(400).json({ success, error: "A user with this E-Mail already exists" });
        }

        // 3. Secure the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Create the User Object
        const newUser = {
            user_id:        crypto.randomUUID(),
            user_name:      name,
            user_password:  hashedPassword,
            user_email:     email,
            date_created:   new Date().toISOString()
        };

        // 5. Add to Array and SAVE to JSON file
        users.push(newUser);
        saveData('users', users);

        // 6. Generate JWT Token
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

// Route 2: Authenticate a User using : POST "/api/auth/createuser". No Login Required

router.post('/login', [   
    body('email', 'Enter a valid E-Mail').isEmail().exists(),    
    body('password', 'Password cannot be blank').exists()   
], async (req, res) => {

    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const users = loadData('users');

        const userCheck = users.find(u => u.user_email === email);

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

        // ✅ FIXED LOG LINE
        console.log(`✅ LOGIN SUCCESS: ${userCheck.user_email} (${userCheck.user_id}) at ${new Date().toISOString()}`);

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


//Route 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        let success = false;
        let users = loadData('users');

        // find user by the id attached to the request by the fetchuser middleware
        const user = users.find(u => u.user_id === req.user.id);

        if (user) {
            success = true;
            // Exclude the password from the response for security
            const { user_password, ...userWithoutPassword } = user;
            return res.json({ success, user: userWithoutPassword });
        } else {
            return res.status(404).json({ success, error: "User not found" });
        }
    } catch (error) {
        console.error("Getuser Error:", error.message);
        // Fix: Use error.message, not error.array()
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

module.exports = router;
