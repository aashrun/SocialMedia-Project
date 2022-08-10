const postModel = require("../models/postModel.js")
const profileModel = require("../models/profileModel.js")
const upload = require('../aws/config.js')

const {isValid, emptyBody, emailCheck, isValidPassword, idMatch, onlyNumbers, isValidMobileNum, profileImageCheck, userNameCheck, isValidDateFormat} = require("../validations/validator.js")



//====================================  Creating a post  ===========================================//

const createPost = async function (req, res){
    try{
        let data = req.body
        if(!emptyBody(data)) return res.status(400).send({status: false, message: "Please provide details in the body!"})

        let {profileId, caption, location} = data
        let files = req.files
        
        if(!profileId) return res.status(400).send({status: false, message: "ProfileId is mandatory!"})
        if(!idMatch(profileId)) return res.status(400).send({status: false, message: "Invalid profileId!"})
        let uniqueProfileId = await profileModel.findOne({_id: profileId})
        if(!uniqueProfileId) return res.status(404).send({status: false, message: "No such profileId was found!"})


        if(!files) return res.status(400).send({status: false, message: "An image is required to post something"})

        let uploadedFileURL = await upload.uploadFile(files[0])
        data.image = uploadedFileURL;
        if (!profileImageCheck(files)) return res.status(400).send({ status: false, message: "Please provide profileImage in correct format like jpeg, png, jpg, gif, bmp etc" })


        if(caption){
            if(!isValid(caption)) return res.status(400).send({status: false, message: "Invalid caption format!"})
            data.caption = data.caption.trim().split(" ").filter(word => word).join(" ")
        }
        
        if(location){
            if(!isValid(location)) return res.status(400).send({status: false, message: "Please provide a valid location."})
            data.location = data.location.trim().split(" ").filter(word => word).join(" ")
        }
        
        let newPost = await postModel.create(data)
        
        let count = uniqueProfileId.postCount + 1
        let postData = uniqueProfileId.postData

        let obj = {}
        obj["Location"] = newPost["location"]
        obj["Image"] = newPost["image"]
        obj["Caption"] = newPost["caption"]
        obj["Likes"] = newPost["likesCount"]
        obj["Comments"] = newPost["commentsCount"]
        postData.push(obj)

        await profileModel.findOneAndUpdate({_id: profileId}, {postData: postData, postCount: count})

        res.status(201).send({status: true, message: "Your post has been created!", data: obj})


    }catch(error){
        return res.status(500).send({status: false, message: error.message})
    }
}










//========================================  Get Post  ==========================================//

const getPost = async function (req,res){
    try{
        let profileId = req.params.profileId
        let postId = req.params.postId

        if(!idMatch(profileId)) return res.status(400).send({status: false, message: "Invalid profileId!"})
        let profile = await profileModel.findOne({_id: profileId, isDeleted: false})
        if(!profile) return res.status(404).send({status: false, message: "No such profileId was found."})


        if(!idMatch(postId)) return res.status(400).send({status: false, message: "Invalid postId!"})
        let post = await postModel.findOne({_id: postId, isDeleted: false})
        if(!post) return res.status(404).send({status: false, message: "No such post was found."})

        let postProfile = await profileModel.findOne({_id: post.profileId, isDeleted: false})

        let block = postProfile.blockedAccs
        for(let i=0; i<block.length; i++){
            if(block[i]._id == profileId){
                res.status(403).send({status: false, message: `You are not allowed to view ${postProfile.userName}'s posts!`})
            }
        }

        var obj = {}
        if(post.location){
            obj["Location"] = post["location"]
        }
       
        obj["Image"] = post["image"]
        
        if(post.caption){
            obj["Caption"] = post["caption"]
        }
        obj["Likes"] = post["likesCount"]
        obj["Comments"] = post["commentsCount"]

        res.status(200).send({status: true, data: obj})


    }catch(error){
        res.status(500).send({status: false, message: error.message})
    }
}

module.exports = {createPost, getPost}