require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CareerVerse API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
