const express = require('express');
const router = express.Router();
const fetchuser = require('../fetchuser/fetchuser');
const Booked = require('../models/Booked'); // Import the Booking model
const Events = require('../models/Events')
const { body, validationResult } = require('express-validator');

router.post('/fetchalltickets', fetchuser, async (req, res) => {
    try {
        let success = false
        let userEmail = req.user.email;
        const ticket = await Booked.find({email: userEmail});
        if(ticket){
            success = true;
            res.json({success, ticket})
        }
        else{
            res.json(success)
        }
    }   catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
});

router.get('/fetchallevents', async (req, res) => {
    try {
        // Fetch all events
        const events = await Events.find();

        // Return the fetched events as a JSON response
        res.json(events);
    } catch (error) {
        console.error(error.message);
        // If an error occurs, send a 500 status with an error message
        res.status(500).send("Internal server Error");
    }
});

router.post('/bookticket/:id', fetchuser, [
    body('eventName', 'Enter Name of the Event').notEmpty(),
    body('showTime', 'Enter a valid Show Time').notEmpty(),
    body('showDate', 'Enter a valid Show Date').isDate(),
    body('numberOfTickets', 'Enter a valid number of tickets').isInt({ min: 1 }),
], async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { eventName, showTime, showDate, numberOfTickets } = req.body;

        // Convert showDate to a Date object
        const formattedShowDate = new Date(showDate);

        // Find the event by name
        const event = await Events.findOne({ eventName: req.body.eventName });

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        // Verify the event name matches
        if (event.eventName !== eventName) {
            return res.status(400).json({ error: "Event name does not match" });
        }

        // Check if the provided show date exists in the event
        const dateMatch = event.showTimes.find(
            (showDateObj) => showDateObj.date.toISOString().split('T')[0] === formattedShowDate.toISOString().split('T')[0]
        );

        if (!dateMatch) {
            return res.status(400).json({ error: "Show date not available for this event" });
        }

        // Check if the provided show time exists for the matched date
        const timeMatch = dateMatch.times.find((timeObj) => timeObj.time === showTime);

        if (!timeMatch) {
            return res.status(400).json({ error: "Show time not available for this date" });
        }

        // Check if there are enough available tickets for the selected showtime
        if (timeMatch.availableTickets < numberOfTickets) {
            return res.status(400).json({ error: "Not enough tickets available" });
        }

        // Update the available tickets
        timeMatch.availableTickets -= numberOfTickets;
        await event.save();

        // Create a new booking record
        const newBooking = await Booked.create({
            user: req.user.id,
            event: event._id,
            eventType: event.type,
            eventName,
            showTime, // This is now a string
            showDate: formattedShowDate,
            numberofTickets: numberOfTickets
        });

        res.json({ message: "Ticket booked successfully", booking: newBooking });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }
});


router.put('/updateticket/:id',
    fetchuser,[
        body('numberofTickets').isInt({ min: 1 }).withMessage('Number of tickets must be a positive integer.'
        )],async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { numberofTickets } = req.body;

            // Find the booked ticket
            let ticket = await Booked.findById(req.params.id);
            if (!ticket) {
                return res.status(404).send("Ticket not found");
            }

            // Ensure the user is authorized
            if (ticket.user.toString() !== req.user.id) {
                return res.status(401).send("Not authorized to update this ticket");
            }

            // Ensure that the user retains at least 1 ticket
            if (numberofTickets > ticket.numberofTickets && numberofTickets==ticket.numberofTickets) {
                return res.status(400).send("You must retain more than one ticket.");
            }

            // Find the associated event
            const event = await Events.findById(ticket.event);
            if (!event) {
                return res.status(404).send("Event not found");
            }

            // Find the specific show date and time
            const showDateObj = event.showTimes.find(
                (dateObj) => dateObj.date.toISOString().split('T')[0] === new Date(ticket.showDate).toISOString().split('T')[0]
            );

            if (!showDateObj) {
                return res.status(404).send("Show date not found");
            }

            const showTimeObj = showDateObj.times.find((timeObj) => timeObj.time === ticket.showTime);
            if (!showTimeObj) {
                return res.status(404).send("Show time not found");
            }

            // Update the available tickets
            const ticketsToCancel = ticket.numberofTickets - numberofTickets;
            showTimeObj.availableTickets += ticketsToCancel;

            // Save the updated event
            await event.save();

            // Update the booked ticket
            ticket = await Booked.findByIdAndUpdate(
                req.params.id,
                {$set: { numberofTickets }},
                {new: true}
            );

            res.json({ success: true, ticket });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    }
);



// Route 4: Delete an existing note using : Delete "/api/auth/updatenote". Login required
router.delete('/deleteticket/:id', fetchuser, async (req, res) => {
    try {
        //Find the note to be Deleted and Delete it
        let ticket = await Booked.findById(req.params.id);
        if (!ticket) { return res.status(404).send("Not Found") }

        //Allow User to remove the note if it belongs to him/her
        if (ticket.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        ticket = await Booked.findByIdAndDelete(req.params.id);
        res.json({ "Success": "Data has been deleted", ticket: ticket });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server Error");
    }

})

module.exports = router;