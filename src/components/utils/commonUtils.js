const Admin = require("../admin/model/adminModel");
// const User = require("../user/model/userModel");
const appStrings = require("../utils/appString");
const Validator = require("validatorjs");

//========================Error Response===========================//
const sendErrorResponse = (req, res, message, data = null, status = 400) => {
    return res.status(status).json({
        success: false,
        message,
        data
    });
}


//========================Sucess Response===========================//

const sendSuccessResponse = (req, res, message = null, data = null, status = 200) => {
    return res.status(status).json({
        success: true,
        message,
        data,
    })
};


//=========================Set access token cookie ==================//

function storeAcessTokenInCookie(res, name, tokenValue) {
    res.cookie(name, tokenValue, {
        httpOnly: true,
        sameSite: "lax",
    });
}


// ===========================Set refresh token cookie====================//

function storeRefreshTokenInCookie(res, name, tokenValue) {
    res.cookie(name, tokenValue, {
        httpOnly: true,
        sameSite: "lax",
    });
}

const routeArray = (array_, prefix, isAdmin = false) => {
  const middelwareIndex = require("../../middelware/index");
  array_.forEach((route) => {
    const method = route.method;
    const path = route.path;
    const controller = route.controller;
    const validation = route.validation;

    let middlewares = [];
    const isPublic = route.isPublic === undefined ? false : route.isPublic;
    console.log("public", isPublic)
    if (!isPublic) {
      middlewares.push(middelwareIndex.verifyAcessToken);
      // if (isAdmin) {
      //   middlewares.push(checkAdmin);
      // } else {
      //   middlewares.push(checkUser);
      // }
    }
    
    if (validation) {
      if (Array.isArray(validation)) {
        middlewares.push(...validation);
      } else {
        middlewares.push(validation);
      }
    }
    middlewares.push(controller);
    prefix[method](path, ...middlewares);
  });

  return prefix;
};

// const checkAdmin = async (req, res, next) => {
//   const id = req.userId;

//   const user = await User.findById(id);
//   if (user) {
//     return res.status(400).json({
//       success: false,
//       message: appStrings.USER_NOT_AUTHORIZED,
//     });
//   }
//   const admin = await Admin.findById(id);
//   if (!admin) {
//     return res.status(400).json({
//       success: false,
//       message: appStrings.USER_NOT_AUTHORIZED,
//     });
//   }
//   req.admin = admin;
//   next();
// };
// const checkUser = async (req, res, next) => {
//   const id = req.userId;
//   const admin = await Admin.findById(id);
//   if (admin) {
//     return res.status(400).json({
//       success: false,
//       message: appStrings.ADMIN_NOT_AUTHORIZED,
//     });
//   }

//   const user = await User.findById(id);
//   if (!user) {
//     return res.status(400).json({
//       success: false,
//       message: appStrings.ADMIN_NOT_AUTHORIZED,
//     });
//   }
//   req.user = user;
//   next();
// };




const validatorUtilWithCallback = (req, res, next, rules) => {
    const validation = new Validator(req.body, rules);
    if (validation.passes()) {
        next();
    } else {
        return sendErrorResponse(req, res, "Validation failed", validation.errors.all(), 422);
    }
};

module.exports = {
    sendErrorResponse,
    sendSuccessResponse,
    storeAcessTokenInCookie,
    storeRefreshTokenInCookie,
    routeArray,
    validatorUtilWithCallback
};