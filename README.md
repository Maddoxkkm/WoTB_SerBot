# SerBot
This is the new SerBot that is currently running. I decided to share the source code so people can pick on my mistakes and stuff. (or potentially improve it)

If you want SerBot in your Discord Server just use this link: https://discordapp.com/oauth2/authorize?&client_id=213516317003612180&scope=bot&permissions=16392

# Setting up SerBot

due to SerBot.json file containing bot tokens and such, I decided to remove it entirely from github so to make the source code public.
here is a basic format of it:
```json
{
	"prefix": "your command prefix goes here",
	"commandInvoke": "your command invoke goes here (like the '-' in -ratings)",
	"Token": "Bot token from Discord API goes here",
	"Api_Token": "WG Public API Token goes here",
	"Webhook": "A webhook url that logs information goes here",
	"Owner_ID": "User ID of the owner (or in this case the host)"
}
```

In the future I will try to make the Webhook value optional, so people can host SerBot without the need for a webhook logging channel (it was there to keep me informed of stuff)

# Dependencies

There is a few Dependencies that are used by SerBot.

- [discordjs/discord.js](https://github.com/discordjs/discord.js) This is the API that is used by SerBot to communicate with users on Discord.
- [eslachance/enmap](https://github.com/eslachance/enmap) This and enmap-sqlite are used currently for per server values and Replay automatic detection system
- [eslachance/enmap-sqlite](https://github.com/eslachance/enmap-sqlite) Same as above.
- [jprichardson/node-fs-extra (fs-extra)](https://github.com/jprichardson/node-fs-extra) This is used alongside with Node-gyp, zip-dir and Sharp to provide Keyart Generation service.
- [nodejs/node-gyp](https://github.com/nodejs/node-gyp) This is used alongside with fs-extra, zip-dir and Sharp to provide Keyart Generation service.
- [request/request](https://github.com/request/request) This is used for WG API checks, retrive RSS data and Image data for Keyart Generation.
- [bobby-brennan/rss-parser](https://github.com/bobby-brennan/rss-parser) This is used to parse RSS data which is used for SerBot Update news.
- [lovell/sharp](https://github.com/lovell/sharp) This is used alongside with fs-extra, zip-dir and node-gyp to provide Keyart Generation service.
- [jsantell/node-zip-dir (zip-dir)](https://github.com/jsantell/node-zip-dir) This is used alongside with fs-extra, sharp and node-gyp to provide Keyart Generation service.