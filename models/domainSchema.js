const mongoose = require('mongoose')

const dSchema = new mongoose.Schema({
    userId : {
        type:mongoose.Types.ObjectId,
        required:true
    },
    hostedZoneId:{
        type:String,
        required:true
    },
    domain:{
        type:String,
        required:true
    },
    accessKey:{
        type:String,
        required:true
    },
    secretKey:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('domains',dSchema)