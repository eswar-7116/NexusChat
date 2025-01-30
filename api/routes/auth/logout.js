import { Router } from 'express';

const router = Router();

router.post('/logout', (req, res) => {
    try {
        res.cookie('jwtToken', '');

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Error while logging out");
        return res.status(500).json({
            success: false,
            message: "Error while logging out "+error,
            error: error
        });
    }
});

export default router;