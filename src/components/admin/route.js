const adminController = require("../admin/controller/adminController")
const stepController = require("./controller/settingController")
const adminProfileController = require("./controller/adminProfileController")
const adminLeaveController = require("../admin/controller/adminLeaveController")

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

  {
    path: "/approveDoctor",
    method: "post",
    controller: adminProfileController.approveDoctor,
  },
  
  {
    path: "/doctorProfile/:id",
    method: "get",
    controller: adminProfileController.getDoctorProfile,
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
  },

  //========= Admin Leave Management ========//
  {
      path: "/leaves",
      method: "get",
      controller: adminLeaveController.getAllLeaves,
  },
  {
      path: "/leaves/:id/status",
      method: "put",
      controller: adminLeaveController.updateLeaveStatus,
  }
]