const express = require("express");
const authenticate = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");
const organizerApplicationController = require("../controllers/organizerApplication.controller.js");
const adminController = require("../controllers/admin.controller.js");
const router = express.Router();


router.get("/users", authenticate, authorize("ADMIN"), adminController.getAllUsers);
router.patch("/users/:userId/suspend",authenticate,authorize("ADMIN"),adminController.suspendUser);
router.patch("/users/:userId/activate",authenticate,authorize("ADMIN"),adminController.activateUser);
router.get("/organizer-applications",authenticate,authorize("ADMIN"),organizerApplicationController.getAllApplications);
router.patch("/organizer-applications/:applicationId/approve",authenticate,authorize("ADMIN"),organizerApplicationController.approveApplication);
router.patch("/organizer-applications/:applicationId/reject",authenticate,authorize("ADMIN"),organizerApplicationController.rejectApplication);


module.exports = router;