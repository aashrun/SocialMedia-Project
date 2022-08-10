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


const isValidPassword = (value) => {
    let isValidPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/;
    if (isValidPassword.test(value))
      return true;
  }

  const idMatch = function (value){
    let user = /^[0-9a-fA-F]{24}$/.test(value)
    return user
}

const onlyNumbers = function (value){
    let user = /^[0-9]+$/.test(value)
    return user
}

const isValidMobileNum = function (value) {
    let user = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(value)
    return user
};

const profileImageCheck = function (value) {
    let user = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png|\.jfif)$/i.test(value)
    return user
};

const userNameCheck = function (value) {
    let user = /^[a-zA-Z0-9._]+$/ .test(value)
    return user
};

let isValidDateFormat = function (date) {
    let dateFormatRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/

    return dateFormatRegex.test(date)
}

module.exports = {isValid, emptyBody, emailCheck, isValidPassword, idMatch, onlyNumbers, isValidMobileNum, profileImageCheck, userNameCheck, isValidDateFormat}

