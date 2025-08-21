const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../fetchuser/fetchuser');
const Organizers = require('../models/Organizers')

const JWT_SECRET = 'ThisEndsRightHere^71364andNow'
const Admin = require('../models/Admin');

router.post('/adminlogin', [
    body('email', 'Enter a valid E-Mail').isEmail(),
    body('password', 'password cannot be blank').exists()
], async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await Admin.findOne({ email });
        if (!user) {
            success = false;
            return res.status(400).json({ error: "No user found with this E-Mail" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: "Invalid password" });
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken })
        // Rest of your authentication code...
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }

})

router.get('/fetchallorganizers', fetchuser, async (req, res) => {
    try {
        // Fetch the logged-in user's ID from the fetchuser middleware
        const user = req.user;

        // Check if the logged-in user is an admin
        const admin = await Admin.findById(user.id);
        if (!admin) {
            return res.status(403).json({ error: 'Access denied. Only admins can perform this action.' });
        }

        // Fetch all organizers from the database
        const organizers = await Organizers.find();

        // Respond with the list of organizers
        res.json({ success: true, organizers });
    } catch (error) {
        console.error('Error fetching organizers:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/validateorganizers/:id', fetchuser, body('validate', 'Enter a Binary value').isBoolean(),
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json(errors.array())
        }
        try {
            // Fetch the logged-in user's ID from the fetchuser middleware
            const user = req.user;

            // Check if the logged-in user is an admin
            const admin = await Admin.findById(user.id);
            if (!admin) {
                return res.status(403).json({ error: 'Access denied. Only admins can perform this action.' });
            }

            let organizer = await Organizers.findById(req.params.id);
            if (!organizer) {
                return res.status(400).send('Organizer does not exist');
            }
            if(req.body){
                newOrg={}
                newOrg.validate = req.body
                organizer = await Organizers.findByIdAndUpdate(req.params.id, {$set: newOrg}, {new:true});
                res.json({organizer});
            }
            else{
                res.send('Nothing Changed')
            }
        } catch (error) {
            console.error('Error fetching organizers:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
)

router.delete('/deleteorganizer/:id',fetchuser,async(req,res)=>{
    try {
        // Fetch the logged-in user's ID from the fetchuser middleware
        const user = req.user;

        // Check if the logged-in user is an admin
        const admin = await Admin.findById(user.id);
        if (!admin) {
            return res.status(403).json({ error: 'Access denied. Only admins can perform this action.' });
        }

        let organizer = await Organizers.findById(req.params.id);
        if (!organizer) {
            return res.status(400).send('Organizer does not exist');
        }
        organizer = await Organizers.findByIdAndDelete(req.params.id);        
    } catch (error) {
        console.error('Error fetching organizers:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = router;