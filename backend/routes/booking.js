const express = require('express');
const router = express.Router();
const fetchuser = require('../fetchuser/fetchuser'); // Ensure this path is correct!
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { loadData, saveData } = require('../jsonStore'); // This is your new "Database"
router.post('/fetchalltickets', fetchuser, async (req, res) => {
    try {
        let success = false;
        // 1. Load the tickets data
        let tickets = loadData('tickets');
        
        // 2. Filter tickets for this specific user
        const userTickets = tickets.filter(t => t.user_id === req.user.id);
        
        // 3. Check if the array has any items
        if (userTickets.length > 0) {
            success = true;
            return res.json({ success, userTickets });
        } else {
            // Send a clear message if no tickets exist
            return res.json({ success: false, message: "No tickets found for this user", userTickets: [] });
        }
    } catch (error) {
        console.error("Fetch Tickets Error:", error.message);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

router.get('/fetchallevents', async (req, res) => {
    try {
        // Fetch all events
        const events = loadData('events')
        // Return the fetched events as a JSON response
        res.json(events);
    } catch (error) {
        console.error(error.message);
        // If an error occurs, send a 500 status with an error message
        res.status(500).send("Internal server Error");
    }
});

router.post('/bookticket/:id', fetchuser, [
    body("numberOfTickets", "Enter Number of Tickets you want to Reserve (min 1)").isInt({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
        const { numberOfTickets } = req.body;
        let events = loadData('events');

        // 1. Find the event that contains the matching show_id
        let fetchEvent = events.find(e => 
            e.show_dates.some(s => s.show_id?.toString() === req.params.id?.toString())
        );

        if (!fetchEvent) return res.status(404).json({ success: false, error: "Show does not exist" });

        // 2. Find the SPECIFIC show inside that event
        let selectedShow = fetchEvent.show_dates.find(s => s.show_id?.toString() === req.params.id?.toString());

        // 3. Check Ticket Availability
        if (numberOfTickets > selectedShow.availableSeats) {
            return res.status(400).json({ success: false, error: "Not Enough Tickets" });
        }

        // 4. Update memory (Subtraction)
        selectedShow.availableSeats -= numberOfTickets;

        // 5. SAVE the entire updated events array
        saveData('events', events);

        // 6. Create the Ticket Object for tickets.json
        const newTicket = {
            ticket_id:          crypto.randomUUID(),
            user_id:            req.user.id,
            event_id:           fetchEvent.event_id,
            event_name:         fetchEvent.event_name,
            show_id:            selectedShow.show_id,
            show_date:          selectedShow.show_date,
            event_location:     fetchEvent.event_location,
            image_url:          fetchEvent.image_url,
            number_of_tickets:  numberOfTickets,
            total_price:        (numberOfTickets * selectedShow.price),
            date_booked:        new Date().toISOString()
        };

        // 7. Save to tickets.json
        const allTickets = loadData('tickets');
        allTickets.push(newTicket);
        saveData('tickets', allTickets);

        res.json({ success: true, message: "Ticket booked successfully", ticket: newTicket });

    } catch (error) {
        console.error("Booking Error:", error.message);
        res.status(500).json({ success: false, error: "Internal server Error" });
    }
});


// Route 4: Delete an existing note using : Delete "/api/auth/updatenote". Login required
router.delete('/deleteticket/:id', fetchuser, async (req, res) => {
    try {
        let tickets = loadData('tickets');
        let events = loadData('events');

        // 1. Find the ticket to be deleted
        let ticket = tickets.find(t => t.ticket_id?.toString() === req.params.id);
        if (!ticket) return res.status(404).json({ error: "Ticket Not Found" });

        // 2. Security: Ensure the user owns this ticket
        if (ticket.user_id !== req.user.id) {
            return res.status(401).json({ error: "Not Allowed!" });
        }

        // 3. Find the Event and Show to restore seats
        // We use ticket.show_id because req.params.id is the TICKET ID
        let event = events.find(e => 
            e.show_dates.some(s => s.show_id === ticket.show_id)
        );

        if (event) {
            let show = event.show_dates.find(s => s.show_id === ticket.show_id);
            // Restore the seats: Add the number of tickets back to availableSeats
            show.availableSeats += ticket.number_of_tickets;
            
            // Save the updated events array
            saveData('events', events);
        }

        // 4. Delete the ticket from the list
        let updatedTickets = tickets.filter(t => t.ticket_id !== req.params.id);
        saveData('tickets', updatedTickets);

        res.json({ success: true, message: "Ticket deleted and seats restored", ticket });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
});

module.exports = router;