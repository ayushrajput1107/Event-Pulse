const mongoose = require("mongoose");
const OrganizerApplication = require("../models/organizerApplication.model.js");
const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");



class OrganizerApplicationService{

    async apply(userId, applicationData){
        const user = await User.findById(userId);

        if(!user)throw new ApiError(401,"User not found!");
        if(user.authorization.role !== "ATTENDEE"){
            throw new ApiError(401,"Only attendees can apply to become organizers.")
        }

        const existingApplication = await OrganizerApplication.findOne({applicant: userId,status: {
            $in:[
                "PENDING",
                "UNDER_REVIEW",
            ],
        }});


        if(existingApplication)throw new ApiError(401,"You already have a pending Application");

        const application = await OrganizerApplication.create({
           applicant: userId,
           organization: applicationData.organization,
           eventExperience: applicationData.eventExperience,
           socialLinks: applicationData.socialLinks,
           documents: applicationData.documents,
        });
        return application;
    }

    async getMyApplication(userId){
        const application = await OrganizerApplication.findOne({ applicant: userId, 

        }).populate( "reviewedBy",
            "profile.firstName profile.lastName auth.email"
        );

        if(!application){
            throw new ApiError(404,"No organizer application found.");
        }

        return application;
    }



    async getAllApplications(){
        const applications = await OrganizerApplication.find()
        .populate("applicant","profile.firstName profile.lastName auth.email authorization.role"

        ).populate("reviewedBy","profile.firstName profile.lastName"

        ).sort({
            createdAt: -1,
        })

        return applications;
    }



    async approveApplication(applicationId, adminId){
        const session = await mongoose.startSession();

        session.startTransaction();

        try{
            const application = await OrganizerApplication.findById(applicationId).session(session);
            if(!application)throw new ApiError(404,"Application not found.");
            if(application.status === "APPROVED")throw new ApiError(400,"Application already approved.");
            if(application.status === "REJECTED")throw new ApiError(400,"Rejected application cannot be approved.");

            const user = await User.findById(application.applicant).session(session);

            if(!user)throw new ApiError(404, "User not found.");

            application.status = "APPROVED";
            application.reviewedBy = adminId;
            application.reviewedAt = new Date();

            await application.save({session});

            user.authorization.role = "VERIFIED_ORGANIZER";

            await user.save({session});

            await session.commitTransaction();

            session.endSession();
            return application;
        } catch (error){
            await session.abortTransaction();

            session.endSession();
            throw error;
        }
    }



    async rejectApplication(applicationId, adminId, reviewNotes){
        const application = await OrganizerApplication.findById(applicationId);

        if(!application)throw new ApiError(404, "Application not found.");

        if(application.status === "APPROVED")throw new ApiError(400,"Approved application cannot be rejected.");
        if(application.status === "REJECTED")throw new ApiError(400,"Application already rejected");

        application.status = "REJECTED";
        application.reviewedBy = adminId;
        application.reviewedAt = new Date();
        application.reviewNotes = reviewNotes || "";
        await application.save();

        return application;
    }




}

module.exports = new OrganizerApplicationService();