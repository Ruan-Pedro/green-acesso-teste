const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


exports.required = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send({ error: "Access Denied" });
    if (authHeader.startsWith("Bearer ")) token = authHeader.substring(7, authHeader.length);

    if (!token) return res.status(401).send({ error: "Acess Denied" });

    try {
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verifiedToken;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).send({ error: "Acess Denied" });
    }
}
exports.optional = (req, res, next) => {

    let authHeader = "";
    if (req.headers.authorization) authHeader = req.headers.authorization;

    if (authHeader.startsWith("Bearer ")) token = authHeader.substring(7, authHeader.length);

    try {
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verifiedToken;
        next();
    } catch (error) {
        next();
    }
}

