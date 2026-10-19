const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* ==========================
   Profile Schema
========================== */
const profileSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },

    avatar: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

/* ==========================
   Authentication Schema
========================== */
const authSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

/* ==========================
   Authorization Schema
========================== */
const authorizationSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: [
        "ADMIN",
        "VERIFIED_ORGANIZER",
        "ORGANIZER",
        "ATTENDEE",
      ],
      default: "ATTENDEE",
    },

    extraPermissions: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

/* ==========================
   Account Schema
========================== */
const accountSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "DELETED"],
      default: "ACTIVE",
    },

    suspendedUntil: {
      type: Date,
      default: null,
    },

    suspensionReason: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

/* ==========================
   User Schema
========================== */
const userSchema = new mongoose.Schema(
{
    profile: {
        type: profileSchema,
        required: true,
    },

    auth: {
        type: authSchema,
        required: true,
    },

    authorization: {
        type: authorizationSchema,
        default: () => ({
            role: "ATTENDEE",
            extraPermissions: [],
        }),
    },

    account: {
        type: accountSchema,
        default: () => ({
            status: "ACTIVE",
            suspendedUntil: null,
            suspensionReason: "",
        }),
    },

    refreshToken: {
        type: String,
        default: null,
        select: false,
    },

    refreshTokenExpiresAt: {
        type: Date,
        default: null,
    },

    loginCount: {
        type: Number,
        default: 0,
    },

    lastSeen: {
        type: Date,
        default: Date.now,
    },
},
{
    timestamps: true,
}
);

/* ==========================
   Indexes
========================== */

userSchema.index(
  {
    "auth.email": 1,
  },
  {
    unique: true,
  }
);

userSchema.index({
  "authorization.role": 1,
});

userSchema.index({
  "account.status": 1,
});

/* ==========================
   Password Hash Middleware
========================== */



userSchema.pre("save", async function () {
    if (!this.isModified("auth.password")) {
        return;
    }

    this.auth.password = await bcrypt.hash(
        this.auth.password,
        10
    );
});

/* ==========================
   Instance Methods
========================== */

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.auth.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.authorization.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    }
  );
};

// Update Last Seen
userSchema.methods.updateLastSeen = function () {
  this.lastSeen = new Date();
};

// Increment Login Count
userSchema.methods.incrementLoginCount = function () {
  this.loginCount += 1;
};

/* ==========================
   Export Model
========================== */

const User = mongoose.model("User", userSchema);

module.exports = User;