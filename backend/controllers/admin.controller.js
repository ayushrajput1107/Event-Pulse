const authService = require("../services/auth.services.js");
const asyncHandler = require("../utils/asyncHandler.js");

class AdminController {

    getAllUsers = asyncHandler(async (req, res) => {
        const users = await authService.getAllUsers();
        return res.status(200).json({
            success: true,
            data: users,
        });
    });

    suspendUser = asyncHandler(async (req, res) => {
        const { reason } = req.body;

        const user = await authService.suspendUser(
            req.user._id,
            req.params.userId,
            reason
        );

        return res.status(200).json({
            success: true,
            message: "User suspended Successfully.",
            data: user,
        });
    });

    activateUser = asyncHandler(async (req, res) => {

        const user = await authService.activateUser(
            req.params.userId,
        );

        return res.status(200).json({
            success: true,
            message: "User activated successfully.",
            data: user,
        });
    });

}


module.exports = new AdminController();