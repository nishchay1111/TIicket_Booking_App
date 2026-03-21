import express, { Request, Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import { loadData, saveData } from '../jsonStore';
import fetchuser, { CustomRequest } from '../fetchuser/fetchuser';

const router: Router = express.Router();

// --- Route 1: Fetch All Tickets for User ---
router.post('/fetchalltickets', fetchuser, async (req: CustomRequest, res: Response) => {
    try {
        let success = false;
        if (!req.user) return res.status(401).json({ success, error: "Unauthorized" });

        let tickets = loadData('tickets');
        
        // Filter tickets for this specific user
        const userTickets = tickets.filter((t: any) => t.user_id === req.user?.id);
        
        if (userTickets.length > 0) {
            success = true;
            return res.json({ success, userTickets });
        } else {
            return res.json({ success: false, message: "No tickets found for this user", userTickets: [] });
        }
    } catch (error: any) {
        console.error("Fetch Tickets Error:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// --- Route 2: Fetch All Events (Public) ---
router.get('/fetchallevents', async (req: Request, res: Response) => {
    try {
        const events = loadData('events');
        res.json(events);
    } catch (error: any) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
});

// --- Route 3: Book a Ticket ---
router.post('/bookticket/:id', fetchuser, [
    body("numberOfTickets", "Enter Number of Tickets you want to Reserve (min 1)").isInt({ min: 1 })
], async (req: CustomRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
        if (!req.user) return res.status(401).json({ success: false, error: "Unauthorized" });

        const { numberOfTickets } = req.body;
        let events = loadData('events');

        // 1. Find the event that contains the matching show_id
        let fetchEvent = events.find((e: any) => 
            e.show_dates.some((s: any) => s.show_id?.toString() === req.params.id?.toString())
        );

        if (!fetchEvent) return res.status(404).json({ success: false, error: "Show does not exist" });

        // 2. Find the SPECIFIC show inside that event
        let selectedShow = fetchEvent.show_dates.find((s: any) => s.show_id?.toString() === req.params.id?.toString());

        // 3. Check Ticket Availability (Using the updated field name from your logic)
        if (numberOfTickets > selectedShow.available_tickets) {
            return res.status(400).json({ success: false, error: "Not Enough Tickets" });
        }

        // 4. Update memory (Subtraction)
        selectedShow.available_tickets -= numberOfTickets;

        // 5. SAVE updated events
        saveData('events', events);

        // 6. Create the Ticket Object
        const newTicket = {
            ticket_id:          crypto.randomUUID(),
            user_id:            req.user.id,
            user_email:         req.user.user_email,
            event_id:           fetchEvent.event_id,
            event_name:         fetchEvent.event_name,
            show_id:            selectedShow.show_id,
            show_date:          selectedShow.show_date,
            event_location:     fetchEvent.event_location,
            image_url:          fetchEvent.image_url,
            number_of_tickets:  numberOfTickets,
            total_price:        (numberOfTickets * selectedShow.ticket_price),
            date_booked:        new Date().toISOString()
        };

        // 7. Save to tickets.json
        const allTickets = loadData('tickets');
        allTickets.push(newTicket);
        saveData('tickets', allTickets);

        res.json({ success: true, message: "Ticket booked successfully", ticket: newTicket });

    } catch (error: any) {
        console.error("Booking Error:", error.message);
        res.status(500).json({ success: false, error: "Internal server Error" });
    }
});

// --- Route 4: Delete Ticket & Restore Seats ---
router.delete('/deleteticket/:id', fetchuser, async (req: CustomRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, error: "Unauthorized" });

        let tickets = loadData('tickets');
        let events = loadData('events');

        // 1. Find the ticket
        let ticket = tickets.find((t: any) => t.ticket_id?.toString() === req.params.id);
        if (!ticket) return res.status(404).json({ error: "Ticket Not Found" });

        // 2. Security Check
        if (ticket.user_id !== req.user.id) {
            return res.status(401).json({ error: "Not Allowed!" });
        }

        // 3. Restore seats to the correct show
        let event = events.find((e: any) => 
            e.show_dates.some((s: any) => s.show_id === ticket.show_id)
        );

        if (event) {
            let show = event.show_dates.find((s: any) => s.show_id === ticket.show_id);
            show.available_tickets += ticket.number_of_tickets;
            saveData('events', events);
        }

        // 4. Delete the ticket
        let updatedTickets = tickets.filter((t: any) => t.ticket_id !== req.params.id);
        saveData('tickets', updatedTickets);

        res.json({ success: true, message: "Ticket deleted and seats restored", ticket });

    } catch (error: any) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
});

export default router;