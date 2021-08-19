/* eslint-disable no-inline-comments */
const client = require("../index");

module.exports.isOwner = (owners, user) => {
  // owners is owner id in a string or an array
  user = client.users.resolve(user);
  if (!user) throw new Error("Unable to resolve user.");
  if (typeof owners === "string") return user.id === owners;
  if (owners instanceof Array) return owners.includes(user.id);
  if (owners instanceof Set) return owners.has(user.id);
  throw new Error("The owner option is an unknown value.");
};

module.exports.findCommands = (searchString = String) => {
  const lcSearch = searchString.toLowerCase();
  const matchedCommands = Array.from(
    client.commands
      .filter((cmd) => {
        return cmd.aliases.some((ali) => ali.toLowerCase().includes(lcSearch));
      })
      .values()
  );

  for (const command of matchedCommands) {
    if (command.aliases.some((ali) => ali.toLowerCase() === lcSearch)) {
      return [command];
    }
  }

  return matchedCommands;
};

module.exports.endsWithAny = (suffixes = Array, string = String) => {
  // suffixes is an array
  return suffixes.some(function (suffix) {
    return string.endsWith(suffix);
  });
};

module.exports.getRandomString = (length = 1) => {
  const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
};

module.exports.trim = (string = String, max = 2048) => {
  return string.length > max ? `${string.slice(0, max - 3)}...` : string;
};

module.exports.formatDuration = (milliseconds) => {
  function formatInt(int) {
    if (int < 10) return `0${int}`;
    return int;
  }

  if (!milliseconds || !parseInt(milliseconds)) return "00:00";
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const hours = Math.floor(milliseconds / 3600000);
  if (hours > 0) {
    return `${formatInt(hours)}:${formatInt(minutes)}:${formatInt(seconds)}`;
  }
  if (minutes > 0) {
    return `${formatInt(minutes)}:${formatInt(seconds)}`;
  }
  return `00:${formatInt(seconds)}`;
};

module.exports.prefixChange = async (guildId, prefix) => {
  const settingsSchema = require("../models/settings-schema");

  await settingsSchema.findOneAndUpdate(
    {
      guildId,
    },
    {
      guildId,
      $set: {
        "settings.prefix": prefix,
      },
    },
    {
      upsert: true,
    }
  );

  const results = await settingsSchema.findOne({
    guildId,
  });

  return results.settings.prefix;
};

module.exports.getPrefix = async (guildId) => {
  const settingsSchema = require("../models/settings-schema");
  const defaultPrefix = process.env.PREFIX;
  let prefix;
  if (guildId) {
    const results = await settingsSchema.findOne({
      guildId,
    });

    prefix = (results ? results.settings.prefix : results)
      ? results.settings.prefix
      : defaultPrefix;
  } else {
    prefix = process.env.PREFIX;
  }

  return prefix;
};

module.exports.round = (number, decimals) => {
  return Number(Math.round(number + "e" + decimals) + "e-" + decimals);
};

module.exports.urlify = (string) => {
  // not suitable
  // const pattern = new RegExp(
  //   "^(https?:\\/\\/)?" + // protocol
  //     "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
  //     "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
  //     "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
  //     "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
  //     "(\\#[-a-z\\d_]*)?$",
  //   "i"
  // ); // fragment locator

  const pattern =
    /^((ftp|http|https):\/\/)?(www\.)?([^\s$.?#]+)\.([^...|js|exp\s]{2,})/gm;

  const strSplit = string.split(" ");
  const testArray = [];

  for (let i = 0; i < strSplit.length; i++) {
    const strPiece = strSplit[i];
    const patternReplace = strPiece.replace(pattern, function (url) {
      // eslint-disable-next-line quotes
      return '<a href="' + url + '">' + url + "</a>";
    });
    testArray.push(patternReplace);
  }

  return testArray.join(" ");
};

module.exports.splitString = (string, numberOfLines) => {
  const number = Number(numberOfLines);
  if (isNaN(number)) return null;

  const regex = new RegExp(`(?:^.*$\n?){1,${number}}`, "gm");
  return string.match(regex);
};

module.exports.compareMaps = (map1, map2) => {
  let testVal;
  if (map1.size !== map2.size) {
    return false;
  }
  for (const [key, val] of map1) {
    testVal = map2.get(key);
    // in cases of an undefined value, make sure the key
    // actually exists on the object so there are no false positives
    if (
      JSON.stringify(testVal) !== JSON.stringify(val) ||
      (testVal === undefined && !map2.has(key))
    ) {
      return false;
    }
  }
  return true;
};
