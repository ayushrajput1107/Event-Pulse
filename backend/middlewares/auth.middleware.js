const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");

const authenticate = async(req,res,next) => {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            throw new ApiError(401,"Access token missing. ");
        }
        console.log(req.headers.authorization);

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-auth.password");

        if(!user){
            throw new ApiError(401, "User not Found.");
        }

        if(user.account.status !== "ACTIVE"){
            throw new ApiError(403,"Your account is not active.");
        }

        req.user = user;
        next();

    }catch(error){
        next(error);
    }

};

module.exports = authenticate;