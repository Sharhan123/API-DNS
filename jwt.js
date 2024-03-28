const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
};

const verifyToken = (token) => {
    try {
       
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error('Error verifying token:', err);
        throw err;
    }
};



const decode = (token)=>{
    try{
        
        return jwt.decode(token)
    }catch(err){
console.log(err);

    }
}

module.exports = { generateToken, verifyToken ,decode};
