const jwt = require('jsonwebtoken');
const { loadData } = require('../jsonStore');
const JWT_SECRET = 'ThisEndsRightHere^71364andNow';

const fetchuser = (req, res, next) => {
    // 1. Get the token from the header
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }

    try {
        // 2. Verify the token
        const data = jwt.verify(token, JWT_SECRET);
        
        // 3. Load data to verify the user still exists in the JSON database
        const users = loadData('users');
        const organizers = loadData('organizers');
        
        // Find the record using the ID from the JWT payload
        const userRecord = users.find(u => u.user_id?.toString() === data.user.id?.toString());
        const orgRecord = organizers.find(o => o.organizer_id?.toString() === data.user.id?.toString());

        if (!userRecord && !orgRecord) {
            return res.status(401).send({ error: "User no longer exists in records" });
        }

        // 4. Attach clean data to the request object (Excluding Passwords)
        if (userRecord) {
            const { user_password, ...rest } = userRecord;
            // We normalize the ID to 'id' so your routes can use req.user.id easily
            req.user = { ...rest, id: userRecord.user_id }; 
        } else if (orgRecord) {
            const { organizer_password, ...rest } = orgRecord;
            req.user = { ...rest, id: orgRecord.organizer_id, verified: orgRecord.admin_verification };
        }
        
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" });
    }
}

module.exports = fetchuser;