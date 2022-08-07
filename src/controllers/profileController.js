const profileModel = require("../models/profileModel.js")
const validation = require("../validations/validator.js")



const createProfile = async function (req, res){
    try{
        let body = req.body
        let {fullName, userName, DOB, email, password, mobileNo, profileImage, bio, followerCount, followingCount, followerList, followingList, postCount, postData, location, blockedAccs} = body

    }catch(error){
        res.status(500).send({status : false, message : error.message})
    }
}