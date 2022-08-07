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

<<<<<<< HEAD
const isValidPassword = (password) => {
    if ( password.length < 8 || password.length > 15) {
        return false
    }
    return true
}

module.exports = {isValid, emptyBody, emailCheck, isValidPassword}
=======
const passwordRegex = (value) => {
    let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/
    ;
    if (passwordRegex.test(value))
      return true;
  }


module.exports = {isValid, emptyBody, emailCheck, passwordRegex}
>>>>>>> cfc5fb8179c5c1186fb1233864cb7c6388edb70d
