const profileSchema = require("./models/profile-schema");

const coinsCache = {};
const coinBankCache = {};
// { 'guildId-userId': coins }

// eslint-disable-next-line no-empty-function, no-unused-vars
module.exports = (client) => {};

module.exports.addCoins = async (guildId, userId, coins) => {
  const result = await profileSchema.findOneAndUpdate(
    {
      guildId,
      userId,
    },
    {
      guildId,
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

  coinsCache[`${guildId}-${userId}`] = result.coins;

  return result.coins;
};

module.exports.coinBank = async (guildId, userId, coinBank) => {
  const result = await profileSchema.findOneAndUpdate(
    {
      guildId,
      userId,
    },
    {
      guildId,
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

  coinBankCache[`${guildId}-${userId}`] = result.coinBank;

  return result.coinBank;
};

module.exports.getCoins = async (guildId, userId) => {
  const cachedValue = coinsCache[`${guildId}-${userId}`];
  if (cachedValue) {
    return cachedValue;
  }

  const result = await profileSchema.findOne({
    guildId,
    userId,
  });

  let coins = 0;
  const coinBank = 0;
  if (result) {
    coins = result.coins;
  } else {
    await new profileSchema({
      guildId,
      userId,
      coins,
      coinBank
    }).save();
  }

  coinsCache[`${guildId}-${userId}`] = coins;

  return coins;
};

module.exports.getCoinBank = async (guildId, userId) => {
  const cachedValue = coinBankCache[`${guildId}-${userId}`];
  if (cachedValue) {
    return cachedValue;
  }

  const result = await profileSchema.findOne({
    guildId,
    userId,
  });

  let coinBank = 0;
  const coins = 0;
  if (result) {
    coinBank = result.coinBank;
  } else {
    await new profileSchema({
      guildId,
      userId,
      coins,
      coinBank,
    }).save();
  }

  coinBankCache[`${guildId}-${userId}`] = coinBank;

  return coinBank;
};
