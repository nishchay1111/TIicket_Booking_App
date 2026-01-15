const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../fetchuser/fetchuser');
const JWT_SECRET = 'ThisEndsRightHere^71364andNow'
const Admin = require('../models/Admin');
const Organizers = require('../models/Organizers');
const fs = require('fs');
const Events = require('../models/Events');
const {loadData, saveData} = require('../jsonStore')
const crypto = require('crypto');

router.get('/fetchorganizersevents', fetchuser, async (req, res) => {
  try {
    const events = loadData('events');    
    
    const orgEvents = events.filter(e => 
        e.organizer_id?.toString() === req.user.id?.toString()
    );
    res.json({ 
        success: true, 
        count: orgEvents.length, 
        orgEvents 
    });
  } catch (error) {
    console.error("Fetch Events Error:", error.message);
    res.status(500).json({ 
        success: false, 
        error: 'An error occurred while fetching organizer events' 
    });
  }
});

router.post('/createorganizer', [
  body('name', 'Enter a valid Name').isLength({ min: 3 }),
  body('email', 'Enter a valid E-Mail').isEmail(),
  body('password').isLength({ min: 5 })
], async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  try {
    const {name,email,password} = req.body
    const organizers = loadData('organizers')
    let organizer = organizers.find(o=>o.organizer_email === email)
    if (organizer) {
      return res.status(400).json({ success, error: "A Organizer with this E-Mail already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newOrganizer = {
      organizer_id:         crypto.randomUUID(),
      organizer_email:      email,
      organizer_name:       name,
      organizer_password:   hashedPassword,
      date_created:         new Date().toISOString()
    }
    organizers.push(newOrganizer)
    saveData('organizers',organizers);

    const data = {
      user: {
        id: newOrganizer.organizer_id
      }
    }

    success = true;
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({ success, authtoken })

    //res.json({ success: "The data was successfully uploaded", user: createdOrganizer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

router.post('/organizerlogin', [
  body('email', 'Enter a valid E-mail').isEmail(),
  body('password', 'Password cannot be blank').exists()
], async (req, res) => {
  let success = false;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const organizers = loadData('organizers');

    // 1. Find organizer by email
    const organizer = organizers.find(o => o.organizer_email === email);
    if (!organizer) {
      return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
    }

    // 2. Compare password (FIXED key name to organizer_password)
    const passwordCompare = await bcrypt.compare(password, organizer.organizer_password);
    if (!passwordCompare) {
      return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
    }

    // 3. Generate JWT token (FIXED structure to match fetchuser)
    const data = {
      user: {
        id: organizer.organizer_id
      }
    };
    
    const authToken = jwt.sign(data, JWT_SECRET);

    success = true;
    res.json({ success, authToken });

  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/createEvent',[
  body('eventName','Enter a Event Name')
])

router.delete('/deleteevent/:id', fetchuser, async (req, res) => {
  try {
    let event = await Events.findById(req.params.id);
    if (!event) {
      return res.status(400).json({ error: 'Event not Found!' })
    }
    if (req.params.id !== req.user.id) {
      return res.status(400).json({ error: 'Not Allowed!' })
    }

    event = await Events.findByIdAndDelete(req.params.id);
    res.json({ "Success": "Data has been deleted", event: event });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;