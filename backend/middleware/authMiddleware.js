import jwt from 'jsonwebtoken';

import User from '../models/User.js';

export default async function checkAuth(req, res, next) {
    try {
        const token = req.cookies.jwtToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No Token Provided"
            });
        }

        const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
        if (!verifiedUser) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid Token"
            });
        }

        const user = await User.findById(verifiedUser.id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - User not found"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error in checkAuth: '+error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}