export default async function logout(req, res) {
    try {
        // Clear the token in the cookie
        res.clearCookie('jwtToken');

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Error while logging out: "+error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}