const eventService = require("../services/event.service.js");
const registrationService = require("../services/registration.service.js");
const asyncHandler = require("../utils/asyncHandler.js");


class EventController{

    getPublicEvents = asyncHandler(async (req,res) => {
        const events = await eventService.getPublicEvents();
        return res.status(200).json({
            success: true,
            data: events
        });
    });


    completeEvent = asyncHandler(async(req,res) => {
        const event = await eventService.completeEvent(
            req.user._id,
            req.params.eventId
        );

        return res.status(200).json({
            success: true,
            message: "Event completed successfully!",
            data: event,
        });
    })


    startEvent = asyncHandler(async (req,res) => {
        
        const event = await eventService.startEvent(
            req.user._id,
            req.params.eventId
        );

        return res.status(200).json({
            success: true,
            message: "Event started successfully",
            data: event,
        })
    })

    closeRegistration = asyncHandler(async (req,res) => {
        const event = await eventService.closeRegistration(
            req.user._id,
            req.params.eventId
        )

        return res.status(200).json({
            success: true,
            message: "Event registration closed successfully.",
            data: event,
        })
    })


    openRegistration = asyncHandler(async (req,res) => {
        const event = await eventService.openRegistration(
            req.user._id,
            req.params.eventId
        );

        return res.status(200).json({
            success: true,
            message: "Event Registration opened successfully",
            data: event,
        });
    });


    publishEvent = asyncHandler(async (req,res) => {
        const event = await eventService.publishEvent(
            req.user._id,
            req.params.eventId
        );

        return res.status(200).json({
            success: true,
            message: "Event published successfully",
            data: event,
        });
    });



    deleteEvent = asyncHandler(async (req,res) => {
        const event = await eventService.deleteEvent(
            req.user._id,
            req.params.eventId
        );

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully!",
            data: event,
        });
    });

    cancelEvent = asyncHandler(async (req,res) => {
        const event = await eventService.cancelEvent(
            req.user._id,
            req.params.eventId
        );

        return res.status(200).json({
            success: true,
            message: "Event cancelled successfully!",
            data: event,
        });
    });


    updateEvent = asyncHandler(async(req,res) => {
        const event = await eventService.updateEvent(
            req.user._id,
            req.params.eventId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: event,
        });
    });


    getEventById = asyncHandler(async (req,res) => {
        const event = await eventService.getEventById(req.params.eventId);
        return res.status(200).json({
            success: true,
            data: event,
        });
    });
    

    createEvent = asyncHandler(async(req,res) => {
        const event = await eventService.createEvent(req.user._id,req.body);
        return res.status(201).json({
            success: true,
            message: "Event created successfully.",
            data: event,
        });
    });

    getMyEvents = asyncHandler(async (req,res) => {
        const events = await eventService.getMyEvents(req.user._id);

        return res.status(200).json({
            success: true,
            data : events,
        });
    });
}



module.exports = new EventController();