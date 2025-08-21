const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../fetchuser/fetchuser');

const JWT_SECRET = 'ThisEndsRightHere^71364andNow'

// Route 1: Create a User using: POST "/api/auth/". Does not require Auth

router.post('/createuser', [
    body('name', 'Enter a valid Name').isLength({ min: 3 }),
    body('email', 'Enter a valid E-Mail').isEmail(),
    body('password').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    // If there are Errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({success,errors: errors.array()});
    }

    // Check whether the user with this email exists already
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "A user with this E-Mail already exists" });
        }

        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create the user
        const createdUser = await User.create({
            name: req.body.name,
            password: hashedPassword,
            email: req.body.email
        });

        const data = {
            user:{
                id: createdUser.id
            }
        }

        success = true;
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({success,authtoken})

        // res.json({ success: "The data was successfully uploaded", user: createdUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// Route 2: Authenticate a User using : POST "/api/auth/createuser". No Login Required

router.post('/login', [   
    body('email', 'Enter a valid E-Mail').isEmail().exists(),    
    body('password', 'password cannot be blank').exists()   
], async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            success=false;
            return res.status(400).json({ error: "No user found with this E-Mail" });
        }
    
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success=false;
            return res.status(400).json({ success,error: "Invalid password" });
        }
        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({success, authtoken})    
        // Rest of your authentication code...
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
    
})

//Route 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req,res)=>{
    try{
        let success = false
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        if(user){
            success = true;
            res.json({success, user})
        }
        else{
            res.json(success)
        }
    } catch(error){
        console.error(error.message);
        res.status(401).json({Error:error.array()})
    }
}
)

module.exports = router;
