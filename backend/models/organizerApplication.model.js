const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true,
        },

        website: {
            type:String,
            default:null,
        },

        description:{
            type: String,
            required: true,
            trim: true,
        },
    },

    { _id: false}
);


const eventExperienceSchema = new mongoose.Schema(
    {
        totalEventsHosted: {
            type: Number,
            default: 0,
            min: 0,
        },

        largestAudience: {
            type: Number,
            default: 0,
            min: 0,
        },

        experienceDescription: {
            type: String,
            required: true,
            trim: true,
        },
    },

    { _id: false}
);


const socialLinksSchema = new mongoose.Schema(
    {
        linkedin: {
            type: String,
            default: null
        },

        github: {
            type: String,
            default: null,
        },

        portfolio: {
            type: String,
            default: null,
        },
    },

    { _id: false}
);


const documentSchema = new mongoose.Schema(
    {
        documentType: {
            type: String,
            enum: [
                "COLLEGE_ID",
                "ORGANIZATION_PROOF",
                "GOVERNMENT_ID",
                "OTHER",
            ],
            required: true,
        },

        documentUrl: {
            type: String,
            required: true,
        },
    },

    { _id: false}
);


const organizerApplicationSchema = new mongoose.Schema(
    {
        applicant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        organization: {
            type: organizationSchema,
            required: true,
        },

        eventExperience: {
            type: eventExperienceSchema,
            required: true,
        },

        socialLinks: {
            type: socialLinksSchema,
            default: {},
        },

        documents: {
            type: [documentSchema],
            required: true,
            validate: {
                validator: function (docs) {
                    return docs.length > 0;
                },
                message: "At least one document is required."
            }
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "UNDER_REVIEW",
                "APPROVED",
                "REJECTED",
            ],

            default: "PENDING",
        },
      
        reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewNotes: {
      type: String,
      default: "",
      trim: true,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    },

    {
        timestamps: true,
        versionKey: false,
    }
);


organizerApplicationSchema.index({ applicant: 1 },{ unique: true});

organizerApplicationSchema.index({ status: 1 });

organizerApplicationSchema.index({
  applicant: 1,
  status: 1,
});

const OrganizerApplication = mongoose.model(
  "OrganizerApplication",
  organizerApplicationSchema
);

module.exports = OrganizerApplication;
