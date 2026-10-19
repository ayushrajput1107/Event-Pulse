const ApiError = require("../utils/ApiError.js");

const authorize = (...roles) => {
    return (req,res,next) => {
        if(!req.user) {
            return next(new ApiError(401,"Authentication  Required!"));
        }


        const userRole = req.user.authorization.role;

        if(!roles.includes(userRole)){
            return next(new ApiError(403,"you are not authorized to perform this action."));
        }

        next();
    };
};


module.exports = authorize;