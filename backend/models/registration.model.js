const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        ticketCount: {
            type: Number,
            required: true,
            min: 1,
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "CONFIRMED",
                "REJECTED",
                "CANCELLED",
            ],
            default: "CONFIRMED",
        },

        registeredAt: {
            type: Date,
            default: Date.now,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },

        approvedAt: {
            type: Date,
            default: null,
        },

        reviewNotes: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

registrationSchema.index(
    { event: 1, user: 1 },
    { unique: true }
);

registrationSchema.index({ event: 1 });
registrationSchema.index({ user: 1 });
registrationSchema.index({ status: 1 });

const Registration = mongoose.model(
    "Registration",
    registrationSchema
);

module.exports = Registration;
