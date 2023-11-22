const mongoose = require('mongoose')
require('dotenv').config()

const URI = process.env.MONGO_URI || "mongodb://localhost:27017/budlight-club";

const connectToMongo = () => { 
  mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(()=> {
    console.log("connected to MongoDb successfully");
  }).catch((err)=> {
    console.log(err)
  });
}
module.exports = connectToMongo;