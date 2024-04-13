var express = require('express');
var router = express.Router();
var userModel = require('../schemas/user')
var checkvalid = require('../validators/auth')
var { validationResult } = require('express-validator');
var bcrypt = require('bcrypt')
var protect = require('../middlewares/protectLogin')
let sendmail = require('../helpers/sendmail')
let resHandle = require('../helpers/resHandle')
let config = require('../configs/config')
var checkpassword = require('../validators/checkPassword')
var checkemail = require('../validators/checkEmail')
var checkpasswordchange = require('../validators/checkPasswordChange')
const validationError = require('../Errors/validationErrors');
const ValidationError = require('../Errors/validationErrors');
require('express-async-errors');

router.post('/forgotpassword',checkemail() ,async function (req, res, next) {
  let email = req.body.email;
  
  var result = validationResult(req);
  if (result.errors.length > 0) {
    res.status(404).send(result.errors);
    return;
  }
  let user = await userModel.findOne({ email: email });
  if (!user) {
    resHandle(res, false, "email chua ton tai trong he thong")
    return;
  }
  let token = user.genResetPassword();
  await user.save();
  let url = `http://localhost:3001/api/v1/auth/resetpassword/${token}`
  try {
    await sendmail(user.email, url);
    resHandle(res, true, "gui mail thanh cong");
  } catch (error) {
    user.tokenResetPasswordExp = undefined;
    user.tokenResetPassword = undefined;
    await user.save();
    resHandle(res, false, error);
  }
});

router.post('/resetpassword/:token', checkpassword() ,async function (req, res, next) {
  let user = await userModel.findOne({
    tokenResetPassword: req.params.token
  })
  if (!user) {
    resHandle(res, false, "URL khong hop le");
    return;
  }
  var result = validationResult(req);
  if (result.errors.length > 0) {
    res.status(404).send(result.errors);
    return;
  }
  if (user.tokenResetPasswordExp > Date.now()) {
    user.password = req.body.password;
    user.tokenResetPasswordExp = undefined;
    user.tokenResetPassword = undefined;
    await user.save();
    resHandle(res, true, "doi mat khau thanh cong");
  } else {
    resHandle(res, false, "URL khong hop le");
    return;
  }

});


router.post('/register', checkvalid(), async function (req, res, next) {
  var result = validationResult(req);
  if (result.errors.length > 0) {
    res.status(404).send(result.errors);
    return;
  }
  
  try {
    var newUser = new userModel({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      role: ["USER"]
    })
    await newUser.save();
    res.status(200).send({
      success: true,
      data: newUser
    });
    
  }catch (error) {
    res.status(404).send({
      success: false,
      data: error
    });
  }
});

router.post('/login', async function (req, res, next) {
  let password = req.body.password;
  let username = req.body.username;
  if (!password || !username) {
    resHandle(res, false, "username va password khong duoc de trong");
    return;
  }
  var user = await userModel.findOne({ username: username });
  if (!user) {
    resHandle(res, false, "username khong ton tai");
    return;
  }
  let result = bcrypt.compareSync(password, user.password);
  if (result) {
    var tokenUser = user.genJWT();
    res.status(200).cookie('token', tokenUser, {
      expires: new Date(Date.now() + config.COOKIES_EXP_HOUR * 3600 * 1000),
      httpOnly: true
    }).send({
      success: true,
      data: tokenUser
    })
  } else {
    resHandle(res, false, "password sai");
  }
});
router.post('/changepassword', checkpasswordchange(),async function (req, res, next) {
  var result = validationResult(req);
  if (result.errors.length > 0) {
    res.status(404).send(result.errors);
    return;
  }
  let password = req.body.password;
  let username = req.body.username;
  let changepassword = req.body.changepassword;
  if (!password || !username) {
    resHandle(res, false, "username va password khong duoc de trong");
    return;
  }
  var user = await userModel.findOne({ username: username });
  if (!user) {
    resHandle(res, false, "username khong ton tai");
    return;
  }
  let checkpassword = bcrypt.compareSync(password, user.password);
  if (checkpassword) {
    user.password = changepassword;
    await user.save();
    resHandle(res, true, "doi mat khau thanh cong");
  } else {
    resHandle(res, false, "password hien tai sai");
    
  }
});
router.get('/me', protect, async function (req, res, next) {
  resHandle(res, true, req.user);
});
router.post('/logout', async function (req, res, next) {
  resHandle(res, true, "dang xuat thanh cong");
});


module.exports = router;