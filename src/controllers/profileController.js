const profileModel = require("../models/profileModel.js")
const validation = require("../validations/validator.js")



const createProfile = async function (req, res){
    try{
        let body = req.body
        if(!validation.emptyBody(body)) return res.status(400).send({status : false, message : "Body cannot be empty!"})

        let {fullName, userName, DOB, email, password, mobileNo, profileImage, bio, followerCount, followingCount, followerList, followingList, postCount, postData, location, blockedAccs} = body

        if(!fullName) return res.status(400).send({status : false, message : "Full Name is required!"})
        if(!validation.isValid(fullName)) return res.status(400).send({status : false, message : "Invalid full name!"})

        if(!userName) return res.status(400).send({status : false, message : "Username is required!"})
        let uniqueUsername = await


        
    }catch(error){
        res.status(500).send({status : false, message : error.message})
    }
}