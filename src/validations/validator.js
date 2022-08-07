const validator = require("email-validator");


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "object" && Object.keys(value).length === 0) return false;
    return true;
};

const emptyBody = function (value) {
    return Object.keys(value).length > 0;
};

const emailCheck = function (value) {
    if (validator.validate(value.trim())) {
        return true;
    }
    return false;
};

const isValidPassword = (password) => {
    if ( password.length < 8 || password.length > 15) {
        return false
    }
    return true
}

module.exports = {isValid, emptyBody, emailCheck, isValidPassword}