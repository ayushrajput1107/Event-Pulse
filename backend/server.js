require('dotenv').config();
const app = require('./app.js');
const connectDB = require('./config/db.js')
const PORT = process.env.PORT || 3000;
connectDB();
app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT} !`);
});