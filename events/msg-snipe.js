const fs = require("fs");
const snipe = require("../snipe.json")
module.exports = {
    run(message, args, client, author, tag, time, icon) {
        let content = args
        let snipedMsg = content.join(" ")
        snipe[message.channel.id] = {
            msg: snipedMsg,
            user: author,
            tag: tag,
            time: time,
            icon: icon
        }

        // To log deleted messages into snipe.json
        // let snipez = JSON.stringify(snipe)
        // fs.writeFile("./snipe.json", snipez, (err) => console.error) 
    }
}