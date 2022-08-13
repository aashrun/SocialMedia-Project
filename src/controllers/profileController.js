const profileModel = require("../models/profileModel.js")
const postModel = require("../models/postModel.js")
const bcrypt = require("bcrypt")
const moment = require("moment")
const upload = require('../aws/config.js')
const jwt = require("jsonwebtoken")
const redis = require("redis")
const{ promisify } = require("util");
const {isValid, emptyBody, emailCheck, isValidPassword, idMatch, onlyNumbers, isValidMobileNum, profileImageCheck, userNameCheck, isValidDateFormat} = require("../validations/validator.js")








//===================================  Cache connection  =================================================//
const redisClient = redis.createClient(
    12223,                                                            
    "redis-12223.c212.ap-south-1-1.ec2.cloud.redislabs.com",          
    { no_ready_check: true }                                          
);
redisClient.auth("gWJ9sHgX461NdFPsDwQYmp2ZSc7uruSx", function (err) {  
    if (err) throw err;
});

redisClient.on("connect", async function () {         
    console.log("Profile Controller is connected to Redis.");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);          
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);









//=======================================  Creating a Profile  ======================================//

const createProfile = async function (req, res){
    try{
        let body = req.body
        if(!emptyBody(body)) return res.status(400).send({status : false, message : "Body cannot be empty!"})

        let {fullName, userName, DOB, email, gender, password, mobileNo, bio, location} = body
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


       if(!gender) return res.status(400).send({status: false, message: "Your gender is required!"})
       if(!["male", "female", "other"].includes(gender)){
        return res.status(400).send({status : false, msg : "Should include 'male', 'female' and 'other' only!"})
    }
        
        if(!email) return res.status(400).send({status : false, message : "Email is required!"})
        if(!emailCheck(email)) return res.status(400).send({status: false, message: "Invalid email format!"})
        let uniqueEmail = await profileModel.findOne({email: email, isDeleted: false})
        if(uniqueEmail) return res.status(409).send({status: false, message: "This email already exists in the database!"})


        if(!password) return res.status(400).send({status : false, message : "Password is required!"})
        if(!isValidPassword(password)) return res.status(400).send({status: false, message: "Password should have characters between 8 to 15 and should contain alphabets and numbers only!"})

        const salt = await bcrypt.genSalt(10)
        body.password = await bcrypt.hash(body.password, salt)


        if(mobileNo){
        if(!onlyNumbers(mobileNo)) return res.status(400).send({status: false, message: "The key 'mobileNo' should contain numbers only!"})
        if(!isValidMobileNum(mobileNo)) return res.status(400).send({status: false, message: "This number is not an Indian mobile number!"})
        let uniqueMobile = await profileModel.findOne({mobileNo: mobileNo, isDeleted: false})
        if (uniqueMobile) return res.status(409).send({status: false, message: "This mobile already exists in the database!"})
        }

        
        if (files && files.length > 0) {


        let uploadedFileURL = await upload.uploadFile(files[0])
         body.profileImage = uploadedFileURL;
         if (!profileImageCheck(body.profileImage)) return res.status(400).send({ status: false, message: "Please provide profileImage in correct format like jpeg, png, jpg, gif, bmp etc" })

    }


         if(bio){
            if(!isValid(bio)) return res.status(400).send({status: false, message: "Invalid bio format!"})
            body.bio = body.bio.trim().split(" ").filter(word => word).join(" ")
         }


         if(location){
            if(!isValid(location)) return res.status(400).send({status: false, message: "Please provide a valid location."})
            body.location = body.location.trim().split(" ").filter(word => word).join(" ")
         }
         

         let create = await profileModel.create(body)
         res.status(201).send({status: true, message: "Successfully created a profile!", data: create })

    }catch(error){
        res.status(500).send({status : false, message : error.message})
    }
}










//====================================== Login User  =================================//

const loginUser = async function (req, res) {
    try {
    let data = req.body
    let {email, mobileNo, password} = data

    if(!emptyBody(data)) return res.status(400).send({status: false, message: "Please provide your credentials to log in."})

    if(!(email || mobileNo)) return res.status(400).send({status: false, message: "Please provide your email or mobileNo to log in!"})
    if(!password)  return res.status(400).send({status: false, message: "Please provide your password to log in!"})


    if(email){
        if(!isValid(email)) return res.status(400).send({status: false, message: "Email cannot be empty!"})
        if(!emailCheck(email)) return res.status(400).send({status: false, message: "Invalid email!"})

        let emailInDB = await profileModel.findOne({email: req.body.email, isDeleted: false})
        if(!emailInDB) return res.status(404).send({status: false, message: "This email cannot be used to log in as it was not registered!"})

        let passwordCheck = await bcrypt.compare(req.body.password, emailInDB.password)
        if(!passwordCheck) return res.status(403).send({status: false, message: "Password provided is invalid!"})
        
        let token = jwt.sign(
            {
                profileId: emailInDB._id.toString(),
                group: "codeZinger",
                project: "SocialMedia",
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 480 * 60 * 60
            },
            "Project-6"             
        )

        res.status(200).send({status: true, message: "User logged in successfully!", data: {profileId: emailInDB._id, token: token}})

    }



    if(mobileNo){
        if(!isValid(mobileNo)) return res.status(400).send({status: false, message: "Mobile number cannot be empty!"})
        if(!isValidMobileNum(mobileNo)) return res.status(400).send({status: false, message: "Invalid mobile number!"})

        let mobileInDB = await profileModel.findOne({mobileNo: req.body.mobileNo, isDeleted: false})
        if(!mobileInDB) return res.status(404).send({status: false, message: "This mobile number cannot be used to log in as it was not registered!"})

        let passwordCheck = await bcrypt.compare(req.body.password, mobileInDB.password)
        if(!passwordCheck) return res.status(403).send({status: false, message: "Password provided is invalid!"})
        
        let token = jwt.sign(
            {
                profileId: mobileInDB._id.toString(),
                group: "codeZinger",
                project: "SocialMedia",
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 480 * 60 * 60
            },
            "Project-6"             
        )

        res.status(200).send({status: true, message: "User logged in successfully!", data: {profileId: mobileInDB._id, token: token}})

    }

    }catch (err) {
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

        if (!idMatch(profileId)) return res.status(400).send({status: false, message: "Please enter a valid profileId in params!"})
        if (!idMatch(otherProfileId)) return res.status(400).send({status: false, message: "Please enter a valid profileId in the body!"})

        let cachedProfileData = await GET_ASYNC(`${otherProfileId}`)
        if(cachedProfileData){
            let getProfileData  = JSON.parse(cachedProfileData)

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
            obj["followerCount"] = getProfileData["followerCount"]
            obj["followingCount"] = getProfileData["followingCount"]
            obj["postData"] = getProfileData["postData"]
            obj["bio"] = getProfileData["bio"]
            obj["profileImage"] = getProfileData["profileImage"]


    
            return res.status(200).send({ status: true, message: "Profile details", data: obj });
            

        }

        else{
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
        obj["followerCount"] = getProfileData["followerCount"]
        obj["followingCount"] = getProfileData["followingCount"]
        obj["postData"] = getProfileData["postData"]
        obj["bio"] = getProfileData["bio"]
        obj["profileImage"] = getProfileData["profileImage"]

        if(getProfileData){
            await SET_ASYNC(`${getProfileData._id}`, JSON.stringify(getProfileData)) 

        return res.status(200).send({ status: true, message: "Profile details", data: obj });
        }
    }

      }
      





      else{
        if (!idMatch(profileId)) return res.status(400).send({status: false, message: "Please enter a valid profileId!"})

        let cachedProfileData = await GET_ASYNC(`${profileId}`)
        if(cachedProfileData){
            let getProfileData  = JSON.parse(cachedProfileData)
            let obj = {}
            obj["fullName"] = getProfileData["fullName"]
            obj["userName"] = getProfileData["userName"]
            obj["postCount"] = getProfileData["postCount"]
            obj["followerCount"] = getProfileData["followerCount"]
            obj["followingCount"] = getProfileData["followingCount"]
            obj["postData"] = getProfileData["postData"]
            obj["bio"] = getProfileData["bio"]
            obj["profileImage"] = getProfileData["profileImage"]
    
            return res.status(200).send({ status: true, message: "Profile details", data: obj });

        }
       else {
        let getProfileData = await profileModel.findOne({_id: profileId, isDeleted:false})
        if(!getProfileData) return res.status(404).send({status:false, message: "ProfileId not found!"})

        let obj = {}
        obj["fullName"] = getProfileData["fullName"]
        obj["userName"] = getProfileData["userName"]
        obj["postCount"] = getProfileData["postCount"]
        obj["followerCount"] = getProfileData["followerCount"]
        obj["followingCount"] = getProfileData["followingCount"]
        obj["postData"] = getProfileData["postData"]
        obj["bio"] = getProfileData["bio"]
        obj["profileImage"] = getProfileData["profileImage"]
        

        if(getProfileData){
            await SET_ASYNC(`${getProfileData._id}`, JSON.stringify(getProfileData)) 

        return res.status(200).send({ status: true, message: "Profile details", data: obj });
        }}
    }
    }
    catch(error){
        res.status(500).send({status:false, message:error.message})
        console.log(error)
    }
}













//================================  Updating a profile  =================================//

const updateProfile = async function (req, res){
    try{

        let profileId = req.params.profileId
        let data = req.body
        let files = req.files

        let {userName , fullName , password ,email, gender, DOB, mobileNo , bio, location} = data     
        

       if(!emptyBody(data)) return res.status(400).send({ status: false, message: "Please provide some data for update" })
       if (typeof data === "string") { data = JSON.parse(data) }


       if (!profileId) return res.status(400).send({ status: false, msg: "Please mention profileId in params" })
       if(!idMatch(profileId))return res.status(400).send({ status: false, msg: "Invalid profile Id" })
       let Profile = await profileModel.findOne({ _id: profileId ,isDeleted:false})      
       if (!Profile) return res.status(404).send({ status: false, msg: "No such profile found" })

      
       if (userName) {
        if (!userNameCheck(userName)) return res.status(400).send({ status: false, message: "Invalid username!" });
    }
    
      if (fullName) {
        if (!isValid(fullName)) return res.status(400).send({ status: false, message: "Invalid Full Name!" });
        fullName = fullName.trim().split(" ").filter(word => word).join(" ")
    }

    if(DOB) {
        DOB = moment(DOB).format("YYYY-MM-DD")
        if (!isValidDateFormat(DOB)) return res.status(400).send({ status: false, msg: "Wrong date format!" })
      
        let age = moment(DOB).fromNow(true)
        let ageA = age.split(" ")
        let ans = ageA[0]
        let newAge = parseFloat(ans)

       if(newAge < 13) return res.status(403).send({status: false, message: "The age you want to set is less than what the company's policy."})
    }
    
    if(password){
        if(!isValidPassword(password)) return res.status(400).send({status: false, message: "Password should have characters between 8 to 15 and should contain alphabets and numbers only!"})
        let salt = await bcrypt.genSalt(10)
       password = await bcrypt.hash(password, salt)
    }

    if(email){
        if(!emailCheck(email)) return res.status(400).send({ status: false, message: "Invalid EmailId" });
        let emailMatch = await profileModel.findOne({ email : email })
        if (emailMatch) return res.status(409).send({ status: false, message: "This email already exist!" })
        
    }
    if(mobileNo){
        if(!onlyNumbers(mobileNo)) return res.status(400).send({status: false, message: "The key 'mobileNo' should contain numbers only!"})
        if(!isValidMobileNum(mobileNo))return res.status(400).send({ status: false, message: "Invalid mobile number!" });
        let mobileMatch = await profileModel.findOne({ mobileNo : mobileNo })
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
        if (!profileImageCheck(data.profileImage)) return res.status(400).send({ status: false, message: "Please provide profileImage in correct format like jpeg, png, jpg, gif, bmp etc" })


    }
    if(location){
        if(!isValid(location)) return res.status(400).send({status: false, message: "Please provide valid location.!"})
            location = location.trim().split(" ").filter(word => word).join(" ")
           
    }


    if(gender){
       if(!["male", "female", "other"].includes(gender)){
        return res.status(400).send({status : false, msg : "Should include 'male', 'female' and 'other' only!"})
    }
}


    let updated = await profileModel.findOneAndUpdate({_id:profileId},data,{new:true})

    let response = {}
   
    response.fullName = updated.fullName 
    response.userName = updated.userName 
    response.postCount = updated.postCount 
    response.followerCount = updated.followerCount 
    response.followingCount = updated.followingCount 
    response.postData = updated.postData
    response.bio = updated.bio 
    response.profileImage = updated.profileImage 

    return res.status(200).send({status: true, message: "Profile updated succesfully", data: response})


    }catch(error){
        res.status(500).send({status : false, message : error.message})
    }
}








//=====================================  Deleting a profile  ===================================//

const deleteProfile = async function (req, res) {
    try {
        let profileId = req.params.profileId

        if (!idMatch(profileId)) return res.status(400).send({ status: false, message: "Invalid profileId!" })

        let obj = {}
        obj.profileImage = null
        obj.followerCount = 0
        obj.followingCount = 0
        obj.followerList = []
        obj.followingList = []
        obj.postCount = 0
        obj.postData = []
        obj.blockedAccs = []
        obj.isDeleted = true
        obj.deletedAt = Date.now()
        
        // deleting profile
        const deletedProfile = await profileModel.findOneAndUpdate({ _id: profileId, isDeleted: false },obj)
        if (!deletedProfile) return res.status(404).send({ status: false, message: "No such profile found!" })

        //deleting all post of  profile
        await postModel.updateMany({ profileId: profileId, isDeleted: false }, {isDeleted:true})

        let allprofile = await profileModel.find()

       // deleting from other's following list

        for (let i = 0; i < allprofile.length; i++) {
            let followings = allprofile[i].followingList
            for (let j = 0; j < followings.length; j++) {
                if (followings[j]._id == profileId) {
                    
                    followings.splice(j, 1)
                    followingCount = allprofile[i].followingCount - 1

                    await profileModel.findOneAndUpdate({ _id: allprofile[i]._id }, { followingList: followings, followingCount: followingCount })
                }
            }
        }
        //deleting from other's followers list 

        for (let i = 0; i < allprofile.length; i++) {
            let followers = allprofile[i].followerList
            for (let j = 0; j < followers.length; j++) {
                if (followers[j]._id == profileId) {
                    followers.splice(i, 1)
                    followingCount = allprofile[i].followerCount - 1

                    await profileModel.findOneAndUpdate({ _id: allprofile[i]._id }, { followerList: followers, followingCount: followingCount })
                }
            }
        }
        return res.status(200).send({ status: true, message: "Profile deleted successfully!", data: deletedProfile })
    } catch (err) {
        console.log("This is the error:", err.message)
        return res.status(500).send({ status: false, message: err.message })
    }

}










//=======================================  Following a profile  =========================================//

const followProfile = async function (req, res){
    try{
        let profileId = req.params.profileId
        let data = req.body
        let personToFollow = data.profileId
        

        if (!idMatch(profileId)) return res.status(400).send({status: false, message: "Please enter a valid profileId in params!"})
        let profile = await profileModel.findOne({ _id: profileId, isDeleted:false})      
       if (!profile) return res.status(404).send({ status: false, msg: "No such profile found" })


        if(!emptyBody(data)) return res.status(400).send({status: false, message: "Please provide the profileId you want to follow!"})


        if (!isValid(personToFollow)) return res.status(400).send({status: false, message: "Please enter a profileId!"}) 
        if (!idMatch(personToFollow)) return res.status(400).send({status: false, message: "Please enter a valid profileId in the body!"})

        if(profileId == personToFollow) return  res.status(400).send({ status: false, message: "You cannot follow yourself, lol." }) 

        let bodyProfileId = await profileModel.findOne({ _id: personToFollow, isDeleted: false})      
       if (!bodyProfileId) return res.status(404).send({ status: false, msg: "The profile you wish to follow doesn't exist!" })
       


       let alreadyFollowed = bodyProfileId.followerList
       for(let j=0; j<alreadyFollowed.length; j++){
        if(alreadyFollowed[j]._id == profileId){
            return res.status(403).send({status: false, message: `You have already followed ${bodyProfileId.userName}!`})
        }
       }


       let block = bodyProfileId.blockedAccs
       for(let i=0; i<block.length; i++){
        if(block[i]._id == profileId){
            return res.status(403).send({status: false, message: "You cannot follow this profile because they have blocked you!"})
        }
       }

       
       let otherFollowerList = bodyProfileId.followerList
       let ourFollowingList = profile.followingList

       let ourObj = {}
       ourObj["_id"] = profile["_id"]
       ourObj["userName"] = profile["userName"]
       ourObj["fullName"] = profile["fullName"]

       otherFollowerList.push(ourObj)
      let newData = bodyProfileId.followerCount + 1
      
       await profileModel.findOneAndUpdate({_id: personToFollow}, {$set: {followerList: otherFollowerList, followerCount: newData}})

       let otherObj = {}
       otherObj["_id"] = bodyProfileId["_id"]
       otherObj["userName"] = bodyProfileId["userName"]
       otherObj["fullName"] = bodyProfileId["fullName"]

       ourFollowingList.push(otherObj)
       let latestData = profile.followingCount + 1

       await profileModel.findOneAndUpdate({_id: profileId}, {$set: {followingList: ourFollowingList, followingCount: latestData}})

       return res.status(200).send({status: true, message: `You're now following ${bodyProfileId.userName}.`})


    }catch(error){
        return res.status(500).send({status: false, message: error.message})
    }
}













//=========================================  Block a profile  =======================================//

const blockProfile = async function(req, res){
    try{
        
    let userProfileId = req.params.profileId
    let userToBeBLocked = req.body.profileId

   

    if(userProfileId == userToBeBLocked) return  res.status(400).send({ status: false, message: "You cannot block yourself lol." }) 

    if(!idMatch(userProfileId)) return res.status(400).send({status: false, message: "The profileId in the params is invalid!"})
    if(!idMatch(userToBeBLocked)) return res.status(400).send({status: false, message: "The profileId in the body is invalid!"})


    let user = await profileModel.findOne({_id:userProfileId, isDeleted:false})
    if(!user) return res.status(404).send({ status: false, message: " ProfileId doesn't exist! " }) 
    

    let blocked = await profileModel.findOne({_id: userToBeBLocked, isDeleted:false})
    if(!blocked) return res.status(404).send({ status: false, message: "No such profile found!" })
   

    let existingBlocked = user.blockedAccs
    for (let i =0;i<existingBlocked.length;i++){
      if(existingBlocked[i]._id == userToBeBLocked){
        return res.status(400).send({ status: false, message: "Profile already blocked!" })
      }
    }
    let update = {}

    let blockedData = {}
 

    blockedData._id = userToBeBLocked
    blockedData.userName = blocked.userName
    blockedData.fullName = blocked.fullName
    
    

    existingBlocked.push(blockedData)
    update["blockedAccs"] =  existingBlocked
   

    let followerList = user.followerList
    for(let i=0;i<followerList.length;i++){
    if(followerList[i]._id == userToBeBLocked){
        followerList.splice(i,1);
        
        var followerCount = user.followerCount -1
        break;
       
    }
    update["followerList"] =  followerList
    update["followerCount"] = followerCount
    }

    let followingList = user.followingList
     for(let i =0; i<followingList.length; i++){
       if(followingList[i]._id == userToBeBLocked){
           followingList.splice(i,1)
           var followingCount = user.followingCount - 1
           update["followingList"] =  followingList
           update["followingCount"] = followingCount
           break;
       }
     }

     await profileModel.findOneAndUpdate({ _id: userProfileId},update)  

     let update2 = {}
     let followerList2 = blocked.followerList
    for(let i=0;i<followerList2.length;i++){
    if(followerList2[i]._id == userProfileId){
        followerList2.splice(i,1);
         var followerCount2 = blocked.followerCount -1
        break;
    }
    update2["followerList"] =  followerList2
    update2["followerCount"] = followerCount2
    }

    let followingList2 = blocked.followingList
     for(let i =0;i<followingList2.length;i++){
       if(followingList2[i]._id == userProfileId){
           followingList2.splice(i,1)
           
           var followingCount2 =  blocked.followingCount -1
           update2["followingList"] =  followingList2
           update2["followingCount"] = followingCount2
           break;
       }
     }


     await profileModel.findOneAndUpdate({ _id: userToBeBLocked},update2)  

    return res.status(200).send({ status: true, message: `${blocked.userName} is now blocked!`})

    }catch(err){
        console.log("This is the error:", err.message)
        return res.status(500).send({ status: false, message: err.message })
    }
    
 }











//========================================  Unblocking a profile  =========================================//

const unblockProfile = async function (req, res) {
    try {

        let userProfileId = req.params.profileId
        let userToUnblock = req.body.profileId

        if (userProfileId == userTounBlock) return res.status(400).send({ status: false, message: "Invalid request!" })

        if(!idMatch(userProfileId)) return res.status(400).send({status: false, message: "The profileId in the params is invalid!"})
        if(!idMatch(userToUnblock)) return res.status(400).send({status: false, message: "The profileId in the body is invalid!"})

        let user = await profileModel.findOne({ _id: userProfileId, isDeleted: false })
        if (!user) return res.status(404).send({ status: false, message: "The profileId provided in the params doesn't exist!" })

        let unblock = await profileModel.findOne({ _id: userToUnblock, isDeleted: false })
        if (!unblock) return res.status(404).send({ status: false, message: "The profileId provided in the body doesn't exist!" })


        let userBlockedAcc = user.blockedAccs

        for (let i = 0; i < userBlockedAcc.length; i++) {
            if (userBlockedAcc[i]._id == userToUnblock) {
                userBlockedAcc.splice(i, 1)

                await profileModel.findOneAndUpdate({ _id: userProfileId }, { blockedAccs: userBlockedAcc })
                return res.status(200).send({ status: true, message: `${unblock.userName} has now been unblocked successfully!`})
            }  

        }

        return res.status(404).send({ status: false, message: "You are not in the blocked list" }) 


    } catch (err) {
        console.log("This is the error:", err.message)
        return res.status(500).send({ status: false, message: err.message })
    }
}














//================================= To post a comment  =================================//

const commentOnPost = async function (req, res){
    try{
        let profileId = req.params.profileId
        let data = req.body
        let {postId, comment} = data

        if(!idMatch(profileId)) return res.status(400).send({status: false, message: "Invalid profileId!"})
        let profileCheck = await profileModel.findOne({_id: profileId, isDeleted: false})
        if(!profileCheck) return res.status(404).send({status: false, message: "This profile doesn't exist!"})

        if(!emptyBody(data)) return res.status(400).send({status: false, message: "The request body cannot be empty!"})

        if(!postId) return res.status(400).send({status: false, message: "Please provide the postId you wish to comment on!"})
        if(!idMatch(postId)) return res.status(400).send({status: false, message: "Invalid postId!"})
        let postCheck = await postModel.findOne({_id: postId, isDeleted: false})
        if(!postCheck) return res.status(404).send({status: false, message: "This postId doesn't exist!"})

        if(!comment) return res.status(400).send({status: false, message: " 'Comment' cannot be empty!"})
        if(!isValid(comment)) return res.status(400).send({status: false, message: "Please provide with a comment!"})

        let profileOfPost = await profileModel.findOne({_id: postCheck.profileId, isDeleted: false})
        if(!profileOfPost) res.status(403).send({status: false, message: "The account owner of this post was not found or is deleted. "})

        let block = profileOfPost.blockedAccs
        for(let i=0; i<block.length; i++){
            if(block[i]._id == profileId){
                return res.status(403).send({status: false, message: `You cannot comment on ${profileOfPost.userName}'s post because they have blocked you!`})
            }
        }


        let commentsCount = postCheck.commentsCount + 1
        let commentsList = postCheck.commentsList

        let obj = {}
        obj["userName"] = profileCheck.userName
        obj["Comment"] = comment
         commentsList.push(obj)

        let finalData = await postModel.findOneAndUpdate({_id: postId}, {commentsCount: commentsCount, commentsList: commentsList}, {new: true})
        res.status(200).send({status: true, message: "Comment posted successfully!", data: finalData})


    }catch(error){
        res.status(500).send({status: false, message: error.message})
    }
}













//=====================================  Delete a comment  ======================================//

const deleteComment = async function (req, res){
    try{
        let profileId = req.params.profileId
        let data = req.body
        let {postId, comment} = data

        if(!idMatch(profileId)) return res.status(400).send({status: false, message: "Invalid profileId!"})
        let profile = await profileModel.findOne({_id: profileId, isDeleted: false})
        if(!profile) return res.status(404).send({status: false, message: "The profileId provided was not found."})

        if(!emptyBody(data))  return res.status(400).send({status: false, message: "Request body cannot be empty!"})

        if(!postId)  return res.status(400).send({status: false, message: "Post Id is required to delete a comment!"})
        let post = await postModel.findOne({_id: postId, isDeleted: false})
        if(!post) return res.status(404).send({status: false, message: "The postId you requested for doesn't exist."})

        if(!comment)  return res.status(400).send({status: false, message: "It's mandatory to mention the comment you wish to delete!"})
        if(!isValid(comment))  return res.status(400).send({status: false, message: "The 'comment' key cannot be empty!"})



        if(post.profileId == profileId){  
            let commentsList = post.commentsList
            let commentsCount = post.commentsCount - 1

            for(let i=0; i<commentsList.length; i++){
                if(commentsList[i].Comment == comment){
                    commentsList.splice(i, 1)

                  let newData =  await postModel.findOneAndUpdate({_id: postId}, {commentsList: commentsList, commentsCount: commentsCount}, {new: true})
                  return res.status(200).send({status: true, message: "The comment was successfully deleted!", data: newData})
                }
            }
           return res.status(404).send({status: false, message: "The comment you wanted to delete was not found!"})
        }
        


        if(post.profileId != profileId){  
            let postProfile = await profileModel.findOne({_id: post.profileId, isDeleted: false})
            
            let block = postProfile.blockedAccs
            for(let i=0; i<block.length; i++){
                if(block[i]._id == profileId){
                    return res.status(403).send({status: false, message: "You cannot delete comments on this post because the owner has blocked you!"})
                }
            }


            let commentsList = post.commentsList
            let commentsCount = post.commentsCount - 1

            for(let i=0; i<commentsList.length; i++){
                if(commentsList[i].userName == profile.userName && commentsList[i].Comment == req.body.comment){
                    commentsList.splice(i, 1)

                   let newData = await postModel.findOneAndUpdate({_id: postId}, {commentsList: commentsList, commentsCount: commentsCount}, {new: true})
                    return res.status(200).send({status: true, message: "The comment was successfully deleted!", data: newData})
                }
            }
            return res.status(404).send({status: false, message: "This comment doesn't exist!"})
        }

    }catch(error){
        res.status(500).send({status: false, message: error.message})
    }
}







//==========================================  Like a post  ======================================//

const likePost = async function (req, res) {
    try {
        let profileId = req.params.profileId
        let postId = req.body.postId

        if (!idMatch(profileId)) return res.status(400).send({ status: false, message: "Invalid profileId!" })
        let profile = await profileModel.findOne({ _id: profileId, isDeleted: false })
        if (!profile) return res.status(404).send({ status: false, message: "No such profile exists." })

        if (!idMatch(postId)) return res.status(400).send({ status: false, message: "Invalid postId!" })
        let post = await postModel.findOne({ _id: postId, isDeleted: false })
        if (!post) return res.status(404).send({ status: false, message: "No such post exists." })

        let postProfile = await profileModel.findOne({ _id: post.profileId, isDeleted: false })

        let block = postProfile.blockedAccs
        for (let i = 0; i < block.length; i++) {
            if (block[i]._id == profileId) {
                return res.status(403).send({ status: false, message: "You cannot like this post because the owner of this post has blocked you!" })
            }
        }
        let likesList = post.likesList
        for (let i = 0; i < likesList.length; i++) {
            if (likesList[i].userName == profile.userName) {
                return res.status(400).send({ status: false, message: `You've already liked ${postProfile.userName}'s post!` })
                break;
            }
        }

        let newLike = {}
        newLike.userName = profile.userName
        likesList.push(newLike)
        let likesCount = post.likesCount + 1

        var updatedLikeList = await postModel.findOneAndUpdate({ _id: postId }, { likesList: likesList, likesCount: likesCount }, { new: true })
        return res.status(200).send({ status: true, message: "You have now liked this post.", data: updatedLikeList })


    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}














//=======================================  Unliking a post  =====================================//

const unlikePost = async function (req, res) {
    try {
        let profileId = req.params.profileId
        let postId = req.body.postId

        if (!idMatch(profileId)) return res.status(400).send({ status: false, message: "Invalid profileId!" })
        let profile = await profileModel.findOne({ _id: profileId, isDeleted: false })
        if (!profile) return res.status(404).send({ status: false, message: "No such profile exists." })

        if (!idMatch(postId)) return res.status(400).send({ status: false, message: "Invalid postId!" })
        let post = await postModel.findOne({ _id: postId, isDeleted: false })
        if (!post) return res.status(404).send({ status: false, message: "No such post exists." })


        let postProfile = await profileModel.findOne({ _id: post.profileId, isDeleted: false })

        let block = postProfile.blockedAccs
        for (let i = 0; i < block.length; i++) {
            if (block[i]._id == profileId) {
                return res.status(403).send({ status: false, message: "You cannot unlike the post because the user has blocked you!" })
            }
        }

        let likesList = post.likesList

        for (let i = 0; i < likesList.length; i++) {
            if (likesList[i].userName == profile.userName) {
                likesList.splice(i, 1)
                
                let likesCount = post.likesCount - 1
                var updatedLikeList = await postModel.findOneAndUpdate({ _id: postId }, { likesList: likesList, likesCount: likesCount }, {new: true})

                return res.status(200).send({ status: true, message: "Unliked post.", data: updatedLikeList })
                
            }
        }
                return res.status(400).send({status: false, message: "You have already unliked this post!"})
           

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}












module.exports = {createProfile, loginUser, getProfile, updateProfile, deleteProfile, followProfile, blockProfile, unblockProfile, commentOnPost, deleteComment, likePost, unlikePost}