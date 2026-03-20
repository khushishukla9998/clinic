
const adminController = require("../admin/controller/adminController")
const stepController = require("./controller/settingController")

module.exports = [


  //============= admin =============//
  {
    path: "/registerAdmin",
    method: "post",
    controller: adminController.registerAdmin,
    isPublic: true,
   // validation: adminValidation.registerValidation
  },

   {
    path: "/loginAdmin",
    method: "post",
    controller: adminController.adminLogin,
    isPublic: true,
    //validation: adminValidation.loginValidation
  },


  //================steps===================//

  {
    path: "/createStep",
    method: "post",
    controller: stepController.createStep,
    // isPublic: true,
    //validation: adminValidation.loginValidation
  },
]