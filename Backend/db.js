require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

const checkIndexes = async () => {
  try {
      const indexes = await mongoose.connection.collection('users').indexInformation();
      console.log("Current indexes:", indexes);
  } catch (error) {
      console.error("Error checking indexes:", error.message);
  }
};

const dropGithubIdIndex = async () => {
  try {
      await mongoose.connection.collection('users').dropIndex('githubId_1').catch(err => {
          console.error('Error dropping index:', err.message);
      });
      console.log("Dropped 'githubId' index if it existed.");
  } catch (error) {
      console.error("Error dropping index:", error.message);
  }
};

const connectToMongo = async () => {
  try {
      await mongoose.connect(uri); // Removed deprecated options
      console.log("Connected to MongoDB successfully");
      await checkIndexes();
      await dropGithubIdIndex();
  } catch (error) {
      console.error("Error connecting to MongoDB:", error.message);
  }
};

module.exports = connectToMongo;
