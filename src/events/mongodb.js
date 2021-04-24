const MongoClient = require("mongodb").MongoClient;
const MongoDBProvider = require("commando-provider-mongo").MongoDBProvider;

const mongo = require("../mongo");

module.exports = {
  name: "ready",
  async execute(client) {
    // Saving configurations to MongoDB
    client.setProvider(
      MongoClient.connect(process.env.MONGO)
        .then((clientSettings) => {
          return new MongoDBProvider(clientSettings, "FrocklesDatabases");
          // Please rename "FrocklesDatabases" to your collection's name
        })
        .catch((err) => {
          console.error(err);
        })
    );

    // Connecting to MongoDB
    const connectToMongoDB = async () => {
      await mongo().then(() => {
        console.log("Successfully Connected to MongoDB Atlas.");
      });
    };
    connectToMongoDB();
  },
};
