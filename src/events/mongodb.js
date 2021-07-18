const MongoClient = require("mongodb").MongoClient;
const MongoDBProvider = require("commando-provider-mongo").MongoDBProvider;
const mongoose = require("mongoose");
const mongoPath = process.env.MONGO;

module.exports = {
  name: "ready",
  async execute(client) {
    // Saving configurations to MongoDB
    client.setProvider(
      MongoClient.connect(process.env.MONGO)
        .then((clientSettings) => {
          return new MongoDBProvider(
            clientSettings,
            process.env.MONGOCOLLECTIONNAME
          );
        })
        .catch((err) => {
          console.error(err);
        })
    );

    // Connecting to MongoDB
    await mongoose
      .connect(mongoPath, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      })
      .then(() => {
        console.log("Successfully connected to your MongoDB Database.");
      });
  },
};
