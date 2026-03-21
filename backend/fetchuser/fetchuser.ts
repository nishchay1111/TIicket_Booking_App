import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { loadData } from '../jsonStore';

const JWT_SECRET = 'ThisEndsRightHere^71364andNow';



// --- 1. Define the shape of your JWT Payload ---
interface JwtPayload {
    user: {
        id: string;
    }
}

// --- 2. Define your User and Organizer interfaces ---
interface User {
    user_id: string;
    user_password: string;
    user_email?: string;
    [key: string]: any;
}

interface Organizer {
    organizer_id: string;
    organizer_password: string;
    admin_verification?: boolean;
    [key: string]: any;
}

// --- 3. Define type for authenticated user attached to request ---
type AuthUser =
    | (Omit<User, 'user_password'> & { id: string })
    | (Omit<Organizer, 'organizer_password'> & { id: string; verified?: boolean });

// --- 4. Extend Express Request ---
export interface CustomRequest extends Request {
    user?: AuthUser;
}

// --- 5. Middleware ---
const fetchuser = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }

    try {
        // 1️⃣ Verify token and cast to JwtPayload
        const data = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // 2️⃣ Load users and organizers from JSON
        const users = loadData<User>('users');
        const organizers = loadData<Organizer>('organizers');

        // 3️⃣ Find the matching user or organizer
        const userRecord = users.find(u => u.user_id?.toString() === data.user.id?.toString());
        const orgRecord = organizers.find(o => o.organizer_id?.toString() === data.user.id?.toString());

        if (!userRecord && !orgRecord) {
            return res.status(401).send({ error: "User no longer exists in records" });
        }

        // 4️⃣ Attach clean user/org data to req.user
        if (userRecord) {
            const { user_password, ...rest } = userRecord;
            req.user = { ...rest, id: userRecord.user_id };
        } else if (orgRecord) {
            const { organizer_password, ...rest } = orgRecord;
            req.user = { ...rest, id: orgRecord.organizer_id, verified: orgRecord.admin_verification };
        }

        // ✅ Proceed to next middleware/route
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" });
    }
};

export default fetchuser;