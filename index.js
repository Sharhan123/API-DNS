const express = require('express')
const app = express()
const path = require('path')
const morgan = require('morgan');
const session = require('express-session');
const userRoute = require('./routers/userRouter')
const cors =require('cors')

require('dotenv').config();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const allowedOrigins = [process.env.UI];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); 
    } else {
      callback(new Error('Not allowed by CORS')); 
    }
  }
}));
  

app.use('/api/user',userRoute)
app.get('/',(req,res)=>{
    res.send('welcome')
})
module.exports = app;