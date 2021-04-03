const mongoose = require("mongoose");
const mongoPath = process.env.MONGO;

module.exports = async () => {
  await mongoose.connect(mongoPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  return mongoose;
};
