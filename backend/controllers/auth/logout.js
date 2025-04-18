export default async function logout(req, res) {
    try {
        // Clear the JWT token cookie
        res.clearCookie("jwtToken", {
            httpOnly: true,  // Prevents XSS attacks
            secure: true,
            sameSite: 'Strict'  // Prevents CSRF
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Error while logging out:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}
