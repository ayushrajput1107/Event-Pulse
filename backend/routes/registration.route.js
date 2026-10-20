const express = require("express");
const authenticate = require("../middlewares/auth.middleware.js");
const registrationController = require("../controllers/registration.controller.js");
const authorize = require("../middlewares/authorize.middleware.js");
const router = express.Router();

router.post("/:eventId/register", authenticate, registrationController.register);
router.get("/my-registrations", authenticate, registrationController.getMyRegistration);
router.patch("/:registrationId/cancel", authenticate, registrationController.cancelRegistration);
router.get("/event/:eventId", authenticate, authorize("VERIFIED_ORGANIZER", "ADMIN"), registrationController.getEventRegistrations);
router.patch("/:registrationId/approve", authenticate, authorize("VERIFIED_ORGANIZER", "ADMIN"), registrationController.approveRegistration);
router.patch("/:registrationId/reject", authenticate, authorize("VERIFIED_ORGANIZER", "ADMIN"), registrationController.rejectRegistration);

module.exports = router;
