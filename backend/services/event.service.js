const mongoose = require("mongoose");
const Event = require("../models/event.model.js");
const User = require("../models/user.model.js");
const ApiError = require("../utils/ApiError.js");

class EventService{

    async getPublicEvents(){
        const events = await Event.find({
            isDeleted:false,
            status:{
                $in: [
                    "PUBLISHED",
                    "REGISTRATION_OPEN"
                ]
            }
        }).populate(
            "organizer",
            "profile.firstName profile.lastName"
        ).sort({created: -1});


        return events;
    }


    async completeEvent(userId,eventId){
        if(!mongoose.Types.ObjectId.isValid(eventId)){
            throw new ApiError(400,"Invalid event Id.")
        }
        const event = await Event.findOne({
            _id: eventId,
            isDeleted: false,
        });

        if(!event){
            throw new ApiError(404,"Event not found!");
        }

        if(event.organizer.toString() !== userId.toString()){
            throw new ApiError(403,"You are not allowed to complete this action!")
        }

        if(event.status !== "ONGOING"){
            throw new ApiError(400,"only ongoing events can be completed!");
        }
        const now = new Date();

        if(now < event.schedule.endDate){
            throw new ApiError(400,"Event end time has not been reached yet");
        }


        event.status = "COMPLETED";
        await event.save();
        return event;
    }


    async startEvent(userId,eventId){
        if(!mongoose.Types.ObjectId.isValid(eventId)){
            throw new ApiError(400,"Invalid Event ID!");
        }

        const event = await Event.findOne({
         _id: eventId,
         isDeleted: false,
        })

        if(!event){
            throw new ApiError(404,"Event not found!");
        }

        if(event.organizer.toString() !== userId.toString()){
            throw new ApiError(403,"you are not allowed to perform this action!");
        }

        if(event.status !== "REGISTRATION_CLOSED"){
            throw new ApiError(400,"Only events with closed registrations can be started");
        }

        const now = new Date();

        // if(now < event.schedule.startDate){
        //     throw new ApiError(400,"Event start time is not reached!");
        // }

        event.status = "ONGOING";

        await event.save();
        return event;
    }


    async closeRegistration(userId, eventId){
        if(!mongoose.Types.ObjectId.isValid(eventId)){
            throw new ApiError(400,"Invalid event ID.");
        }

        const event = await Event.findOne({
            _id: eventId,
            isDeleted: false,
        });

        if(!event)throw new ApiError(404,"Event not found!");

        if(event.organizer.toString() !== userId.toString()){
            throw new ApiError(403,"You are not allowed to close registration for this event.")
        }

        if(event.status !== "REGISTRATION_OPEN"){
            throw new ApiError(400,"Registratino is not currently open for this event.");
        }

        event.status = "REGISTRATION_CLOSED";

        await event.save();
        return event;
    }


    async openRegistration(userId, eventId){

        if(!mongoose.Types.ObjectId.isValid(eventId)){
            throw new ApiError(400,"Invalid event ID.");
        }

        const event = await Event.findOne({
            _id: eventId,
            isDeleted: false,
        });


        if(!event){
            throw new ApiError(404,"Event not found!");
        }

        if(event.organizer.toString() !== userId.toString()){
            throw new ApiError(403,"You are not allowed to open registration for this event.");
        }

        if(event.status !== "PUBLISHED"){
            throw new ApiError(400,"Only pusblished events can open registration.");
        }

        const now = new Date();

        if(now < event.schedule.registrationStart){
            throw new ApiError(400,"Registration start time has not been reached yet.");
        }

        if(now > event.schedule.registrationEnd){
            throw new ApiError(400,"Registartion period has already ended.");
        }

        event.status = "REGISTRATION_OPEN";

        await event.save();

        return event;


    }


    async publishEvent(userId, eventId){
        if(!mongoose.Types.ObjectId.isValid(eventId)){
            throw new ApiError(400,"Invalid Event Id!");
        }

        const event = await Event.findOne({
            _id: eventId,
            isDeleted: false,
        });

        if(!event){
            throw new ApiError(404,"Event not Found!");
        }

        if(event.organizer.toString() !== userId.toString()){
            throw new ApiError(403,"you are not allowed to publish this event");
        }

        if(event.status !== "DRAFT"){
            throw new ApiError(400,"Only drafts can be published!");
        }

        event.status = "PUBLISHED";

        await event.save();

        return event;
    }



    async deleteEvent(userId, eventId){
        if(!mongoose.Types.ObjectId.isValid(eventId)){
            throw new ApiError(400,"Invalid event Id.")
        }

        const event = await Event.findOne({
            _id: eventId,
            isDeleted: false,
        });

        if(!event) throw new ApiError(404,"Event not found!");

        if(event.organizer.toString() !== userId.toString()){
            throw new ApiError(403,"You are not allowed to delete this event");
        }

        event.isDeleted = true;
        await event.save();

        return event;

    }

    async cancelEvent(userId, eventId){
        if(!mongoose.Types.ObjectId.isValid(eventId)){
            throw new ApiError(400,"Invalid event ID.");
        }

        const event = await Event.findOne({
            _id: eventId,
            isDeleted: false,
        });

        if(!event) throw new ApiError(404,"Event not found!");

        if(event.organizer.toString() !== userId.toString()){
            throw new ApiError(403,"You are not allowed to cancel this event.");
        }

        if(event.status === "COMPLETED"){
            throw new ApiError(400,"Completed events cannot be cancelled.");
        }

        if(event.status === "CANCELLED"){
            throw new ApiError(400,"Event is already cancelled.");
        }

        event.status = "CANCELLED";
        await event.save();

        return event;
    }


    async updateEvent(userId, eventId, eventData){

        if(!mongoose.Types.ObjectId.isValid(eventId)){
            throw new ApiError(400,"Invalid event ID.");
        }

        const event = await Event.findOne({
            _id: eventId,
            isDeleted: false,
        });

        if(!event)throw new ApiError(404,"Event not found!");

        if(event.organizer.toString() !== userId.toString()){
            throw new ApiError(403,"You are not allowed to update this event.");
        }

        if(eventData.organizer || eventData.analytics){
            throw new ApiError(400,"Organizer and analytics cannot be updated");
        }

        if(eventData.basicInfo){
            event.basicInfo = {
                ...event.basicInfo.toObject(),
                ...eventData.basicInfo,
            };

        }


        if(eventData.schedule){
            event.schedule = {
                ...event.schedule.toObject(),
                ...eventData.schedule,
            };
        }

        if(eventData.venue){
            event.venue = {
                ...event.venue.toObject(),
                ...eventData.venue,
            };
        }


        if(eventData.capacity){
            if(eventData.capacity.totalSeats !== undefined){
                throw new ApiError(400,"Total seats cannot be changes after event creation!");
            }

            event.capacity = {
                ...event.capacity.toObject(),
                ...eventData.capacity,
            };
        }


        if(eventData.registration){
            event.registration = {
                ...event.registration.toObject(),
                ...eventData.registration,
            };
        }

        if(eventData.policy){
            event.policy = {
                ...event.policy.toObject(),
                ...eventData.policy,
            };
        }

        await event.save();

        return event;


    }



    async getEventById(eventId){
        const event = await Event.findOne({
            _id: eventId,
            isDeleted: false,
        }).populate("organizer","profile.firstName profile.lastName auth.email")

        if(!event)throw new ApiError(404,"Event not found.");
        return event;
    }


    async getMyEvents(userId){
        const events = await Event.find({
            organizer: userId,
            isDeleted: false,
        }).sort({created: -1});

        return events;
    }


    async createEvent(userId, eventData){
        const user = await User.findById(userId);

        if(!user){
            throw new ApiError(404, "User not found!");
        }


        if(user.authorization.role !== "VERIFIED_ORGANIZER"){
            throw new ApiError(403,"Only verified Organizers can create events.")
        }
        const totalSeats = eventData.capacity.totalSeats;
        const event = await Event.create({
            basicInfo: eventData.basicInfo,
            organizer: userId,
            schedule: eventData.schedule,
            venue: eventData.venue,

            capacity: {
                totalSeats: totalSeats,
                availableSeats: totalSeats,
        
            },

            registration: eventData.registration || {},
            policy: eventData.policy || {},
            analytics: eventData.analytics || {},

            status: "DRAFT",
        });

        return event;
         
    }

}


module.exports = new EventService();