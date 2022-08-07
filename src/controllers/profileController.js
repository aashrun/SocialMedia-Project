const profileModel = require("../models/profileModel.js")
const bcrypt = require("bcrypt")
const moment = require("moment")
const upload = require('../aws/config.js')
const jwt = require("jsonwebtoken");

const {isValid, emptyBody, emailCheck, isValidPassword, idMatch, onlyNumbers, isValidMobileNum, profileImageCheck, userNameCheck, isValidDateFormat} = require("../validations/validator.js")



//=======================================  Creating a Profile  ======================================//

const createProfile = async function (req, res){
    try{
        let body = req.body
        if(!emptyBody(body)) return res.status(400).send({status : false, message : "Body cannot be empty!"})

        let {fullName, userName, DOB, email, password, mobileNo, bio, location} = body
        let files = req.files


        if(!fullName) return res.status(400).send({status : false, message : "Full Name is required!"})
        if(!isValid(fullName)) return res.status(400).send({status : false, message : "Enter full name!"})
        body.fullName = body.fullName.trim().split(" ").filter(word => word).join(" ")


        if(!userName) return res.status(400).send({status : false, message : "Username is required!"})
        if(!userNameCheck(userName)) return res.status(400).send({status : false, message : "Invalid userName!"})
        let uniqueUsername = await profileModel.findOne({userName: userName, isDeleted: false})
        if(uniqueUsername) return res.status(409).send({status : false, message : "This username is already taken!"})


        if(!DOB) return res.status(400).send({status : false, message : "DOB is required!"})
        DOB = moment(DOB).format("YYYY-MM-DD")
        if (!isValidDateFormat(DOB)) return res.status(400).send({ status: false, msg: "Wrong date format!" })
      
        let age = moment(DOB).fromNow(true)
        let ageA = age.split(" ")
        let ans = ageA[0]
        let newAge = parseFloat(ans)
       if(newAge < 13) return res.status(403).send({status: false, message: "You're too young to join this Social Media platform!"})
        


        if(!email) return res.status(400).send({status : false, message : "Email is required!"})
        if(!emailCheck(email)) return res.status(400).send({status: false, message: "Invalid email format!"})
        let uniqueEmail = await profileModel.findOne({email: email, isDeleted: false})
        if(uniqueEmail) return res.send(409).send({status: false, message: "This email already exists in the database!"})


        if(!password) return res.status(400).send({status : false, message : "Password is required!"})
        if(!isValidPassword(password)) return res.status(400).send({status: false, message: "Password should have characters between 8 to 15 and should contain alphabets and numbers only!"})

        const salt = await bcrypt.genSalt(10)
        body.password = await bcrypt.hash(data.password, salt)


        if(mobileNo){
        if(!onlyNumbers(mobileNo)) return res.status(400).send({status: false, message: "The key 'mobileNo' should contain numbers only!"})
        if(!isValidMobileNum(mobileNo)) return res.status(400).send({status: false, message: "This number is not an Indian mobile number!"})
        let uniqueMobile = await profileModel.findOne({mobileNo: mobileNo, isDeleted: false})
        if (uniqueMobile) return res.status(409).send({status: false, message: "This mobile already exists in the database!"})
        }

        
        if (files && files.length > 0) {

        if (!profileImageCheck(files)) return res.status(400).send({ status: false, message: "Please provide profileImage in correct format like jpeg, png, jpg, gif, bmp etc" })

        let uploadedFileURL = await upload.uploadFile(files[0])
         body.profileImage = uploadedFileURL;
    }


         if(bio){
            if(!isValid(bio)) return res.status(400).send({status: false, message: "Invalid bio format!"})
            body.bio = body.bio.trim().split(" ").filter(word => word).join(" ")
         }


         if(location){
            if(!isValid(location)) return res.status(400).send({status: false, message: "Please provide a valid location."})
            body.location = body.location.trim().split(" ").filter(word => word).join(" ")
         }
         

         let create = await userModel.create(body)
         res.status(201).send({status: true, message: "Successfully created a profile!", data: create })

    }catch(error){
        res.status(500).send({status : false, message : error.message})
    }
}










//====================================== Login User  =================================//

const loginUser = async function (req, res) {
    try {

        let { email, mobileNo, password } = req.body
        if (!emptyBody(req.body)) return res.status(400).send({ status: false, message: "Please provide login details!" })


        if (!(email || mobileNo)) return res.status(400).send({ status: false, message: "Please enter atleast mobile no. or email with password to login!" })


        if (email && mobileNo) return res.status(400).send({ status: false, message: "Please enter only mobile number or email with password to login!" })


        if (email) {
            if (!isValid(email)) return res.status(400).send({ status: false, message: "Email is not present!" })

            if (!emailCheck(email)) return res.status(400).send({ status: false, message: "Email is invalid!" })
        }

        if (mobileNo) {
            if (!isValid(mobileNo)) return res.status(400).send({ status: false, message: "Mobile number is not present!" })

            if (!mobileRegex(mobileNo)) return res.status(400).send({ status: false, message: "Mobile number is invalid!" })
        }


        if (!isValid(password)) return res.status(400).send({ status: false, message: "Password is not present!" })

        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "Password must be 8 to 15 characters and in alphabets and numbers only!" })

        let user = await profileModel.findOne({ email: email, mobileNo: mobileNo })
        if (!(user.email || user.password)) return res.status(404).send({ status: false, message: `${email} ${mobileNo} is not present in the Database!` })

        let passwordCheck = await bcrypt.compare(req.body.password, user.password)

        if (!passwordCheck) return res.status(400).send({ status: false, message: "Password is not correct!" })


        let token = jwt.sign(
            {
                userId: user._id.toString(),
                group: "codeZinger",
                project: "SocialMedia",
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 480 * 60 * 60
            },
            "group01-project6"             
        )


        return res.status(200).send({ status: true, message: "User logged in successfully!", data: { userId: user._id, token } })
    }
    catch (err) {
        console.log("This is the error:", err.message)
        return res.status(500).send({ status: false, message: err.message })
    }
} 









//=======================================  Getting Profile Details  ====================================//

const getProfile = async function(req,res){
    try{
        let profileId = req.params.profileId
        let otherProfileId = req.body.profileId


        if(otherProfileId){
        if (!isValid(otherProfileId)) return res.status(400).send({status: false, message: "Please enter a profileId!"}) 
        if (!idMatch(otherProfileId)) return res.status(400).send({status: false, message: "Please enter a valid profileId!"})

        let getProfileData = await profileModel.findOne({_id: otherProfileId, isDeleted:false})
        if(!getProfileData) return res.status(404).send({status:false, message: "ProfileId not found!"})

        let block = getProfileData.blockedAccs
        for(let i=0; i<block.length; i++){
            if(block[i]._id == profileId){
                return res.status(403).send({status: false, message: "You've been blocked by this user!"})
            }
        }

        let obj = {}
        obj["fullName"] = getProfileData["fullName"]
        obj["userName"] = getProfileData["userName"]
        obj["postCount"] = getProfileData["postCount"]
        obj["followersCount"] = getProfileData["followersCount"]
        obj["followingCount"] = getProfileData["followingCount"]
        obj["postData"] = getProfileData["postData"]
        obj["bio"] = getProfileData["bio"]
        obj["profileImage"] = getProfileData["profileImage"]


        return res.status(200).send({ status: true, message: "Profile details", data: obj });

      }else{
        if (!idMatch(profileId)) return res.status(400).send({status: false, message: "Please enter a valid profileId!"})

        let getProfileData = await profileModel.findOne({_id: profileId, isDeleted:false})
        if(!getProfileData) return res.status(404).send({status:false, message: "ProfileId not found!"})

        let obj = {}
        obj["fullName"] = getProfileData["fullName"]
        obj["userName"] = getProfileData["userName"]
        obj["postCount"] = getProfileData["postCount"]
        obj["followersCount"] = getProfileData["followersCount"]
        obj["followingCount"] = getProfileData["followingCount"]
        obj["postData"] = getProfileData["postData"]
        obj["bio"] = getProfileData["bio"]
        obj["profileImage"] = getProfileData["profileImage"]

        return res.status(200).send({ status: true, message: "Profile details", data: obj });
      }
    }
    catch(error){
        res.status(500).send({status:false,message:error.message})
        console.log(error)
    }
}








//================================  Updating a profile  =================================//

const updateProfile = async function (req, res){
    try{

        let profileId = req.params.profileId
        let data = req.body
        let files = req.files

        const { userName , fullName , password ,email, mobileNo , bio, location} = data     
        

       if(!emptyBody(data)) return res.status(400).send({ status: false, message: "Please provide some data for update" })
       if (typeof data === "string") { data = JSON.parse(data) }


       if (!profileId) return res.status(400).send({ status: false, msg: "Please mention profileId in params" })
       if(!idMatch(profileId))return res.status(400).send({ status: false, msg: "Invalid profile Id" })
       const Profile = await profileModel.findOne({ _id: profileId ,isDeleted:false})      
       if (!Profile) return res.status(404).send({ status: false, msg: "No such profile found" })

      
       if (userName) {
        if (!userNameCheck(userName)) return res.status(400).send({ status: false, message: "Invalid username!" });
    }
    
      if (fullName) {
        if (!isValid(fullName)) return res.status(400).send({ status: false, message: "Invalid Full Name!" });
        fullName = fullName.trim().split(" ").filter(word => word).join(" ")
    }
    
    if(password){
        if(!isValidPassword(password)) return res.status(400).send({status: false, message: "Password should have characters between 8 to 15 and should contain alphabets and numbers only!"})
        const salt = await bcrypt.genSalt(10)
       password = await bcrypt.hash(password, salt)
    }

    if(email){
        if(!emailCheck(email)) return res.status(400).send({ status: false, message: "Invalid EmailId" });
        const emailMatch = await profileModel.findOne({ email : email })
        if (emailMatch) return res.status(409).send({ status: false, message: "This email already exist!" })
        
    }
    if(mobileNo){
        if(!onlyNumbers(mobileNo)) return res.status(400).send({status: false, message: "The key 'mobileNo' should contain numbers only!"})
        if(!isValidMobileNum(mobileNo))return res.status(400).send({ status: false, message: "Invalid mobile number!" });
        const mobileMatch = await profileModel.findOne({ mobileNo : mobileNo })
        if (mobileMatch) return res.status(409).send({ status: false, message: "This mobile number is already taken!" })
        
    }

    if(bio){
        if(!isValid(bio))
        return res.status(400).send({ status: false, message: "Please provide valid bio." });
      
    }
    if (files && files.length > 0) {

        if (!profileImageCheck(files)) return res.status(400).send({ status: false, message: "Please provide profileImage in correct format like jpeg, png, jpg, gif, bmp etc" })

        let uploadedFileURL = await upload.uploadFile(files[0])
        data.profileImage = uploadedFileURL

    }
    if(location){
        if(!isValid(location)) return res.status(400).send({status: false, message: "Please provide valid location.!"})
            location = location.trim().split(" ").filter(word => word).join(" ")
           

    }

    const updated = await profileModel.findOneAndUpdate({_id:profileId},data,{new:true})

    let response = {}
   
    response.fullName = updated.fullName 
    response.userName = updated.userName 
    response.postCount = updated.postCount 
    response.followerCount = updated.followerCount 
    response.followingCount = updated.followingCount 
    response.postData = updated.postData
    response.bio = updated.bio 
    response.profileImage = updated.profileImage 

    return res.status(200).send({status:false,message:"Updated Succesfully",data:response})


    }catch(error){
        res.status(500).send({status : false, message : error.message})
    }
}








//=====================================  Deleting a profile  ===================================//

const deleteProfile = async function(req,res){
    try{
    let profileId = req.params.profileId
    
        if(!idMatch(profileId))return res.status(400).send({ status: false, message: "Invalid profileId!" })

        const Profile = await profileModel.findOneAndUpdate({ _id: profileId, isDeleted:false}, {isDeleted:true})      
        if (!Profile) return res.status(404).send({ status: false, message: "No such profile found!" })

         await postModel.updateMany({isDeleted: false}, {isDeleted: true})
    
        return res.status(200).send({ status: true, message: "Profile deleted successfully!" })


    }catch(err){
        console.log("This is the error:", err.message)
        return res.status(500).send({ status: false, message: err.message })
    }
    
    }


module.exports = {createProfile, loginUser, getProfile, updateProfile, deleteProfile}