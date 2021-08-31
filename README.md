# Frockles the Bot

The source code is provided here for transparency about how the bot works and how it won't spread virus into your workspace. Respect the license when you decides to edit, compile or use the code in any way.

meowscrub is the codename for the bot.

## Self-hosting:
### Before you begin:
  - Make sure you've installed:
    - [Node.JS](https://nodejs.org/) v16.6.0 or higher (discord.js requires that)
    - [Git](https://git-scm.com/downloads) for cloning my repository
    - [MongoDB](https://medium.com/@LondonAppBrewery/how-to-download-install-mongodb-on-windows-4ee4b3493514) only if you don't use a cloud database at MongoDB Atlas
  - Clone my repository with `git clone https://github.com/scrubthispie/meowscrub`
  - Run `cd meowscrub` on the terminal to move in the folder that Git has created.
  - Run `npm install` on the terminal to install all dependencies.
 
### Edit configurations:
Obtain the necessary API keys:
  - [Top.gg](https://docs.top.gg/api/@reference/0) API key is used for vote tracking
  - [Genius.com](http://genius.com/api-clients) API key to fetch music lyrics
  - [Brainshop.ai](http://brainshop.ai/) Brain ID and API Key for chatbot
 
Edit all configurations on your `.env` file.
```
PREFIX=
OWNERS=
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
  - `OWNERS` is a string being split using commas, effectively creating an array containing each User ID
  - `GUILD_TEST` is (your guild to test your bot)'s ID. (used for logging user id to that guild for the global chat feature)
  - `DISCORDINVITE` is your invite link to your server (surround it with these: <>)
  - `TOPGG_TOKEN` is the bot's Top.gg Token (the bot must be in top.gg)
  - `TOKEN` is your Discord Bot Token
  - `GENIUS` is for the lyrics command. Obtain it here: http://genius.com/api-clients
  - `MONGO` is your connection string to your MongoDB database, cloud or local.
  - `YTCOOKIE` can be obtainable by doing these:
    - Log in using your dummy channel (HIGHLY recommended because autoplay)
    - Navigate to YouTube in a web browser
    - Open up Developer Tools (opt+cmd+j on mac, ctrl+shift+j on windows)
    - Go to the Network Tab
    - Click on `sw.js_data` when it appears
    - Scroll down to "Request Headers"
    - Find the "cookie" header and copy its entire contents
  - `BRAINSHOP_BRAIN_ID` and `BRAINSHOP_API_KEY` can be obtained by creating a brain in http://brainshop.ai/

### Run the bot
  - Just run `node .` on your console and you're set!