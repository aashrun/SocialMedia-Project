const mongoose = require('mongoose');


const profileSchema = new mongoose.Schema({
    fullName : {
        type : String,
        required : true
        
    },
    userName : {
        type : String,
        required : true,
        unique : true,
        min : 4,
        max : 15
    },
    DOB : {
        type : Date,
        required : true
    },
    gender : {
        type : String,
        required : true,
        enum : ["male", "female", "other"]
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    mobileNo : {
        type : Number,
        unique : true
    },
    profileImage :  {
        type : String,
        default : null
    },
    bio : {
        type : String
    },
    followerCount :  {
        type : Number,
        default : 0
    },
    followingCount : {
        type : Number,
        default : 0
    },
    followerList : {
        type : Array,
        default : []
    },
    followingList : {
        type : Array,
        default : []
    },
    postCount : {
        type : Number,
        default : 0
    },
    postData : {
        type : Array,
        default : []
    },
    location : {
        type : String
    },
    blockedAccs : {
        type : Array,
        default : []
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    deletedAt : {
        type : Date,
        default : null
    },

    
}, {timestamps : true})

module.exports = mongoose.model('Profile', profileSchema)