const app = require('./index')

const mongoose  = require('mongoose');
const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI);

const db = mongoose.connection

db.on('error',err => console.error(err))
db.once('open',()=>{
    console.log('MongoDb connected ');
})

app.listen(9000,()=>{
console.log('server is connected');
});