const jwt = require('jsonwebtoken');
require('dotenv').config();

const verify_token = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_ACCESS_PRIVATE_KEY, (err, user) => {
            if (err) {
                return res.status(403).json("Token is not valid! You Fucker!");
            }
            next();
        });
    } else {
        res.status(401).json("Asshole! You are not authenticated!");
    }
}

const generateAccessToken = (user) => {
    return jwt.sign({ username: user.username }, process.env.JWT_ACCESS_PRIVATE_KEY, {
        expiresIn: "5m",
    });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ username: user.username }, process.env.JWT_REFRESH_PRIVATE_KEY);
};

module.exports = [verify_token, generateAccessToken, generateRefreshToken];