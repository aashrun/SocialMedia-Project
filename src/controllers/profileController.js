const profileModel = require("../models/profileModel.js")
const {isValid, emptyBody, emailCheck, passwordRegex} = require("../validations/validator.js")



const createProfile = async function (req, res){
    try{
        let body = req.body
        let {fullName, userName, DOB, email, password, mobileNo, profileImage, bio, followerCount, followingCount, followerList, followingList, postCount, postData, location, blockedAccs} = body

    }catch(error){
        res.status(500).send({status : false, message : error.message})
    }
}



const loginUser = async function (req, res) { 
    try {
       
        let { email, mobileNo, password } = req.body

      
        if (!emptyBody(req.body)) return res.status(400).send({ status: false, message: "Please provide login details!" })

        
        if (!isValid(email)) return res.status(400).send({ status: false, message: "email is not present!" })
       
        if (!emailRegex(email)) return res.status(400).send({ status: false, message: "email is invalid!" })

       
        if (!isValid(password)) return res.status(400).send({ status: false, message: "password is not present!" })
       
        if (!passwordRegex(password)) return res.status(400).send({ status: false, message: "Password must be 8 to 15 characters and in alphabets and numbers only!" })                     

       
        let user = await userModel.findOne({ email: email })
        if (!user) return res.status(404).send({ status: false, message: `${email} is not present in the Database!`})

        
        let passwordCheck = await bcrypt.compare(req.body.password, user.password)

        if (!passwordCheck) return res.status(400).send({ status: false, message: "password is not correct!" })


      
        let token = jwt.sign(
            {
                userId: user._id.toString(),
                group: "codeZinger",
                project: "SocialMedia",
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 480 * 60 * 60
            },
            "group01-project6"              // Secret Key 
        )

       
        return res.status(201).send({ status: true, data: { userId: user._id, token } })
    }
    catch (err) {
        console.log("This is the error:", err.message)
        return res.status(500).send({ status: false, message: err.message })
    }
}