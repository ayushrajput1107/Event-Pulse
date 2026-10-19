const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/auth.middleware");
const organizerApplicationController = require("../controllers/organizerApplication.controller");
const authorize = require("../middlewares/authorize.middleware.js");

router.post("/apply",authenticate,organizerApplicationController.apply);
router.get("/my-application",authenticate,organizerApplicationController.getMyApplication);
module.exports = router;