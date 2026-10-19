const organizerApplicationService = require("../services/organizerApplication.service.js");
// const OrganizerApplicationService = require("../services/organizerApplication.service.js");
const asyncHandler = require("../utils/asyncHandler.js");

class OrganizerApplicationController{

    apply = asyncHandler(async (req,res) => {
        const application = await organizerApplicationService.apply(
            req.user._id,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully.",
            data: application,
        });

    });


    getMyApplication = asyncHandler(async (req,res) => {
        const application = await organizerApplicationService.getMyApplication(req.user._id);
        return res.status(200).json({
            success: true,
            data: application,
        });
    });


    approveApplication = asyncHandler(async (req,res) => {
        const application = await organizerApplicationService.approveApplication(req.params.applicationId,req.user._id);
        return res.status(200).json({
            success: true,
            message: "Organizer application approved successfully.",
            data: application,
        });
    });


    rejectApplication = asyncHandler(async (req,res) => {
        const { reviewNotes } = req.body;
        const application = await organizerApplicationService.rejectApplication(req.params.applicationId,req.user._id,reviewNotes);

        return res.status(200).json({
            success: true,
            message: "Organizer application rejected successfully.",
            data: application,
        });

    });


    getAllApplications = asyncHandler(async (req,res) =>{
        const applicantions = await organizerApplicationService.getAllApplications();
        return res.status(200).json({
            success: true,
            data : applicantions,
        });
    });


}

module.exports = new OrganizerApplicationController();