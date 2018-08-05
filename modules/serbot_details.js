const SerBotData = require('../SerBot.json');

module.exports = {
    "CommandArray":{
        "HelpArray":{
            "hidden": false,
            "command": ["HELP"],
            "name": "Help Message",
            "action": "Request Help Message To be sent via PM.",
            "example": "help",
            "usage": "Display help Message."
        },
        "BotNewsArray":{
            "hidden": true,
            "command": ["NEWS"],
            "name": "RSS feed for SerBot Updates",
            "action": "Request SerBot RSS Updates",
            "example": "news",
            "usage": "Obtains news about SerBot's latest status."
        },
        "PSArray":{
            "hidden": false,
            "command": ['PS','PLAYER','PLAYERSTATS'],
            "name": "Player Stats",
            "action": "Check Player stats via WG API.",
            "example": "PlayerStats [Server Tag] [Player IGN Search] (-rating)",
            "usage": `Server Tag: \`SEA\` for Asian Server, \`EU\` for European server, \`RU\` for Russian server, \`NA\` for North America server.\nPlease use Full Player In Game Name (IGN) That is at least 3 Characters Long For Checking. Alias: \`Player\`, \`PS\`\n\`${SerBotData.commandInvoke}rating\` is for checking rating for Rating Battles, Optional. Alias: \`${SerBotData.commandInvoke}ranting\`, \`${SerBotData.commandInvoke}r\`\n\`${SerBotData.commandInvoke}fuzzy\` is for fuzzy IGN search when you can't remember the exact IGN, optional. Alias: \`${SerBotData.commandInvoke}f\`.`
        },
        "CSArray":{
            "hidden": false,
            "command": ['CS','CLAN','CLANSTATS'],
            "name": "Clan Stats",
            "action": "Check Clan Stats",
            "example": "ClanStats [Server Tag] [Clan Tag Search]",
            "usage": `Server Tag: \`SEA\` for Asian Server, \`EU\` for European server, \`RU\` for Russian server, \`NA\` for North America server.\nPlease use a Clan Tag that is 2-5 Characters Long For Checking. Alias: \`Clan\`, \`CS\`\n\`${SerBotData.commandInvoke}member\` is for listing the full member list of the clan, with simple statistics of the players. Optional. Alias: \`${SerBotData.commandInvoke}members\`, \`${SerBotData.commandInvoke}m\``
        },
        "SPArray":{
            "hidden": false,
            "command": ["SERVERP","SP","SERVERPOPULATION"],
            "name": "Server Population Module",
            "action": "Check Server Populaton of WoTB Servers via WG API, Alias: \`SP\`, \`Serverpopulation\`.",
            "example": "serverp",
            "usage": ""
        },
        "ReplaysArray":{
            "hidden": false,
            "command": ["REPLAY","REPLAYS"],
            "name": "Replays upload module",
            "action": "Upload replays onto WOTInspector",
            "example": "replay [URL(optional)] [Title of replay (also optional)] / replay [add-channel / remove-channel]",
            "usage": "URL is optional. SerBot will check for attachment if URL is not found. Title is also optional, WOTInspector will automatically apply one. As for `add-channel` and `remove-channel`, it sets the channel so SerBot can monitor for any replays sent onto the channel, and automatically parse them without the need of using the command. Only Usable for members with Manage Server permissions."
        },
        "KAArray":{
            "hidden": true,
            "command": ["KEYART","KA"],
            "name": "Keyart Mod Generation Module",
            "action": "Generate login Keyarts Mods using Images.",
            "example": "Keyart [URL to image]",
            "usage": "**URL will not be used if there is an image attachment to the message with the command used.**\nRecommended Input Image Size is 2728 x 1536, SerBot will deal with cropping and scaling when a different size is provided"
        },
        "RequestArray":{
            "hidden": true,
            "command": ["REQUEST"],
            "name": "Web Request",
            "action": "Carry out Request",
            "example": "request [URL]",
            "usage": "Carry out Request from given address. Only Supports JSON Objects."
        },
        "UptimeArray":{
            "hidden": true,
            "command": ["UPTIME"],
            "name": "Uptime Show",
            "action": "Show SerBot Uptime.",
            "example": "uptime",
            "usage": "Display Uptime"
        },
        "PingArray":{
            "hidden": false,
            "command": ["PING"],
            "name": "Ping-Pong Module",
            "action": "Check SerBot Availability and TTS Permission",
            "example": "ping",
            "usage": "Simply Replys Pong with TTS When Sent."
        },
        "InviteArray":{
            "hidden": false,
            "command": ["INVITE"],
            "name": "Invitation Link Module",
            "action": "Sends the Bot Invitation Link via PM.",
            "example": "invite",
            "usage": "This will request SerBot to PM you a Invite link to invite it to your server!"
        },
        "AboutArray":{
            "hidden": false,
            "command": ["ABOUT"],
            "name": "SerBot Information",
            "action": "Gets Detailed Infromation about SerBot.",
            "example": "about",
            "usage": ""
        }
    },
    "ErrorArray":{
        "Insufficient_Permission_Server":{
            "sus": "error",
            "catagory": "You do not have the required Permission to use this command!",
            "reason": "You do not have `Manage Server` Permission to use this command!, please make sure you have the correct permissions before using this command!",
            "console_reason": "no permission"
        },
        "Missing_Attachment_Replay":{
            "sus": "error",
            "catagory": "URL or Attachment of replay not found!",
            "reason": "Attachment for wotbreplays or url is missing, Please attach a valid attachment or url and try again.",
            "console_reason": "missing attachment"
        },
        "Missing_Attachment":{
            "sus": "error",
            "catagory": "Keyart Generation Missing Image as Attachment or URL of an Image!",
            "reason": "Attachment for Keyart generation or URL for Keyart Generation is missing, Please attach a valid image attachment and try again.",
            "console_reason": "missing attachment"
        },
        "WG_api_Error":{
            "sus": "error",
            "catagory": "WG API Search Error!",
            "reason": "Searching from WG API Returned Expected Array, Please try again later.",
            "console_reason": "Unexpected Reply"
        },
        "Short_Search_String": {
            "sus": "error",
            "catagory": "Incorrect Command Usage!",
            "reason": "Search String Too Short Or No Search String, Please Use a longer Search String as indicated in the command Usage.",
            "console_reason": "Search String Too Short"
        },
        "Incorret_Server_Tag": {
            "sus": "error",
            "catagory": "Incorrect Command Usage!",
            "reason": "Unidentified Server Tag",
            "console_reason": "Unidentified Server Tag"
        },
        "No_Clan": {
            "sus": "error",
            "catagory": "No Clan Found!",
            "reason": "No Matching Clan Has Been Found, Please Try Using another Clan Tag.",
            "console_reason": "No Match found"
        },
        "No_Battles": {
            "sus": "error",
            "catagory": "No Battle record is found for this player!",
            "reason": "This player doesn't have any battles under his record, Please Try Using another IGN.",
            "console_reason": "No Battle Record"
        },
        "No_Player": {
            "sus": "error",
            "catagory": "No Player Found!",
            "reason": "No Matching Player Has Been Found, Please Try Using another IGN.",
            "console_reason": "No Match Found"
        },
        "Embed_Not_Allowed": {
            "sus": "error",
            "catagory": "Permission Setting Error!",
            "reason": "Embed Links is REQUIRED for this command. Please Enable this permission and try again.",
            "console_reason": "Insufficient Permission"
        },
        "Unexpected_Error":{
            "sus": "error",
            "catagory": "Unexpected Error!",
            "reason": "Unexpected Error Occured. I have already Forwarded a full Error Log To Maddox to investigate the issue. \nPlease try the command again.\nHe will eventaually realise the shit he had made if you throw enough error logs at him.",
            "console_reason": "Unexpected Error"
        }
    }};
