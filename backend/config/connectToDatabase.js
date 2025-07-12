const mongoose = require('mongoose');

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('Error while connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
