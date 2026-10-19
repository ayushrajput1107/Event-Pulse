const express = require('express');
const router = express.Router();

const authController = require("../controllers/auth.controller.js");
const validate = require("../middlewares/validate.middleware.js");

const { registerSchema, loginSchema } = require("../validators/auth.validator.js");
const authenticate = require('../middlewares/auth.middleware.js');

router.post("/register",validate(registerSchema),authController.register);
router.patch("/change-password",authenticate,authController.changePassword);
router.post("/login",validate(loginSchema),authController.login);
router.get("/me",authenticate,authController.getCurrentUser);
router.post("/refresh",authController.refreshToken);

module.exports = router;