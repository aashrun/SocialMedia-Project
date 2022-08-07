const express = require('express');
const router = express.Router();
const profileController = require("../controllers/profileController.js")




//====================================  Profile Handlers  ======================================//
router.post("/profile/register", profileController.createProfile)


//====================================  Invalid API  ==========================================//
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        msg: "The api you requested is not available!"
    })
})
