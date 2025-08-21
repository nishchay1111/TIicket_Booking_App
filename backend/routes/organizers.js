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

router.get('/fetchallevents', fetchuser, async (req, res) => {
  try {
    const user = await Events.find({ organizer: req.user.id });
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
})

router.post('/createorganizer', [
  body('name', 'Enter a valid Name').isLength({ min: 3 }),
  body('email', 'Enter a valid E-Mail').isEmail(),
  body('password').isLength({ min: 5 })
], async (req, res) => {
  let success = false;
  // If there are Errors, return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }

  // Check whether the user with this email exists already
  try {
    let organizer = await Organizers.findOne({ email: req.body.email });
    if (organizer) {
      return res.status(400).json({ success, error: "A user with this E-Mail already exists" });
    }

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create the user
    const createdOrganizer = await Organizers.create({
      name: req.body.name,
      password: hashedPassword,
      email: req.body.email
    });

    const data = {
      user: {
        id: createdOrganizer.id
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

router.post('/loginorganizer', [
  body('email', 'Enter a valid E-mail').isEmail(),
  body('password', 'Enter a valid password').isLength({ min: 3 })
], async (req, res) => {
  let success = false;

  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find organizer by email
    const user = await Organizers.findOne({ email });
    if (!user) {
      return res.status(400).json({ success, error: 'Invalid credentials' });
    }

    // Compare password
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ success, error: 'Invalid credentials' });
    }

    // Generate JWT token
    const data = { id: user.id };
    const authToken = jwt.sign(data, JWT_SECRET);

    success = true;
    res.json({ success, authToken });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post(
  '/createevent',
  [
    body('type', 'Enter a valid Type of Event').isIn(['movie', 'concert', 'sports']),
    body('eventName', 'Enter a valid Event Name').notEmpty(),
    body('image', 'Enter a valid image path'),

    body('language', 'Language is required').notEmpty(),
    body('genre', 'Genre is required').notEmpty(),
    body('venue', 'Enter a Valid Venue').notEmpty(),
    body('showTimes', 'Provide valid showTimes').isArray({ min: 1 }),
    body('showTimes.*.date', 'Each showTime must have a valid date in YYYY-MM-DD format').isISO8601(),
    body('showTimes.*.times', 'Each date must have an array of times').isArray({ min: 1 }),
    body('showTimes.*.times.*.time', 'Each time must be a valid string').notEmpty(),
    body('showTimes.*.times.*.totalTickets', 'Each time must have totalTickets as a number greater than 0')
      .isInt({ gt: 0 }),
    body('showTimes.*.times.*.availableTickets', 'Each time must have availableTickets as a number greater than or equal to 0')
      .isInt({ min: 0 }),
    body('city', 'Enter a Valid City Name').isIn(['New York City', 'Boston', 'Washington DC', 'Philadelphia'])
  ], fetchuser,
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { type, eventName, image, language, genre, venue, showTimes, status, city } = req.body;

      const organizer = req.user.id;
      const verified = req.user.verified

      if (verified == 0) {
        return res.status(400).json({ error: 'Admin validation is not given' })
      }

      // Create and save the new event
      const newEvent = new Events({
        type,
        eventName,
        organizer, // Save the organizer ID
        image,
        language,
        genre,
        venue,
        city,
        showTimes,
        status,
      });

      const savedEvent = await newEvent.save();
      res.status(201).json({ message: 'Event created successfully', event: savedEvent });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal server error');
    }
  }
);

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