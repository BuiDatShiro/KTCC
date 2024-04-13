var { check } = require('express-validator');
var util = require('util');
let options = {
    password: {
        minLength: 8,
        minNumbers: 1,
        minSymbols: 1,
        minLowercase: 1,
        minUppercase: 1
    }
}
let notifies = {
    NOTE_PASSWORD: 'password phai dai toi thieu %d ki tu, trong do co it nhat %d ki tu so, %d ki tu thuong, %d ki tu in hoa, %d ki tu dac biet'
}

module.exports = function () {
    return [
        check('password', util.format(notifies.NOTE_PASSWORD, options.password.minLength, options.password.minNumbers, options.password.minLowercase, options.password.minUppercase, options.password.minSymbols)).isStrongPassword(options.password),
    ]
}