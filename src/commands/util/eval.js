const util = require("util");
const Discord = require("discord.js");

const nl = "!!NL!!";
const nlPattern = new RegExp(nl, "g");

const emoji = require("../../assets/json/tick-emoji.json");

this.makeResultMessages = (result, hrDiff, input = null) => {
  const inspected = util
    .inspect(result, { depth: 0 })
    .replace(nlPattern, "\n")
    .replace(this.sensitivePattern, "--snip--");
  const split = inspected.split("\n");
  const last = inspected.length - 1;
  const prependPart =
    inspected[0] !== "{" && inspected[0] !== "[" && inspected[0] !== "'"
      ? split[0]
      : inspected[0];
  const appendPart =
    inspected[last] !== "}" &&
    inspected[last] !== "]" &&
    inspected[last] !== "'"
      ? split[split.length - 1]
      : inspected[last];
  const prepend = `\`\`\`javascript\n${prependPart}\n`;
  const append = `\n${appendPart}\n\`\`\``;
  if (input) {
    return Discord.Util.splitMessage(
      `
*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${hrDiff[1] / 1000000}ms.*
\`\`\`js\n${inspected}\`\`\``,
      {
        maxLength: 1900,
        prepend,
        append,
      }
    );
  } else {
    return Discord.Util.splitMessage(
      `
*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ""}${
        hrDiff[1] / 1000000
      }ms.*
\`\`\`js\n${inspected}\`\`\`
			`,
      { maxLength: 1900, prepend, append }
    );
  }
};

Object.defineProperty(this, "_sensitivePattern", {
  value: null,
  configurable: true,
});

module.exports = {
  aliases: ["eval", "execute"],
  memberName: "eval",
  group: "util",
  description: "Execute JavaScript code.",
  details:
    "This command can potentially display sensitive information, so only the bot owner(s) may use this command.",
  format: "<code>",
  // eslint-disable-next-line quotes
  examples: ["eval new Date()", 'eval message.channel.send("eval moment")'],
  singleArgs: true,
  ownerOnly: true,
  callback: async (client, message, args) => {
    if (!args)
      return message.reply(
        emoji.missingEmoji + " Input some JavaScript code before you continue."
      );

    // Remove any surrounding code blocks before evaluation
    if (args.startsWith("```") && args.endsWith("```")) {
      args = args.replace(/(^.*?\s)|(\n.*$)/g, "");
    }

    // Run the code and measure its execution time
    let hrDiff;
    try {
      const hrStart = process.hrtime();
      this.lastResult = eval(args);
      hrDiff = process.hrtime(hrStart);
    } catch (err) {
      return message.reply(`Error while evaluating: \`${err}\``);
    }

    // Prepare for callback time and respond
    this.hrStart = process.hrtime();
    const result = this.makeResultMessages(this.lastResult, hrDiff, args);
    if (Array.isArray(result)) {
      return result.map((item) => message.reply(item));
    } else {
      return message.reply(result);
    }
  },
};
