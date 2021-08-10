const economySchema = require("./models/economy-schema");

async function checkIfResults(userId) {
  const client = require("./index");
  try {
    await client.users.fetch(userId);
  } catch (err) {
    throw new Error("Invalid User ID");
  }

  const result = await economySchema.findOne({
    userId,
  });

  if (result) {
    return true;
  } else if (
    !result ||
    typeof result.coins === "undefined" ||
    typeof result.coinBank === "undefined"
  ) {
    await new economySchema({
      userId,
      coins: 0,
      coinBank: 0,
      dailyStreak: 1,
      dailyLastClaimed: 0,
      bankCapacity: 500,
      inventory: [],
    }).save();
    return false;
  }
}

module.exports.addCoins = async (userId, coins) => {
  checkIfResults(userId);
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
  checkIfResults(userId);
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

module.exports.bankCapIncrease = async (userId) => {
  checkIfResults(userId);
  const bankCapacity = Math.floor(Math.random() * 800 + 100);
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

module.exports.addItem = async (userId, itemName, amount) => {
  checkIfResults(userId);
  amount = Number(amount);
  const shopItems = require("./assets/js/item");

  const item = shopItems.find(
    // eslint-disable-next-line no-shadow
    (item) => item.name.toLowerCase() === itemName.toLowerCase()
  );

  if (!item) return null;

  const results = await economySchema.findOne({
    userId,
  });

  if (results) {
    const hasItem = results.inventory.find(
      // eslint-disable-next-line no-shadow
      (item) => item.name.toLowerCase() === itemName.toLowerCase()
    );

    if (!hasItem) {
      const params = {
        name: item.name,
        amount,
      };

      await economySchema.findOneAndUpdate(
        {
          userId,
        },
        {
          userId,
          $push: {
            inventory: params,
          },
        },
        {
          upsert: true,
        }
      );
    } else if (hasItem) {
      const params = {
        name: item.name,
        amount: hasItem.amount + amount,
      };

      await economySchema.findOneAndUpdate(
        {
          userId,
        },
        {
          userId,
          $pull: {
            inventory: {
              name: item.name,
            },
          },
        },
        {
          upsert: true,
        }
      );

      const addItem = await economySchema.findOneAndUpdate(
        {
          userId,
        },
        {
          userId,
          $push: {
            inventory: params,
          },
        },
        {
          upsert: true,
        }
      );

      return addItem;
    }
  }
};

module.exports.removeItem = async (userId, itemName, amount) => {
  checkIfResults(userId);
  amount = Number(amount);
  const shopItems = require("./assets/js/item");

  const item = shopItems.find(
    // eslint-disable-next-line no-shadow
    (item) => item.name.toLowerCase() === itemName.toLowerCase()
  );

  if (!item) return null;

  const results = await economySchema.findOne({
    userId,
  });

  if (results) {
    const hasItem = results.inventory.find(
      // eslint-disable-next-line no-shadow
      (item) => item.name.toLowerCase() === itemName.toLowerCase()
    );

    if (!hasItem) {
      return null;
    } else if (hasItem) {
      const params = {
        name: item.name,
        amount: hasItem.amount - amount,
      };

      const removeItem = await economySchema.findOneAndUpdate(
        {
          userId,
        },
        {
          userId,
          $pull: {
            inventory: {
              name: item.name,
            },
          },
        },
        {
          upsert: true,
        }
      );

      if (hasItem.amount - amount <= 0) return removeItem;
      else
        return await economySchema.findOneAndUpdate(
          {
            userId,
          },
          {
            userId,
            $push: {
              inventory: params,
            },
          },
          {
            upsert: true,
          }
        );
    }
  }
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
      dailyStreak: 1,
      dailyLastClaimed: 0,
      bankCapacity: 500,
      inventory: [],
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
      dailyStreak: 1,
      dailyLastClaimed: 0,
      bankCapacity: 500,
      inventory: [],
    }).save();
  }

  return coinBank;
};

module.exports.getBankCap = async (userId) => {
  const result = await economySchema.findOne({
    userId,
  });

  let bankCap = 500;
  if (result) {
    bankCap = result.bankCapacity;
  } else if (!result) {
    await new economySchema({
      userId,
      coins: 0,
      coinBank: 0,
      dailyStreak: 1,
      dailyLastClaimed: 0,
      bankCapacity: 500,
      inventory: [],
    }).save();
  }

  return bankCap;
};
