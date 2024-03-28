const AWS = require('../aws')
const userData = require('../models/userSchema')
const bcrypt = require('bcrypt')
const domainData = require('../models/domainSchema')
const { generateToken, verifyToken } = require('../jwt')
const domainSchema = require('../models/domainSchema')
const { response } = require('express')



module.exports = {

    userRegister: async (req, res) => {
        try {
            const { fName, lName, email, pass, cpass } = req.body
            console.log(req.body);
            const uData = await userData.findOne({ email: email })
            if (!uData) {

                if (pass === cpass) {

                    const hashedPassword = await bcrypt.hash(pass, 10);



                    const data = new userData({
                        firstname: fName,
                        lastname: lName,
                        email: email,
                        password: hashedPassword
                    })

                    const resData = await data.save()
                    console.log(resData);
                    const payload = {
                        fname: resData.firstname,
                        lname: resData.lastname,
                        email: resData.email,
                        id: resData.id
                    }
                    const token = generateToken(payload)
                    res.status(200).json({ message: 'success', token })

                } else {
                    return res.status(403).json({ message: 'Provided Password and Confirm password do not match ' })
                }

            } else {
                return res.status(403).json({ message: 'Email address is already registered' })

            }


        } catch (err) {
            console.log(err);
        }
    },


    userSignin: async (req, res) => {
        try {
            const { email, pass } = req.body
            const user = await userData.findOne({ email: email })

            if (user) {
                const match = await bcrypt.compare(pass, user.password)

                if (match) {
                    const payload = {
                        fname: user.firstname,
                        lname: user.lastname,
                        email: user.email,
                        id: user.id
                    }
                    const token = generateToken(payload)

                    return res.status(200).json({ message: 'success', token })
                } else {
                    return res.status(403).json({ message: 'Provided password is incorrect' })
                }
            } else {
                return res.status(403).json({ message: 'Email address does not exist' })
            }

        } catch (err) {
            return res.status(500).json({ message: 'Internal server error' })
        }
    }
    ,
    addDomain: async (req, res) => {
        try {

            const { domain, access, secret, id } = req.body
            
            const exist = await domainData.findOne({ domain: domain, userId: id });
            if (exist) {
                return res.status(403).json({ message: 'Domain already exist in your list ' })
            }
            const awsConfig = AWS(access, secret)


            const route53 = new awsConfig.Route53()
            const params = {
                DNSName: domain
            };

            const data = await route53.listHostedZonesByName(params).promise()
            console.log(data);
            if (data.HostedZones && data.HostedZones.length > 0) {
                const matchingHostedZone = data.HostedZones.find(zone => zone.Name === `${domain}.`);
                if (matchingHostedZone) {

                    const data = new domainSchema({
                        hostedZoneId: matchingHostedZone.Id,
                        userId: id,
                        domain: domain,
                        accessKey: access,
                        secretKey: secret
                    })
                    await data.save()
                    return res.status(200).json({ message: 'success' });
                }
            }

            return res.status(403).json({ message: 'Domain does not exist' });

        } catch (err) {
            return res.status(500).json({ message: err.message })
        }
    },
    
    deleteDomain : async (req,res)=>{
        try{

            const {domain} = req.body

            await domainData.deleteOne({domain:domain})
            return res.status(200).json({ message: 'success'})

        }catch(err){
            return res.status(500).json({message:err.message})
        }
    },
    
    getDomains: async (req, res) => {
        try {
            const user = req.user
            const domains = await domainData.find({ userId: user.id })
            return res.status(200).json({ message: 'success', domains })
        } catch (err) {
            return res.status(500).json({ message: 'Internal server error' })
        }
    },
    getDns: async (req, res) => {
        try {
            const { id, access, secret } = req.body

           




            const accessKey = access
            const secretKey = secret

            const awsConfig = AWS(accessKey, secretKey)
            const route53 = new awsConfig.Route53();
            const params = {
                HostedZoneId: id,
            };

            route53.listResourceRecordSets(params, (err, data) => {
                if (err) {
                    console.error('Error retrieving DNS records:', err);
                } else {

                    console.log('DNS records:', data.ResourceRecordSets);
                    return res.status(200).json({ data: data.ResourceRecordSets, domain: id })
                }
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: err.message })
        }
    },
    addRecord: async (req, res) => {
        try {
            const {id,Name,Type,message} = req.body
            console.log(req.body);
            const domain = await domainData.findOne({hostedZoneId:id})

            if (Name === domain.domain && Type === 'NS'){
                return res.status(403).json({message:'You are not allowed to add multiple NS record for root domain'})
            }
            const records = message.split('\n').map(line => ({
                Value: line.trim() 
            }));
            console.log(records);
            const aws = AWS(domain.accessKey,domain.secretKey)
            
            const route53 = new aws.Route53()

            const params = {
                ChangeBatch: {
                  Changes: [
                    {
                      Action: 'CREATE',
                      ResourceRecordSet: {
                        Name: `${Name}.${domain.domain}`,
                        Type: Type,
                        TTL: 300,
                        ResourceRecords: records
                      }
                    }
                  ]
                },
                HostedZoneId: id
              };

              const data = await route53.changeResourceRecordSets(params).promise();
              console.log(data);
              return res.status(200).json({message:'Success'})


        } catch (err) {
            console.log(err);
            return res.status(500).json({message:err.message})
        }
    },
    editRecord:async(req,res)=>{
        try{
            const {id,Name,Type,message} = req.body
            console.log(req.body);
            const domain = await domainData.findOne({hostedZoneId:id})

            if (Name === domain.domain && Type === 'NS'){
                return res.status(403).json({message:'You are not allowed to add multiple NS record for root domain'})
            }
            const records = message.split('\n').map(line => ({
                Value: line.trim() 
            }));
            const aws = AWS(domain.accessKey,domain.secretKey)
            
            const route53 = new aws.Route53()

            const params = {
                ChangeBatch: {
                  Changes: [
                    {
                      Action: 'UPSERT',
                      ResourceRecordSet: {
                        Name: `${Name}`,
                        Type: Type,
                        TTL: 300,
                        ResourceRecords: records
                      }
                    }
                  ]
                },
                HostedZoneId: id
              };

              const data = await route53.changeResourceRecordSets(params).promise();
              console.log(data);
              return res.status(200).json({message:'Success'})

        }catch(err){
            console.log(err);
            return res.status(500).json({message:err.message})
        }
    },
    deleteRecord : async(req,res) =>{
        try{

            const {id,Name,Type,message} = req.body
            console.log(req.body);
            const domain = await domainData.findOne({hostedZoneId:id})
            
            const aws = AWS(domain.accessKey,domain.secretKey)
            
            const route53 = new aws.Route53()

            const params = {
                ChangeBatch: {
                    Changes: [
                        {
                            Action: 'DELETE',
                            ResourceRecordSet: {
                                Name: `${Name}`,
                                Type: Type,
                                TTL:300,
                                ResourceRecords: message

                            }
                        }
                    ]
                },
                HostedZoneId: id
            };
            const data  = await  route53.changeResourceRecordSets(params).promise()
            return res.status(200).json({message:'success'})

        }catch(err){
            console.log(err);
            return res.status(500).json({message:err.message})
        }
    }
}