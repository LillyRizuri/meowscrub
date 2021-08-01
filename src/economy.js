const economySchema = require("./models/economy-schema");

module.exports.addCoins = async (userId, coins) => {
  const result = await economySchema.findOneAndUpdate(
    {
      userId,
    },
    {
      userId,
      $inc: {
        coins,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  return result.coins;
};

module.exports.coinBank = async (userId, coinBank) => {
  const result = await economySchema.findOneAndUpdate(
    {
      userId,
    },
    {
      userId,
      $inc: {
        coinBank,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  return result.coinBank;
};

module.exports.getCoins = async (userId) => {
  const result = await economySchema.findOne({
    userId,
  });

  let coins = 0;
  if (result) {
    coins = result.coins;
  } else if (
    !result ||
    typeof result.coins === "undefined" ||
    typeof result.coinBank === "undefined"
  ) {
    await new economySchema({
      userId,
      coins,
      coinBank: 0,
      bankCapacity: 500,
    }).save();
  }

  return coins;
};

module.exports.getCoinBank = async (userId) => {
  const result = await economySchema.findOne({
    userId,
  });

  let coinBank = 0;
  if (result) {
    coinBank = result.coinBank;
  } else if (
    !result ||
    typeof result.coins === "undefined" ||
    typeof result.coinBank === "undefined"
  ) {
    await new economySchema({
      userId,
      coins: 0,
      coinBank,
      bankCapacity: 500,
    }).save();
  }

  return coinBank;
};

module.exports.bankCapIncrease = async (userId) => {
  const bankCapacity = Math.floor(Math.random() * 1000 + 100);
  const result = await economySchema.findOneAndUpdate(
    {
      userId,
    },
    {
      userId,
      $inc: {
        bankCapacity,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  return result.bankCapacity;
};

module.exports.getBankCap = async (userId) => {
  const result = await economySchema.findOne({
    userId,
  });

  let bankCap = 2000;
  if (result) {
    bankCap = result.bankCapacity;
  } else if (!result) {
    await new economySchema({
      userId,
      coins: 0,
      coinBank: 0,
      bankCapacity: 500,
    }).save();
  }

  return bankCap;
};
