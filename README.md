# Frockles the Bot | JavaScript | discord.js v12
Yes, I know it's called meowscrub in the repository's name.

This bot is a fairly simple one, it also utilizes discord.js-commando framework.

The source code is provided here for transparency about how the bot works and how it won't spread virus into your workspace. Respect the license when you decides to edit, compile or use the code in any way.

## To setup the bot properly:
### You may want to fill some stuff in your `.env` file:
```
PREFIX=
OWNERID=
GUILD_TEST=
DISCORDINVITE=
TOPGG_TOKEN=
TOKEN=
GENIUS=
MONGO=
YTCOOKIE=
BRAINSHOP_BRAIN_ID=
BRAINSHOP_API_KEY=
```
 - `PREFIX` is your bot's prefix
 - `OWNERID` is your User ID. Or someone else's ID if you'd like. (`OWNERID2` also exists in this source code, so if you want to have only one bot owner, delete `process.env.OWNERID2` somewhere in  `./src/index.js`)
 - `GUILD_TEST` is (your guild to test your bot)'s ID. (used for logging user id to that guild for the global chat feature)
 - `DISCORDINVITE` is your invite link to your server (surround it with these: <>)
 - `TOPGG_TOKEN` is the bot's Top.gg Token (the bot must be in top.gg)
 - `TOKEN` is your Discord Bot Token
 - `GENIUS` is for the lyrics command. Obtain it here: http://genius.com/api-clients
 - `MONGO` is your connection string to your MongoDB database, cloud or local.
 - `MONGOCOLLECTIONNAME` is your MongoDB Database's collection name (recommended to use the collection name the same as your connection string to your mongodb database)
 - `YTCOOKIE` can be obtainable by doing these:
   - Log in using your dummy channel (HIGHLY recommended because autoplay)
   - Navigate to YouTube in a web browser
   - Open up Developer Tools (opt+cmd+j on mac, ctrl+shift+j on windows)
   - Go to the Network Tab
   - Click on `sw.js_data` when it appears
   - Scroll down to "Request Headers"
   - Find the "cookie" header and copy its entire contents
 - `BRAINSHOP_BRAIN_ID` and `BRAINSHOP_API_KEY` can be obtained by creating a brain in http://brainshop.ai/