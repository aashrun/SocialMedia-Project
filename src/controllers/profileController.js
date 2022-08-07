const profileModel = require("../models/profileModel.js")
const bcrypt = require("bcrypt")
const {isValid, emptyBody, emailCheck, isValidPassword, idMatch, onlyNumbers, isValidMobileNum, profileImageCheck, userNameCheck} = require("../validations/validator.js")



//=======================================  Creating a Profile  ======================================//

const createProfile = async function (req, res){
    try{
        let body = req.body
        if(!emptyBody(body)) return res.status(400).send({status : false, message : "Body cannot be empty!"})

        let {fullName, userName, DOB, email, password, mobileNo, bio, location} = body
        let files = req.files


        if(!fullName) return res.status(400).send({status : false, message : "Full Name is required!"})
        if(!isValid(fullName)) return res.status(400).send({status : false, message : "Invalid full name!"})
        body.fullName = body.fullName.trim().split(" ").filter(word => word).join(" ")


        if(!userName) return res.status(400).send({status : false, message : "Username is required!"})
        if(!userNameCheck(userName)) return res.status(400).send({status : false, message : "Invalid userName!"})
        let uniqueUsername = await profileModel.findOne({userName : userName})
        if(uniqueUsername) return res.status(409).send({status : false, message : "This username is already taken!"})


        if(!DOB) return res.status(400).send({status : false, message : "DOB is required!"})
        //Logic later


        if(!email) return res.status(400).send({status : false, message : "Email is required!"})
        if(!emailCheck(email)) return res.status(400).send({status: false, message: "Invalid email format!"})
        let uniqueEmail = await profileModel.findOne({email: email})
        if(uniqueEmail) return res.send(409).send({status: false, message: "This email altready exists in the database!"})


        if(!password) return res.status(400).send({status : false, message : "Password is required!"})
        if(!isValidPassword(password)) return res.status(400).send({status: false, message: "Password should have characters between 8 to 15 and should contain alphabets and numbers only!"})
        const salt = await bcrypt.genSalt(10)
        body.password = await bcrypt.hash(data.password, salt)


        if(mobileNo){
        if(!onlyNumbers(mobileNo)) return res.status(400).send({status: false, message: "The key 'mobileNo' should contain numbers only!"})
        if(!isValidMobileNum(mobileNo)) return res.status(400).send({status: false, message: "This number is not an Indian mobile number!"})
        let uniqueMobile = await profileModel.findOne({mobileNo: mobileNo})
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
            if(!isValid(location)) return res.status(400).send({status: false, message: "Invalid location format!"})
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


        if (email && mobileNo) return res.status(400).send({ status: false, message: "Please enter only mobile no. or email with password to login!" })


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

        if (!passwordCheck) return res.status(400).send({ status: false, message: "password is not correct!" })


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

module.exports = {createProfile, loginUser}