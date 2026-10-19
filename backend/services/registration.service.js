const mongoose = require("mongoose");
const Registration = require("../models/registration.model.js");
const Event = require("../models/event.model.js");
const ApiError = require("../utils/ApiError.js");

class RegistrationService {

    async register(userId, eventId, ticketCount = 1) {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new ApiError(400, "Invalid Event Id!");
        }

        if (!Number.isInteger(ticketCount) || ticketCount < 1) {
            throw new ApiError(400, "Ticket count must be a positive Integer.");
        }

        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const event = await Event.findOne({
                _id: eventId,
                isDeleted: false,
            });

            if (!event) {
                throw new ApiError(404, "Event not found!");
            }

            if (event.status !== "REGISTRATION_OPEN") {
                throw new ApiError(400, "Registration is not currently open for this event!");
            }

            if (ticketCount > event.registration.maxTicketsPerUser) {
                throw new ApiError(400, `You can register for maximum ${event.registration.maxTicketsPerUser}`);
            }

            const existingRegistartion = await Registration.findOne({
                event: eventId,
                user: userId,
            });

            if (existingRegistartion) {
                throw new ApiError(409, "You are already registered for this event!");
            }

            if (event.capacity.availableSeats < ticketCount) {
                throw new ApiError(400, "Not enough seats available!");
            }

            const registrationStatus = event.registration.requiresApproval ? "PENDING" : "CONFIRMED";

            const registration = await Registration.create(
                [{
                    event: eventId,
                    user: userId,
                    ticketCount,
                    status: registrationStatus,
                }], { session }
            );

            if (registrationStatus === "CONFIRMED") {
                event.capacity.availableSeats -= ticketCount;
            }


            event.analytics.registrations += 1;
            await event.save(session);
            await session.commitTransaction();
            return registration[0];


        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }




    async getMyRegistrations(userId) {
        const registrations = await Registration.find({
            user: userId,
        }).populate("event", "basicInfo schedule venue capacity status").sort({ createdAt: -1 });

        return registrations;
    }


    async cancelRegistration(userId, registrationId) {

        if (!mongoose.Types.ObjectId.isValid(registrationId)) {
            throw new ApiError(400, "Invalid registration ID.");
        }

        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const registration = await Registration.findOne({
                _id: registrationId,
                user: userId,
            }).session(session);

            if (!registration) {
                throw new ApiError(404, "Registration not found.");
            }

            if (registration.status === "CANCELLED") {
                throw new ApiError(
                    400,
                    "Registration is already cancelled."
                );
            }

            if (registration.status === "REJECTED") {
                throw new ApiError(
                    400,
                    "Rejected registration cannot be cancelled."
                );
            }

            const event = await Event.findOne({
                _id: registration.event,
                isDeleted: false,
            }).session(session);

            if (!event) {
                throw new ApiError(404, "Event not found.");
            }

            if (!event.policy.cancellationAllowed) {
                throw new ApiError(
                    400,
                    "Cancellation is not allowed for this event."
                );
            }

            registration.status = "CANCELLED";
            registration.cancelledAt = new Date();

            await registration.save({ session });

            event.capacity.availableSeats += registration.ticketCount;

            event.analytics.registrations -= 1;

            await event.save({ session });

            await session.commitTransaction();

            return registration;

        } catch (error) {

            if (session.inTransaction()) {
                await session.abortTransaction();
            }

            throw error;

        } finally {
            await session.endSession();
        }
    }



    async getEventRegistrations(userId, eventId) {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            throw new ApiError(400, "Invalid event Id");
        }

        const event = await Event.findOne({
            _id: eventId,
            isDeleted: false,
        });

        if (!event) {
            throw new ApiError(404, "Event not Found!");
        }

        if (event.organizer.toString() !== userId.toString()) {
            throw new ApiError(403, "you are not allowed to perform this action");
        }

        const registrations = await Registration.find({
            event: eventId,
        }).populate(
            "user",
            "profile.firstName profile.lastName auth.email"
        ).sort({ created: -1 });


        return registrations;
    }



    async approveRegistartions(userId, registrationId) {
        if (!mongoose.Types.ObjectId.isValid(registrationId)) {
            throw new ApiError(400, "Invalid registration ID.");
        }

        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const registration = await Registration.findById(
                registrationId
            ).session(session);

            if (!registration) {
                throw new ApiError(404, "Registartion not found!");
            }

            if (registration.status !== "PENDING") {
                throw new ApiError(400, "Only pending registration can be approved");
            }

            const event = await Event.findOne({
                _id: registration.event,
                isDeleted: false,
            }).session(session);

            if (!event) {
                throw new ApiError(404, "Event not found!");
            }

            if (event.organizer.toString() !== userId.toString()) {
                throw new ApiError(403, "You are not allowed to approve registrations for this event");
            }

            if (event.capacity.availableSeats < registration.ticketCount) {
                throw new ApiError(400, "Not enough seats available to approve this registrations.");
            }


            registration.status = "CONFIRMED";

            await registration.save({ session });

            event.capacity.availableSeats -= registration.ticketCount;

            await event.save({ session });
            await session.commitTransaction();

            return registration;
        } catch (error) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }

            throw error;
        } finally {
            await session.endSession();
        }

    }


    async rejectRegistration(userId, registrationId, reviewNotes = "") {
        if (!mongoose.Types.ObjectId.isValid(registrationId)) {
            throw new ApiError(400, "Invalid registration ID.");
        }

        const registration = await Registration.findById(registrationId);

        if (!registration) {
            throw new ApiError(404, "Registration not found!");
        }

        if (registration.status !== "PENDING") {
            throw new ApiError(400, "Only Pending registrations can be rejected!");
        }

        const event = await Event.findOne({
            _id: registration.event,
            isDeleted: false,
        });

        if (!event) throw new ApiError(404, "Event not found!");

        if (event.organizer.toString() !== userId.toString())
            throw new ApiError(403, "You are not allowed to reject registrations for this event.");

        registration.status = "REJECTED";

        await registration.save();
        return registration;


    }




}


module.exports = new RegistrationService();