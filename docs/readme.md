# Introduction to SerBot
SerBot is a World of Tanks Blitz Bot, Which has Various Uses.
This page is used to demon  strate the use of each command in detail, 
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
- 1 or more parameters that are required for the command to work. Example: The player statistics function will need 2 parameters, Server and IGN. and both are required for checking the statistic of the player
> In cases when a file is involved (Keyart or Replays function), You can supply an attachment instead of an URL, but supplying both URL and Attachment may cause unexpected output.
- optional parameters. they may be used if needed. Example: `-r` for player stats to also show the Rating of the player.
> Optional Parameters may or may not come with `-` indicating optional parameter. 

# Player Statistics Function
As its name suggests, it is for checking a player's Statistics. Currently only Career Statistics
available, but in the future I will make it available for check for periodic stats.
## Usage
```s!player [Server] [IGN] [Optional Parameters]```

**Example**: ```s!player asia Maddoxkkm -r```
The Above command demonstrates a search for the player `Maddoxkkm` from `Asia` Server with the optional parameter `-r` for Rating Battle statistics.

### Command Alias
Alias of the player commands are: `ps` and `playerstats`. So you can also use `s!ps` (Old SerBot command, but still usable) and `s!playerstats` and they represent the same command as `s!player`.

### Server
It must be one of the following:

- `RU`, `Russian` for Russian Server
- `EU`, `Europe` for Eurpoean Server
- `NA` for North American Server
- `Asia`, `SEA`, `SA`(old tag but still usable) for Asia Server/ South-East Asian Server

### IGN - In-game name

Self-Explanatory. You need to use your In Game Name to check.

### Common Question about MGR 2.2 - what is this?

MGR 2.2 (Mega Gaming Rating) is a rating system developed by Russian Players, specifically for WoTB - Official Thread about it's implementation [here](http://forum.wotblitz.ru/index.php?/topic/37499-mgr-%D0%B2%D1%81%D1%82%D1%80%D0%B5%D1%87%D0%B0%D0%B5%D0%BC-%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8E-mgr-22/#topmost).
To explain it in simple words, MGR is a rating that:

- Doesn't consider any tanks that are tier 6 or below (Only tier 7 or above are considered for MGR rating)
- Each tank has its own MGR coefficient (Just like WN8, to prevent stat padding)
- The Higher the tier, the more influence it has on the Account MGR rating.
- Having more battles on a certain tank doesn't affect it's weighting (influence) on the Account MGR rating, but for each tank tier, there is a minimum number of battles required for the tank to be considered for MGR rating calculation. 
- Account MGR rating has a few bonuses that include low platoon rate bonus (the lower the higher), and number of tanks eligible for MGR rating calculation
- It's a 2-digit scale from 0 - 99. The distribution of rating mainly lies around 40-50 MGR, with the top 1000th recorded player in Russian server has around 62-63 MGR. [List of MGR ranking here, Russian Server ONLY](http://wblitz.net/ratings/mgr/1000)


|Tier   | Battles required for tank to be considered in MGR Calculation        |
|:---|:---|
| 7 | 30 battles | 
| 8 | 50 battles | 
| 9 | 75 battles | 
| 10 | 100 battles |