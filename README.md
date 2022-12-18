### A bot that aims to make anime/manga search on discord easy with command to search any media you have in your mind
---
### How to run the bot

> **Basic requirements**
- node v16+
- typescript

> **Environments**

The bot has 2 environments in which it can run:
- development
- production

**Development environment:**

in this environment the bot doesn't do any sort of encryption of the data and doesn't expect the input paraments to be encrypted either
to set up the bot in this environment create a file named ```.env``` with the following variables:
```env
#discord credential

DISCORD_TOKEN = 
DISCORD_CLIENT_SECRET =

#anilist credential

ANILIST_CLIENT_ID =
ANILIST_CLIENT_SECRET =

#database

MYSQL_DATABASE_URL = sqlite:./databases/db.sqlite

#webserver

WEBSERVER_URL = localhost
WEBSERVER_PORT = 8765

#GENERIC

SUPPORT_GUILD_ID=
OWNERS=
NODE_ENV=development
```
- DISCORD_TOKEN: the bot token, can be found at the [discord developer portal](https://discord.com/developers/applications) on the bot section
  
- DISCORD_CLIENT_SECRET: the bot client secret, can be found at the [discord developer portal](https://discord.com/developers/applications) in the oauth - general section
  
- ANILIST_CLIENT_ID,
- ANILIST_CLIENT_SECRET,
 on the [anilist developer page](https://anilist.co/settings/developer) create a new client and copy the ID and the SECRET
 other than the name it will need also a redirect url, there insert `https://anilist.co/api/v2/oauth/pin`

- MYSQL_DATABASE_URL: leave `sqlite:./databases/db.sqlite` that will create a local sqlite database

- WEBSERVER_URL: put `localhost` 
- WEBSERVER_PORT: put any port available on the system like `8765`

- SUPPORT_GUILD_ID: the main server ID
- OWNERS: owner/admin user ID
- NODE_ENV: put `development`

After setting up the `.env` make sure to have

- node installed: check by running in the console `node -v`
- typescript installed **globally**: to install it run `npm i typescript -g`, to check if it is installed run `npm list -g`

then install all the packages required by the bot using:

- `npm install` : install all the packages
  
then start the bot using:

- `npm run dev` : run the bot in development mode

**Production environment:**

TODO

### Command list:
![Anime Space help command](https://i.imgur.com/M5DdBZA.png)
The bot has a list of slash commands, the main one that the bot features are:
 - **anime** - to search anime
 - **manga** - to search manga/webtoons/novels...

![anime + manga commands](https://i.imgur.com/iqRgtAT.png)
The bot also enables to connect an anilist profile to the bot and view a little embed profile of it:

![enter image description here](https://i.imgur.com/DIuwPwB.png)

Other media search commands are:
- **character** - search info about characters from anime/manga
- **staff** - search generic info for any staff creators in the anime industry
- **studio** - search info about any studio member in anime industry
![enter image description here](https://i.imgur.com/mHYKMg7.png)
Command to explore new media:
- **randommedia** - randomly iterate anime/manga to explore new stuff
- **trending** - list of current trending commands
- **seasonal** - list of current season media
![enter image description here](https://i.imgur.com/MmACEh2.png)
