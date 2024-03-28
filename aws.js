const AWS = require('aws-sdk');

function AWSCONFIG(accessKeyId, secretAccessKey) {
    
    try{

         AWS.config.update({
        accessKeyId:accessKeyId,
        secretAccessKey:secretAccessKey
    })
        
        return  AWS
    }catch(err){
        console.log(err);
    }
}

module.exports = AWSCONFIG;
