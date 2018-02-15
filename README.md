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


