const { verifyToken ,decode} = require('../jwt');

const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    try {
        const decoded = decode(token);
        
        req.user = decoded;
        next();
    } catch (err) {
        console.log(err);
        return res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = authenticateJWT;
