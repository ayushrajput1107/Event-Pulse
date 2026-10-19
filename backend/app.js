const express = require('express');
const cors = require('cors');
const authRoutes = require("./routes/auth.routes.js");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/error.middleware.js");
const registrationRoutes = require("./routes/registration.route.js");
const adminRoutes = require("./routes/admin.routes.js");
const eventRoutes = require("./routes/event.route.js");
const organizerApplicationRoutes = require("./routes/organizerApplication.routes.js");

const app = express();

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use("/api/organizer",organizerApplicationRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/events",eventRoutes);
app.use("/api/registrations",registrationRoutes);
app.use(errorMiddleware);


module.exports = app;