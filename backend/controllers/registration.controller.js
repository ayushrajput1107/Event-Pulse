const registrationService = require("../services/registration.service");
const asyncHandler = require("../utils/asyncHandler");


class RegistrationController{

        rejectRegistration = asyncHandler(async (req,res) => {
            const { reviewNotes } = req.body;
            const registration = await registrationService.rejectRegistration(
                req.user._id,
                req.params.registrationId,
                reviewNotes
            );
    
            return res.status(200).json({
                success: true,
                message: "Registrations rejected Successfully!",
                data: registration, 
            });
    
        });


    approveRegistration = asyncHandler(async (req,res) => {
        const registration = await registrationService.approveRegistartions(
            req.user._id,
            req.params.registrationId
        );

        return res.status(200).json({
            success: true,
            message: "Registration approved successfully.",
            data: registration,
        });
    });



    getEventRegistrations = asyncHandler(async (req,res) => { 
        const registrations = await registrationService.getEventRegistrations(
            req.user._id,
            req.params.eventId,
        );

        return res.status(200).json({
            success: true,
            data: registrations,
        })
    })


    cancelRegistration = asyncHandler(async (req,res) => {
        const registration = await registrationService.cancelRegistration(
            req.user._id,
            req.params.registrationId
        );

        return res.status(200).json({
            success: true,
            message: "Registration cancelled successfully",
            data: registration,
        });
    });



    getMyRegistration = asyncHandler(async (req,res) => {
        const  registrations = await registrationService.getMyRegistrations(req.user._id);
        return res.status(200).json({
            success: true,
            data: registrations,
        })
    })

    register = asyncHandler(async (req,res) => {

        const {ticketCount} = req.body;
        const registration = await registrationService.register(
            req.user._id,
            req.params.eventId,
            ticketCount || 1
        );

        return res.status(200).json({
            success: true,
            message: "Event registration successfull",
            data: registration,
        });

    });
}

module.exports = new RegistrationController();