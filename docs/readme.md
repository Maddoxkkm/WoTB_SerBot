# Introduction to SerBot
SerBot is a World of Tanks Blitz Bot, Which has Various Uses.
This page is used to demostrate the use of each command in detail, 
so it causes little confusion as possible.

Firstly, an Invite for this bot to your server: [SerBot Invitation](https://discordapp.com/oauth2/authorize?&client_id=213516317003612180&scope=bot&permissions=16392)

If you are interested to help improve and develop SerBot join this 
[Discord Server](http://discord.gg/gt7PquG) and contact `Maddox#0438`.

If you are really interested in this project and wish to support it, 
you can always support me on [Patreon](https://www.patreon.com/maddoxkkm), the donations will go towards 
server costs and hopefully some will go into buying myself beers and stuff.

Without further ado, let's get into the Commands of SerBot, what they do and how to use it!

# How commands work

Most commands for SerBot consists of a few parts:

- Prefix of the bot (it's `s!`) and the Command (for example `player` or `clan`), without separation with spaces. **Example: `s!player`**
- 1 or more parameters that are required for the command to work. Example: The player statistics function 

# Player Statistics Function
As it's name suggests, it is for checking a player's Statistics. Currently only Career Statistics
available, but in the future I will make it available for check for periodic stats.
## Usage
```s!player [Server] [IGN] [Optional Parameters]```

**Example**: ```s!player asia Maddoxkkm -r```
The Above command demostrates a search for the player `Maddoxkkm` from `Asia` Server with the optional parameter `-r` for Rating Battle statistics.

Alias of the player commands are: `ps` and `playerstats`. So you can also use `s!ps` (Old SerBot command, but still usable) and `s!playerstats` and they represent the same command as `s!player`.

### Server
It must be one of the following:

- `RU`, `Russian` for Russian Server
- `EU`, `Europe` for Eurpoean Server
- `NA` for North American Server
- `Asia`, `SEA`, `SA`(old tag but still usable) for Asia Server/ South-East Asian Server
