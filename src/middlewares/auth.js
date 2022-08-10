const jwt =require("jsonwebtoken");




//======================================  Authentication  ===========================================//

const authentication = function(req,res,next)
{
    try{
    let token = req.header("Authorization","Bearer Token")

    if(!token)return res.status(401).send({status:false, message:"Please enter token in bearer token"});
    let splittoken=token.split(" ")
    
        jwt.verify(splittoken[1],"Group-58",(error)=>{
            if(error){
            const message = error.message == "jwt expired" ? "Token is expired, please login again!" : "Please recheck your token!"
            return res.status(401).send({status:false, message});
            }
    
            next();
         });
    }
    catch(error){
        res.status(500).send({status:false, message:error.message});

    }
}





//==========================================  Authorization  ===========================================//

const authorization= async function(req,res,next){
    try{
    let token = req.header("Authorization","Bearer Token");
    let splittoken = token.split(" ")
    let newToken = jwt.verify(splittoken[1],"Group-58")
    let userId = req.params.userId

    let decodedToken = newToken._id.toString()
    let realToken = userId.toString()

    if(decodedToken !== realToken)return res.status(401).send({status :false,message: "Unauthorized access!"});
     

    next()
    }
    catch(error){
        res.status(500).send({status:false, message:error.message});

    }
}

module.exports = {authentication, authorization}