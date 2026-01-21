const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../fetchuser/fetchuser');
const JWT_SECRET = 'ThisEndsRightHere^71364andNow'
const fs = require('fs');
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
      admin_verification:   0,
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

router.post('/createEvent',fetchuser,[
  body('eventName','Enter a Event Name').isString({min: 1}),
  body('eventCategory','Enter a Valid event category'),
  body('eventGener','Enter a valid Gener'),
  body('eventDescription','This event needs to be Described'),
  body('eventCity', 'Enter a valid City'),
  body('eventAddress','Enter a Valid address'),
  body('imageAddress','Enter a valid image location'),
  body('show_dates', 'Show dates must be an array').isArray({ min: 1 }),
  body('show_dates.*.show_language','Enter the language').isString(),
  body('show_dates.*.show_date', 'Enter a valid date (YYYY-MM-DD)').isDate().custom((value) => {
    const today = new Date().toISOString().split('T')[0];    
    if (value < today) {
      throw new Error('Show date cannot be in the past');
    }
    return true;
  }),
  body('show_dates.*.show_time', 'Enter a valid time (HH:mm)')
        .matches(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/),
  body('show_dates.*.totalTickets', 'Total seats must be at least 1').isInt({ min: 1 }),
  body('show_dates.*.price', 'Price must be 0 or greater').isFloat({ min: 0 }),
], async(req,res)=>{
  const errors = validationResult(req)
  let success = false
  if(!errors.isEmpty())return res.status(401).json({success, errors: errors.array()});  
  try {
    if(req.user.verified === 0) return res.status(401).json({error: "Admin Authentication Required"});
    const cities = loadData('city');
    const categories = loadData('category');
    const categoryExists = categories.some(c => (typeof c === 'string' ? c : c.name) === req.body.eventCategory);
    const cityExists = cities.some(c => (typeof c === 'string' ? c : c.name) === req.body.eventCity);
    if(!(categoryExists && cityExists)) return res.status(401).json({success,error:"Enter a Valid City or Category"})
    let events = loadData('events')
    let nameCheck = events.find(e=>e.event_name === req.body.eventName)
    if(nameCheck) return res.status(401).json({error: "Event Name already Taken"});
    let newEvent = {
      event_id:               crypto.randomUUID(),
      event_name:             req.body.eventName,
      event_description:      req.body.eventDescription,
      event_city:             req.body.eventCity,
      event_address:          req.body.eventAddress,
      event_category:         req.body.eventCategory,
      event_gener:            req.body.eventGener,
      image_location:         req.body.imageAddress,
      organizer_id:           req.user.id,
      show_dates:             req.body.show_dates.map(show => ({
        show_id:              crypto.randomUUID(),
        show_date:            show.show_date,     // Use 'show', not 'req.body.show_dates'
        show_time:            show.show_time,     // Use 'show'
        show_language:        show.show_language,
        total_tickets:        parseInt(show.totalTickets),
        available_tickets:    parseInt(show.totalTickets),
        ticket_price:         parseFloat(show.price)
      })),
      date_created:           new Date().toISOString()
    };
    events.push(newEvent)
    saveData('events',events)
    const data = {
      newEvent      
    }
    success = true
    res.json({success,data})
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal server error');
  }
}
)

router.delete('/deleteevent/:id', fetchuser, async (req, res) => {
  try {
    let success = false
    let events = loadData('events')
    let event = events.find(e=>e.event_id == req.params.id)
    if (!event) {
      return res.status(400).json({ error: 'Event not Found!' })
    }
    if(!(event.organizer_id == req.user.id)){
      return res.status(401).json({error: "Not Allowed! You are not the event organizer"})
    }
    let updatedEvents = events.filter(e=>e.event_id !== req.params.id)
    saveData('events',updatedEvents)
    success = true
    res.json({ success, message: "Event has been deleted", event: event });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal server error');
  }
});

//router.put('/cancelshow/:id',fetchuser, asy)

module.exports = router;