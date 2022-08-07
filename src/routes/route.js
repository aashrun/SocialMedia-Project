const express = require('express');
const router = express.Router();
const profileController = require("../controllers/profileController.js")
const postController = require("../controllers/postController.js")




//====================================  Profile Handlers  ======================================//
router.post("/profile/register", profileController.createProfile)

router.post("/profile/login", profileController.loginUser)

router.get("/profile/:profileId/getProfileId", profileController.updateProfile)

router.put("/profile/:profileId/update", profileController.updateProfile)

router.delete("/profile/:profileId/delete", profileController.deleteProfile)


//====================================  Invalid API  ==========================================//
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        msg: "The api you requested is not available!"
    })
})
