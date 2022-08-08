const postModel = require("../models/postModel.js")
const profileModel = require("../models/profileModel.js")
const upload = require('../aws/config.js')

const {isValid, emptyBody, emailCheck, isValidPassword, idMatch, onlyNumbers, isValidMobileNum, profileImageCheck, userNameCheck, isValidDateFormat} = require("../validations/validator.js")




const createPost = async function (req, res){
    try{
        let data = req.body
        if(!emptyBody(data)) return res.status(400).send({status: false, message: "Please provide details in the body!"})

        let {profileId, image, caption, location} = data
        
        if(!profileId) return res.status(400).send({status: false, message: "ProfileId is mandatory!"})
        if(!idMatch(profileId)) return res.status(400).send({status: false, message: "Invalid profileId!"})
        let uniqueProfileId = await profileModel.findOne({_id: profileId})
        if(!uniqueProfileId) return res.status(404).send({status: false, message: "No such profileId was found!"})


        if(!image) return res.status(400).send({status: false, message: "An image is required to post something"})
        if (!profileImageCheck(image)) return res.status(400).send({ status: false, message: "Please provide profileImage in correct format like jpeg, png, jpg, gif, bmp etc" })

        let uploadedFileURL = await upload.uploadFile(files[0])
        data.image = uploadedFileURL;

        if(caption){
            if(!isValid(caption)) return res.status(400).send({status: false, message: "Invalid caption format!"})
            data.caption = data.caption.trim().split(" ").filter(word => word).join(" ")
        }
        
        if(location){
            if(!isValid(location)) return res.status(400).send({status: false, message: "Please provide a valid location."})
            data.location = data.location.trim().split(" ").filter(word => word).join(" ")
        }
        
        let newPost = await postModel.create(data)
        res.status(201).send({status: true, message: "Your post has been created!", data: newPost})


    }catch(error){
        return res.status(500).send({status: false, message: error.message})
    }
}

module.exports = {createPost}