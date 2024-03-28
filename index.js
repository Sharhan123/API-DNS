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
app.use(cors())

app.use('/api/user',userRoute)
app.use('/',(req,res)=>{
    res.json({messge:'Hello'})
})
module.exports = app;