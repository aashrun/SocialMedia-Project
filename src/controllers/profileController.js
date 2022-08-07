const profileModel = require("../models/profileModel.js")



const createProfile = async function (req, res){
    try{
        let body = req.body
        
    }catch(error){
        res.status(500).send({status : false, message : error.message})
    }
}