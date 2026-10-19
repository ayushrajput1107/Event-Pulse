const mongoose = require('mongoose');


const basicInfoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxLength: 150,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        
        },

        category: {
            type: String,
            enum: [
                "TECH",
                "WORKSHOP",
                "HACKATHON",
                "SEMINAR",
                "SPORTS",
                "CULTURAL",
                "OTHER",
            ],
            required: true,
        },

        tags: {
            type: [String],
            default: [],
        },

        banner: {
            type: String,
            default: null,
        },
    },
    { _id: false}
);



const scheduleSchema = new mongoose.Schema(
    {
        registrationStart: {
            type: Date,
            required: true,
        },

        registrationEnd: {
            type: Date,
            required: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },
    },

    { _id: false}
);


const venueSchema = new mongoose.Schema(
    {
        mode: {
            type: String,
            enum: ["ONLINE","OFFLINE","HYBRID"],
            required: true,
        },

        venueName: {
            type: String,
            default: null,
        },

        address: {
            type: String,
            default: null,
        },

        city: {
            type: String,
            default: null,
        },

        meetingLink: {
            type: String,
            default: null,
        },
    },
    { _id: false}
);



const capacitySchema = new mongoose.Schema(
    {
        totalSeats: {
            type: Number,
            required: true,
            min: 1,
        },

        availableSeats: {
            type: Number,
            required: true,
        },

        waitlistEnabled: {
            type: Boolean,
            default: false,
        },

        waitlistLimit: {
            type: Number,
            default: 0,
        },
    },
    { _id: false}
);


const registrationSchema = new mongoose.Schema(
    {
        requiresApproval: {
            type: Boolean,
            default: false,
        },

        maxTicketsPerUser: {
            type: Number,
            default: 1,
            min: 1,
        },
    },
    {_id: false}
);


const policySchema = new mongoose.Schema(
    {
        cancellationAllowed: {
            type: Boolean,
            default: true,
        },

        refundAllowed: {
            type: Boolean,
            default: false,

        },

        terms: {
            type: String,
            default: "",
        },
    },

    { _id: false}
)



const analyticsSchema = new mongoose.Schema(
    {
        views: {
            type: Number,
            default: 0,
        },

        registrations: {
            type: Number,
            default: 0,
        },

        checkIns: {
            type: Number,
            default: 0,
        },
    },

    {_id: false}
);

const eventSchema = new mongoose.Schema(
    {
        basicInfo: {
            type: basicInfoSchema,
            required: true,
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        schedule: {
            type: scheduleSchema,
            required: true,
        },

        venue: {
            type: venueSchema,
            required: true,
        },

        capacity: {
            type: capacitySchema,
            required: true,
        },

          registration: {
      type: registrationSchema,
      default: {},
    },

    policy: {
      type: policySchema,
      default: {},
    },

    analytics: {
      type: analyticsSchema,
      default: {},
    }, 

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PUBLISHED",
        "REGISTRATION_OPEN",
        "REGISTRATION_CLOSED",
        "ONGOING",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "DRAFT",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    },
    {
    timestamps: true,
    versionKey: false,
  }
)


eventSchema.index({ organizer: 1 });

eventSchema.index({ status: 1 });

eventSchema.index({ "basicInfo.category": 1 });

eventSchema.index({ "schedule.startDate": 1 });

eventSchema.index({
  organizer: 1,
  status: 1,
});


const Event = mongoose.model("Event", eventSchema);

module.exports = Event;