const express = require('express');
const router = express.Router();

const authenticate = require("../middlewares/auth.middleware.js");
const authorize = require("../middlewares/authorize.middleware.js");
const eventController = require('../controllers/event.controller.js');


router.get("/",eventController.getPublicEvents);
router.post("/",authenticate,authorize("VERIFIED_ORGANIZER"),eventController.createEvent);
router.get("/my-events",authenticate,authorize("VERIFIED_ORGANIZER"),eventController.getMyEvents);
router.get("/:eventId",eventController.getEventById);
router.patch("/:eventId",authenticate,authorize("VERIFIED_ORGANIZER"),eventController.updateEvent);
router.patch("/:eventId/delete",authenticate,authorize("VERIFIED_ORGANIZER"),eventController.deleteEvent);
router.patch("/:eventId/publish",authenticate,authorize("VERIFIED_ORGANIZER"),eventController.publishEvent);
router.patch("/:eventId/open-registration",authenticate,authorize("VERIFIED_ORGANIZER"),eventController.openRegistration);
router.patch("/:eventId/close-registration",authenticate,authorize("VERIFIED_ORGANIZER"),eventController.closeRegistration);
router.patch("/:eventId/start",authenticate,authorize("VERIFIED_ORGANIZER"),eventController.startEvent);
router.patch("/:eventId/complete",authenticate,authorize("VERIFIED_ORGANIZER"),eventController.completeEvent);
router.patch("/:eventId/cancel",authenticate,authorize("VERIFIED_ORGANIZER"),eventController.cancelEvent);

module.exports = router;