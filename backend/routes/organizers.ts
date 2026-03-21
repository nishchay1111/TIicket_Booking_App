import express, { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { loadData, saveData } from '../jsonStore';
import fetchuser, { CustomRequest } from '../fetchuser/fetchuser';

const router: Router = express.Router();
const JWT_SECRET = 'ThisEndsRightHere^71364andNow';

// --- Route 1: Fetch Organizer's Events ---
router.get('/fetchorganizersevents', fetchuser, async (req: CustomRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, error: "Unauthorized" });

        const events = loadData('events');    
        const orgEvents = events.filter((e: any) => 
            e.organizer_id?.toString() === req.user?.id?.toString()
        );

        res.json({ 
            success: true, 
            count: orgEvents.length, 
            orgEvents 
        });
    } catch (error: any) {
        console.error("Fetch Events Error:", error.message);
        res.status(500).json({ success: false, error: 'An error occurred while fetching organizer events' });
    }
});

// --- Route 2: Create Organizer (Sign Up) ---
router.post('/createorganizer', [
    body('name', 'Enter a valid Name').isLength({ min: 3 }),
    body('email', 'Enter a valid E-Mail').isEmail(),
    body('password').isLength({ min: 5 })
], async (req: Request, res: Response) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const { name, email, password } = req.body;
        const organizers = loadData('organizers');
        let organizer = organizers.find((o: any) => o.organizer_email === email);
        
        if (organizer) {
            return res.status(400).json({ success, error: "An Organizer with this E-Mail already exists" });
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
        };

        organizers.push(newOrganizer);
        saveData('organizers', organizers);

        const data = { user: { id: newOrganizer.organizer_id } };
        const authtoken = jwt.sign(data, JWT_SECRET);
        
        success = true;
        res.json({ success, authtoken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

// --- Route 3: Organizer Login ---
router.post('/organizerlogin', [
    body('email', 'Enter a valid E-mail').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req: Request, res: Response) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const organizers = loadData('organizers');

        const organizer = organizers.find((o: any) => o.organizer_email === email);
        if (!organizer) {
            return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
        }

        const passwordCompare = await bcrypt.compare(password, organizer.organizer_password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
        }

        const data = { user: { id: organizer.organizer_id } };
        const authToken = jwt.sign(data, JWT_SECRET);

        success = true;
        res.json({ success, authToken });

    } catch (error: any) {
        console.error("Login Error:", error.message);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// --- Route 4: Create Event (Restricted to Verified Organizers) ---
router.post('/createEvent', fetchuser, [
    body('eventName','Enter a Event Name').isString(),
    body('show_dates', 'Show dates must be an array').isArray({ min: 1 }),
], async (req: CustomRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(401).json({ success: false, errors: errors.array() });

    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        // Check verification (Admin level or verified organizer)
        if (req.user.verified === 0) return res.status(401).json({ error: "Admin Authentication Required" });

        const cities = loadData('city');
        const categories = loadData('category');
        
        const categoryExists = categories.some((c: any) => (typeof c === 'string' ? c : c.name) === req.body.eventCategory);
        const cityExists = cities.some((c: any) => (typeof c === 'string' ? c : c.name) === req.body.eventCity);

        if (!(categoryExists && cityExists)) {
            return res.status(401).json({ success: false, error: "Enter a Valid City or Category" });
        }

        let events = loadData('events');
        if (events.find((e: any) => e.event_name === req.body.eventName)) {
            return res.status(401).json({ error: "Event Name already Taken" });
        }

        const newEvent = {
            event_id:               crypto.randomUUID(),
            event_name:             req.body.eventName,
            event_description:      req.body.eventDescription,
            event_city:             req.body.eventCity,
            event_address:          req.body.eventAddress,
            event_category:         req.body.eventCategory,
            event_gener:            req.body.eventGener,
            image_location:         req.body.imageAddress,
            organizer_id:           req.user.id,
            show_dates:             req.body.show_dates.map((show: any) => ({
                show_id:              crypto.randomUUID(),
                show_date:            show.show_date,
                show_time:            show.show_time,
                show_language:        show.show_language,
                total_tickets:        parseInt(show.totalTickets),
                available_tickets:    parseInt(show.totalTickets),
                ticket_price:         parseFloat(show.price),
                active:               true
            })),
            date_created:           new Date().toISOString()
        };

        events.push(newEvent);
        saveData('events', events);
        res.json({ success: true, data: { newEvent } });

    } catch (error: any) {
        console.error(error.message);
        res.status(500).send('Internal server error');
    }
});

// --- Route 5: Delete Event ---
router.delete('/deleteevent/:id', fetchuser, async (req: CustomRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        let events = loadData('events');
        let event = events.find((e: any) => e.event_id === req.params.id);

        if (!event) return res.status(400).json({ error: 'Event not Found!' });
        if (event.organizer_id !== req.user.id) {
            return res.status(401).json({ error: "Not Allowed! You are not the event organizer" });
        }

        let updatedEvents = events.filter((e: any) => e.event_id !== req.params.id);
        saveData('events', updatedEvents);
        res.json({ success: true, message: "Event has been deleted", event });
    } catch (error: any) {
        console.error(error.message);
        res.status(500).send('Internal server error');
    }
});

// --- Route 6: Cancel a Show ---
router.put('/cancelshow/:id', fetchuser, async (req: CustomRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        const events = loadData('events');
        const event = events.find((e: any) => e.show_dates?.some((show: any) => show.show_id?.toString() === req.params.id));

        if (!event) return res.status(401).json({ error: "Event does not Exist" });
        if (event.organizer_id !== req.user.id) return res.status(401).json({ error: "Not Allowed" });

        const show = event.show_dates.find((s: any) => s.show_id === req.params.id);
        if (!show) return res.status(401).json({ error: "Show does not Exist" });

        show.active = false;
        saveData('events', events);
        res.json({ success: true, message: "Show cancelled successfully", show });
    } catch (error: any) {
        console.error(error.message);
        res.status(500).send('Internal server error');
    }
});

export default router;