import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
    const token = req.cookies["accessToken"] || req.headers["accesstoken"] || req.headers['Authorization'];
    if (!token) {
        return res.status(401).json({ message: "token is not generated" });
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}