const express = require('express');
const router = express.Router();
const profileController = require("../controllers/profileController.js")
const postController = require("../controllers/postController.js")
const MW = require("../middlewares/auth.js")





//====================================  Profile Handlers  ======================================//
router.post("/profile/register", profileController.createProfile)

router.post("/profile/login", profileController.loginUser)

router.get("/profile/:profileId/getProfile",  profileController.getProfile)

router.put("/profile/:profileId/update",  profileController.updateProfile)

router.delete("/profile/:profileId/delete", MW.authentication, MW.authorization, profileController.deleteProfile)

router.put("/profile/:profileId/follow", profileController.followProfile)

router.put("/profile/:profileId/unfollow", profileController.unfollowProfile)

router.put("/profile/:profileId/block",  profileController.blockProfile)

router.put("/profile/:profileId/unblock", MW.authentication, MW.authorization, profileController.unblockProfile)

router.put("/profile/:profileId/comment",  profileController.commentOnPost)

router.delete("/profile/:profileId/deleteComment", profileController.deleteComment)

router.put("/profile/:profileId/like", MW.authentication, MW.authorization, profileController.likePost)

router.put("/profile/:profileId/unlike", MW.authentication, MW.authorization, profileController.unlikePost)

router.get("/profile/:profileId/followerOrFollowingList", profileController.followerOrFollowingList)

router.get("/profile/:profileId/getBlockedAccount", profileController.getBlockedAccount)



//====================================  Post Handlers  =========================================//
router.post("/post/create",  postController.createPost)

router.get("/post/:profileId/getPost/:postId", MW.authentication, MW.authorization, postController.getPost)

router.get("/post/:profileId/getLikesList/:postId", MW.authentication, MW.authorization, postController.getLikesList)

router.get("/post/:profileId/getCommentsList/:postId", MW.authentication, MW.authorization, postController.getCommentsList)

router.put("/post/:profileId/updatePost/:postId", MW.authentication, MW.authorization, postController.updatePost)

router.delete("/post/:profileId/deletePost/:postId", MW.authentication, MW.authorization, postController.deletePost)


//====================================  Invalid API  ==========================================//
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        msg: "The api you requested is not available!"
    })
})


module.exports = router;