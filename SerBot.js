//Load SerBot tokens
const SerBotTokens = require('./SerBot.json');
const prefix = SerBotTokens.prefix;
const commandInvoke = SerBotTokens.commandInvoke;

//Load Enmap and the base
const Enmap = require('enmap');
const EnmapSQLite = require('enmap-sqlite');
const guildSettingsData = new Enmap({ provider: new EnmapSQLite({ name: 'GuildSettings' }) });

//Import Discord Module
const Discord = require("discord.js");
const SerBot = new Discord.Client({
    messageCacheLifetime: 60,
    messageSweepInterval: 400,
    messageCacheMaxSize: 10,
    disabledEvents: ["TYPING_START"]
});

//Import Server Regions
const Region = require('./modules/Region');

//Import Webhook Module
const SerbLog = require('./modules/serblog');

//Import RSS Parser
const Parser = require('rss-parser');

//Request & WG related Modules
const request = require('./modules/request.js');

//fs
const fs = require('fs-extra');

//Keyart Requirements
const sharp = require('sharp');
const zipdir = require('zip-dir');
const util = require('util');
const zip = util.promisify(zipdir);

//replays Module
const replay = require('./modules/replays.js');

//WN7, WN8, MGR calculation module
const stats = require('./modules/ratings');

//Commands, Server Details & Error Details
const SerBotDetails = require('./modules/serbot_details.js');

//when bot got disconnected
SerBot.on("disconnected", function(){
    SerbLog("Disconnected!");
    process.exit();
});

//check for member permission
function hasPermission(permission, messageObj){
    return messageObj.member.hasPermission(permission,false,true,true)
}


/**
 * Get WN8 data from BlitzStars
 */
function getWN8(){
    request.Request(`https://www.blitzstars.com/tankaverages.json`)
        .then(body => {
            let list = JSON.parse(body);
            let result = {};
            list.map(x => {
                result[x.tank_id] = {
                    wr: x.all.wins * 100 / x.all.battles,
                    dmg: x.all.damage_dealt / x.all.battles,
                    spot: x.all.spotted / x.all.battles,
                    frag: x.all.frags/ x.all.battles,
                    def: x.all.dropped_capture_points / x.all.battles};
            });
            fs.writeFileSync('BlitzStars.json', JSON.stringify(result, null, 2));
            SerbLog('Average Tank Data Updated!');
        },function(){SerbLog('Average Tank Data Update failed!')});
}

/**
 * //Set Status + Tank Array Module + Updating it
 */
function SetStatus () {
    const firsthalf = [
        `Nerfing Germans`,
        `Mining Stalinium™`,
        `${prefix.toLowerCase()+SerBotDetails.CommandArray.HelpArray.command[0].toLowerCase()}`,
        `"Balancing"™`,
        `Improving Russian Bias™`,
        `${prefix.toLowerCase()+SerBotDetails.CommandArray.HelpArray.command[0].toLowerCase()}`,
        `Breaking RNG`,
        `How Terrible`,
        `${prefix.toLowerCase()+SerBotDetails.CommandArray.HelpArray.command[0].toLowerCase()}`,
        `Powered by Vodka`,
        `"Insufficient Loyalty"™`,
        `Supporting Replays`

    ];
    const secondhalf = [
        `in ${SerBot.guilds.size} servers`,
        `serving ${SerBot.users.filter(x => !x.bot).size} users`
    ];
    const status = `${firsthalf[Math.floor(Math.random()*firsthalf.length)]} | ${secondhalf[Math.floor(Math.random() * secondhalf.length)]}`;
    const presence = { game: { name: status, type: 0 } };
    if(SerBot.presences.equals(presence)){
        SetStatus()
    } else {
        SerBot.user.setPresence(presence)
            .then(SerbLog(`Status Set: ${status}`));
    }
}

/**
 * grab Tankopedia
 */
function Tankopedia(){
    request.Request(`http://api.wotblitz.asia/wotb/encyclopedia/vehicles/?application_id=${SerBotTokens.Api_Token}&fields=tier%2Cname`)
        .then(body => {
            fs.writeFileSync('TankArray.json', body);
            SerbLog('Tank Information Updated!');
        },() => {SerbLog('Tank Information Update failed!')});
}


SerBot.on("ready", () => {
    SerbLog(`Ready to begin! Serving in ${SerBot.channels.size} channels, ${SerBot.guilds.size} servers and ${SerBot.users.filter(x => !x.bot).size} users`);
    SetStatus();
    Tankopedia();
    getWN8();
});
SerBot.setInterval(() => {
    SerbLog(`Serving in ${SerBot.channels.size} channels, ${SerBot.guilds.size} servers and ${SerBot.users.filter(x => !x.bot).size} users`);
    SetStatus();
}, 900000);
SerBot.setInterval(() => {
    Tankopedia();
    getWN8();
}, 864000000);

/*
// Join message
SerBot.on("guildMemberAdd", member => {
 const Union = SerBot.guilds.find(guild => guild.id == "341471657627615232");
 const logChannel = Union.channels.find(channel => channel.id == "341477343266734080");
       logChannel.send(`Member ${member.user.username}#${member.user.discriminator} has Joined the server`)
});

// Leave message
SerBot.on("guildMemberRemove", member => {
    const Union = SerBot.guilds.find(guild => guild.id == "341471657627615232");
    const logChannel = Union.channels.find(channel => channel.id == "341477343266734080");
    logChannel.send(`Member ${member.user.username}#${member.user.discriminator} has Left the server`)
});*/

//Help Function module
const helpCommandArray = Object.keys(SerBotDetails.CommandArray)
    .map(x => SerBotDetails.CommandArray[x])
    .filter(x => x.hidden === false)
    .map(curObject => ({
        name: prefix + curObject.example,
        value: curObject.action + '\n' + curObject.usage
    }));
if (helpCommandArray.length === 0) {
    SerbLog('Help Command Function Failed to Initialize!')
} else {
        SerbLog('Help Command Function Ready!')
    }
// end of Help Function Module


/**
 * 
 * @param {integer} x 
 * @return {string}
 */
function numberWithCommas(x){
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

/**
 *
 * @return {Region}
 * @param {string} region
 */
function areaDetermination(region){
        if(region === undefined){
            throw SerBotDetails.ErrorArray.Incorret_Server_Tag;
        }
        switch (region.toUpperCase()){
            case 'NA':
                return Region.NA;
            case 'EU':
            case 'EUROPE':
                return Region.EU;
            case 'ASIA':
            case 'SEA':
            case 'SA':
                return Region.ASIA;
            case 'RU':
            case 'RUSSIAN':
                return Region.RU;
            default:
                throw SerBotDetails.ErrorArray.Incorret_Server_Tag;
        }
}

function errorReply(errorDetails, message,command){
    message.channel.send('',{
        embed: {
            color: 16711680,
            author:{
                name: SerBot.user.username,
                icon_url: SerBot.user.avatarURL
            },
            title: errorDetails.catagory,
            description: `Reason: ${errorDetails.reason}`,
            fields:[
                {
                    name: prefix + command.example,
                    value: command.usage
                }
            ]
        }
    })
        .then(SerbLog(`The User ${message.author.username} From ${message.guild} at ${message.channel.name} has attempted to ${command.action} but failed due to ${errorDetails.console_reason}. Request String: ${message.content}`),
            (error) => {message.channel.send(`\`\`\`${errorDetails.catagory}\n${errorDetails.reason}\n\nCommand Usage for: ${prefix + command.example}\n${command.usage}\n\nNote: Please Enable >Embed Links< Permission for SerBot for Better-Looking Embed Reply!\`\`\``);
            SerbLog(`${error}: Embed Not Enabled!`)});
    message.channel.stopTyping();
    afterTypingCheck(message.channel);
}

function commandAliasCheck(input, commandArray){
    let equal = false;
    commandArray.command.map(x => {
        if (input[0].toUpperCase() === `${prefix.toUpperCase()}${x.toUpperCase()}`){
            equal = true;
            return x
        }
    });
    return equal
}

function afterTypingCheck(channel){
    setTimeout(()=>{
        if(SerBot.user.typingDurationIn(channel) > 9000){
            channel.stopTyping(true)
        }
    },9000)
}


/**
 *Time to Days, Hours, Minutes and Seconds
 * @param {integer} ms The Length of Time in Miliseconds
 * @return {string} a String descripting the time in human readable format.
 * @constructor
 */
function ConvertTime(ms){
    let timeArray = [];
    let temp = Math.floor(ms / 1000);
    let sec = temp % 60;
    temp = Math.floor(temp / 60);
    let min = temp % 60;
    temp = Math.floor(temp / 60);
    let hrs = temp % 24;
    temp = Math.floor(temp / 24);
    let days = temp;

    if(days !== 0){
        if(days === 1){
            timeArray.push("1 Day")
        } else {
            timeArray.push(`${days} Days`)
        }
    }

    if(hrs !== 0){
        if(hrs === 1){
            timeArray.push("1 Hour")
        } else {
            timeArray.push(`${hrs} Hours`)
        }
    }

    if(min !== 0){
        if(min === 1){
            timeArray.push("1 Minute")
        } else {
            timeArray.push(`${min} Minutes`)
        }
    }

    if(sec !== 0){
        if(days === 1){
            timeArray.push("1 Second")
        } else {
            timeArray.push(`${sec} Seconds`)
        }
    }
    return timeArray.join(", ");
}

//Main SerBot
SerBot.on("message", async function(message) {
    let fullInput = message.cleanContent.split(" ");

    //command to restart bot with help of PM2: '!bot logoff'
    if (message.content.toUpperCase().startsWith(prefix.toUpperCase() + "BOT LOGOFF") && (message.author.id === SerBotTokens.Owner_ID)) {
        SerbLog("Disconnecting....");
        process.exit();
    }

    //About Reply
    if (commandAliasCheck(fullInput,SerBotDetails.CommandArray.AboutArray)){
        message.channel.send('', {
            embed: {
                color: 3097087,
                author: {name: 'SerBot News', icon_url: SerBot.user.avatarURL},
                thumbnail:{url: SerBot.user.avatarURL},
                title: `About SerBot.` ,
                description: `Created by Maddox#0438`,
                fields: [
                    {name:`Open Github Repository`, value:`[Maddoxkkm/WoTB_SerBot](https://github.com/Maddoxkkm/WoTB_SerBot)`},
                    {name:`Language of Bot`, value:`[Node.js](https://nodejs.org/en/)`, inline: true},
                    {name:`Discord API Library`, value:`[Discord.js](https://github.com/hydrabolt/discord.js)`, inline: true},
                    {name:`Uptime of Bot`, value:`${ConvertTime(SerBot.uptime)}`, inline: true},
                    {name:`Library of Keyart Generation`, value:`[sharp](https://github.com/lovell/sharp)`, inline: true},
                    {name:`Player/Clan Stats provider`, value:`[WarGaming Open API](https://developers.wargaming.net/)`, inline: true},
                    {name:`WN8 Tank Average Values provider`, value:`[BlitzStars](https://www.blitzstars.com/)`, inline: true},
                    {name:`MGR 2.2 Tank Values provider`, value:`[Wblitz.net](http://wblitz.net/mgr/coeffs)`, inline: true},
                    {name:`No. of Servers`, value:`${SerBot.guilds.size} Servers`, inline: true},
                    {name:`No. of Users (Excluding Bots)`, value:`${SerBot.users.filter(x => !x.bot).size} Users`, inline: true},
                    {name:`To Support Maddox via Patreon`, value: `https://www.patreon.com/maddoxkkm`, inline: true}
                ],
                footer: {icon_url: SerBot.user.avatarURL, text: 'Maintaned by forever unreliable and Lazy™ Maddox.'}
            }
        });
        SerbLog(`The User ${message.author.username} From ${message.guild} at Channel #${message.channel.name} Requested "About SerBot".`);

    }

    //RSS News Feed
    if (commandAliasCheck(fullInput,SerBotDetails.CommandArray.BotNewsArray)){
        try{
            message.channel.startTyping();
            let parser = new Parser();
            let feed = await parser.parseURL('https://madwotbmod.wordpress.com/category/serbot/feed/');
            message.channel.send('', {
                embed: {
                    color: 3097087,
                    author: {name: 'SerBot News', icon_url: SerBot.user.avatarURL},
                    thumbnail:{url: SerBot.user.avatarURL},
                    title: `Embeded Reply of SerBot's Latest Update and News` ,
                    fields: feed.items.filter(item => item.categories.includes('SerBot'))
                        .map(item => {
                            return{
                                name: `${item.title}(${item.link})`,
                                value: `${item.content.split('&#8230;')[0]}...`};
                        }).slice(0,5),
                    footer: {icon_url: SerBot.user.avatarURL, text: 'Provided by The Forever Loyal SerBot™'
                    }
                }
            });
            message.channel.stopTyping();
            afterTypingCheck(message.channel);
            SerbLog(`The User ${message.author.username} From ${message.guild} at Channel #${message.channel.name} Requested SerBot Update News.`);
        }
        catch (error){
            errorReply(SerBotDetails.ErrorArray.Unexpected_Error, message, SerBotDetails.CommandArray.BotNewsArray);
        }
    }

    //keyart
    if (commandAliasCheck(fullInput,SerBotDetails.CommandArray.KAArray)) {
        try {
            message.channel.startTyping();
            let keyartUrl;
            if (message.attachments.array()[0] === undefined && fullInput[1] === undefined) {
                throw(SerBotDetails.ErrorArray.Missing_Attachment)
            }
            if (message.attachments.array()[0] === undefined) {
                keyartUrl = fullInput[1]
            } else {
                keyartUrl = message.attachments.array()[0].url
            }
            const imageData = await request.Request({url: keyartUrl, encoding: null});
            const image = sharp(imageData);
            await fs.mkdirs(`keyart_gen/temp/${message.id}/Keyart/Data/Gfx/UI/KeyArt`);
            await fs.mkdirs(`keyart_gen/temp/${message.id}/Keyart/Data/Gfx2/UI/KeyArt`);
            await image
                .resize(2728, 1536)
                .min()
                .crop(sharp.gravity.centre)
                .toFormat('webp')
                .toFile(`keyart_gen/temp/${message.id}/Keyart/Data/Gfx2/UI/KeyArt/Mad_Easy_Keyart.webp`)
                .then(async function (info) {
                    await fs.copy(`keyart_gen/tex_source/tex.tex`, `keyart_gen/temp/${message.id}/Keyart/Data/Gfx2/UI/KeyArt/Mad_Easy_Keyart.tex`);
                    await fs.writeFile(`keyart_gen/temp/${message.id}/Keyart/Data/Gfx2/UI/KeyArt/keyart.txt`, `1\nMad_Easy_Keyart.tex\n${info.width} ${info.height}\n1\n0 0 ${info.width} ${info.height} 0 0 0 MadWoTBMods0`);
                    await fs.writeFile(`keyart_gen/temp/${message.id}/Keyart/Data/Gfx2/UI/KeyArt/Mad_Easy_Keyart_size.txt`, `(I${info.width * info.height}\nI${info.width}\nI${info.height}\ntp0\n.`);
                });
            await image
                .resize(1364, 768)
                .min()
                .crop(sharp.gravity.centre)
                .toFormat('webp')
                .toFile(`keyart_gen/temp/${message.id}/Keyart/Data/Gfx/UI/KeyArt/Mad_Easy_Keyart.webp`)
                .then(async function (info) {
                    await fs.copy(`keyart_gen/tex_source/tex.tex`, `keyart_gen/temp/${message.id}/Keyart/Data/Gfx/UI/KeyArt/Mad_Easy_Keyart.tex`);
                    await fs.writeFile(`keyart_gen/temp/${message.id}/Keyart/Data/Gfx/UI/KeyArt/keyart.txt`, `1\nMad_Easy_Keyart.tex\n${info.width} ${info.height}\n1\n0 0 ${info.width} ${info.height} 0 0 0 MadWoTBMods0`);
                    await fs.writeFile(`keyart_gen/temp/${message.id}/Keyart/Data/Gfx/UI/KeyArt/Mad_Easy_Keyart_size.txt`, `(I${info.width * info.height}\nI${info.width}\nI${info.height}\ntp0\n.`);
                });
            await fs.writeFile(`keyart_gen/temp/${message.id}/Keyart/README.txt`, `This Is a README File Generated by WoTB Easy Keyart, Developed my MadWoTBMods, with the assist of some individuals.\nThis Keyart can be installed as a normal mod. Just copy and paste the whole 'Data' folder to the correct place and it should work.\n\n\nImplemented by Maddox into SerBot, Original Script Script (Ruby, Also Maintained by Maddox) link: https://github.com/MadWoTBMods/WoTB_Easy_Keyart\n\nThis service is provided for free, By Maddox (Owner of MadWoTBMods), as a add-on ontop of the standard SerBot, to make the game better for everyone.\nPlease consider helping SerBot to stay alive with a small donation:\nhttps://www.paypal.me/MaddoxWong\nhttps://www.patreon.com/maddoxkkm\n\nThis is to help keeping SerBot alive because all the server costs of hosting SerBot althought not much, still comes from me (a university student without a job).`);
            let zipBuffer = await zip(`keyart_gen/temp/${message.id}/Keyart/`);
            message.channel.send(``, {
                embed: {
                    color: 3097087,
                    author: {
                        name: `SerBot Keyart Mod Generation V1.0`,
                        icon_url: SerBot.user.avatarURL
                    },
                    title: `Conversion Successful!`,
                    fields: [
                        {
                            name: 'Note:',
                            value: `SerBot have taken care of the scaling and cropping for you, enjoy the mod!\nIf you want to manually crop them yourself, please make sure the picture you provide is with the aspect ratio of 16:9.\nSee Readme to understand more about this keyart generator!`
                        }],
                    footer: {icon_url: SerBot.user.avatarURL, text: 'Provided by the wonderful SerBot™'}
                },
                file: {
                    attachment: zipBuffer,
                    name: 'keyart.zip'
                }
            });
            sharp(imageData)
                .resize(1364, 768)
                .min()
                .crop(sharp.gravity.centre)
                .overlayWith('./keyart_gen/tex_source/keyart_preview_overlay.png')
                .toFormat('jpeg')
                .toBuffer({resolveWithObject: true})
                .then(({data}) => {
                    message.channel.send(`Preview:`, {
                        file: {
                            attachment: data,
                            name: 'image.jpg'
                        }
                    })
                });
            SerbLog(`The User ${message.author.username} From ${message.guild} at Channel #${message.channel.name} generated keyart. Full URL: ${keyartUrl}`);
            await fs.remove(`keyart_gen/temp/${message.id}`);
            message.channel.stopTyping();
            afterTypingCheck(message.channel);
        } catch (error) {
            if (error.sus === undefined) {
                SerbLog(`The User ${message.author.username} From ${message.guild} at Channel #${message.channel.name} used the keyart generation Module but failed. Full String: ${message.content} Error: ${error}`);
                errorReply(SerBotDetails.ErrorArray.Unexpected_Error, message, SerBotDetails.CommandArray.KAArray);
                message.channel.send('', {
                    embed: {
                        description: `Error! Message: ${error}`,
                        color: 16711680
                    }
                })
            } else {
                errorReply(error, message, SerBotDetails.CommandArray.KAArray)
            }
        }
    }

    //Basic Ping-Ping
    if (commandAliasCheck(fullInput,SerBotDetails.CommandArray.PingArray)) {
        SerbLog(`pong-ed the message from ${message.author.username} From ${message.guild} at Channel #${message.channel.name}`);
        message.reply('pong!', {tts: true});
    }

    //Invitation Module
    if (commandAliasCheck(fullInput,SerBotDetails.CommandArray.InviteArray)) {
        SerbLog(`The User ${message.author.username} From ${message.guild} at Channel #${message.channel.name} has requested the Invitation link`);
        if (message.guild !== null) {
            message.channel.send(``, {
                embed: {
                    description: `Invite Link Has been sent to you via PM/DM!`,
                    color: 3097087
                }
            });
        }
        message.author.send('', {
                embed: {
                    color: 3097087,
                    author: {
                        name: SerBot.user.username,
                        icon_url: SerBot.user.avatarURL
                    },
                    title: 'Invitation Link',
                    url: `https://discordapp.com/oauth2/authorize?&client_id=${SerBot.user.id}&scope=bot&permissions=16392`,
                    description: `Click on the Invitation Link to invite SerBot to your Server!\nhttps://discordapp.com/oauth2/authorize?&client_id=${SerBot.user.id}&scope=bot&permissions=16392`,
                    fields: [
                        {
                            name: 'Permission',
                            value: 'Make sure to give him **Embed Links** Permission for Beautiful Embed Message Blocks Reply, just like this one!\n\nIf you are too lazy to manage permissions then simply give SerBot Administrator permissions instead to bypass all restrictions to send Embed messages. \n\nThis Bot ***DOES NOT LOG MESSAGES NOR HAS THE CODE TO CONDUCT ANY Administrator actions***.'
                        }
                    ]
                }
            }
        )
    }

    //Uptime Module
    if (commandAliasCheck(fullInput,SerBotDetails.CommandArray.UptimeArray)) {
        SerbLog(`The User ${message.author.username} From ${message.guild} at Channel #${message.channel.name} has requested the Bot Uptime Data`);
        message.channel.send(``, {
            embed: {
                description: `${SerBot.user.username} Uptime | ${ConvertTime(SerBot.uptime)}`,
                color: 3097087
            }
        })
    }

    //Help Function
    if (commandAliasCheck(fullInput,SerBotDetails.CommandArray.HelpArray)) {
        SerbLog(`The User ${message.author.username} From ${message.guild} at Channel #${message.channel.name} has requested the Help file.`);
        if (message.guild !== null) {
            message.channel.send(``, {
                embed: {
                    description: `A help message with commands and details has been sent to your DM/PM!`,
                    color: 3097087
                }
            })
        }
        message.author.send('', {
            embed: {
                color: 3097087,
                author: {
                    name: SerBot.user.username,
                    icon_url: SerBot.user.avatarURL
                },
                title: `${SerBot.user.username}'s Help File`,
                description: `Help file of ${SerBot.user.username} - Commands and Stuff. If you have any enquiries please enter [SerBot Headquarters](https://discord.gg/8JvEuuR) Server and ask the creator of SerBot <@76584929063866368> (Maddox#0438) for help. \nIf you wish to support the operations of this bot (the hosting fees of this bot is all from Maddox's pocket), be a patreon today! (https://www.patreon.com/maddoxkkm)`,
                fields: helpCommandArray
            }
        })
    }

    //Server Population Module
    if (commandAliasCheck(fullInput,SerBotDetails.CommandArray.SPArray)) {
        try {
            message.channel.startTyping();
            Promise.all([request.WGApiCall(`http://api.worldoftanks.asia/wgn/servers/info/?application_id=${SerBotTokens.Api_Token}`), request.WGApiCall(`http://api.worldoftanks.com/wgn/servers/info/?application_id=${SerBotTokens.Api_Token}`), request.WGApiCall(`http://api.worldoftanks.eu/wgn/servers/info/?application_id=${SerBotTokens.Api_Token}`), request.WGApiCall(`http://api.worldoftanks.ru/wgn/servers/info/?application_id=${SerBotTokens.Api_Token}`)])
                .then(result => {
                    let flattendata = [];
                    result.map(x => x.data.wotb
                        .map (y => {
                            flattendata.push({
                                name: `For ${y.server} Server:`,
                                value: `${y.players_online} Players Online`,
                                inline: true
                            })
                        }));
                    SerbLog(`The User ${message.author.username} From ${message.guild} at Channel #${message.channel.name} checked Server Population Data`);
                    message.channel.send(``, {
                        embed: {
                            color: 3097087,
                            author: {
                                name: `Server Population Module V2.0 - By SerBot`,
                                icon_url: SerBot.user.avatarURL
                            },
                            title: `Server Population Data for WoTB Servers`,
                            fields: flattendata,
                            footer: {icon_url: SerBot.user.avatarURL, text: 'Provided by the Forever Loyal SerBot™'}
                        }
                    });
                });
            message.channel.stopTyping();
            afterTypingCheck(message.channel);
        } catch (err) {
            errorReply(SerBotDetails.ErrorArray.Unexpected_Error, message, SerBotDetails.CommandArray.SPArray);
            message.channel.send(``, {
                embed: {
                    description: `Error! Message: ${err}`,
                    color: 16711680
                }
            });
            message.channel.stopTyping();
            afterTypingCheck(message.channel);
        }
    }

    //Clan Stats Function
    if (commandAliasCheck(fullInput,SerBotDetails.CommandArray.CSArray)) {
        try {
            message.channel.startTyping();
            //init time
            let day = (new Date().getTime() / 86400000).toFixed(0);
            //determine realm of the check
            let realm = await areaDetermination(fullInput[1]);
            //separate search string and command
            let stringCommand = {
                search: fullInput[2],
                command: fullInput.slice(3).join(" ")
            };
            if(stringCommand.search === undefined){
                throw (SerBotDetails.ErrorArray.Short_Search_String)
            }
            if(stringCommand.search.length < 2){
                throw (SerBotDetails.ErrorArray.Short_Search_String)
            }
            //commands
            let membersCommand = false;
            let debug = false;
            if (stringCommand.command !== undefined) {
                if (stringCommand.command.search(`${commandInvoke}member`) !== -1 || stringCommand.command.search(`${commandInvoke}members`) !== -1 || stringCommand.command.search(`${commandInvoke}m`) !== -1) {
                    membersCommand = true;
                }
                if (stringCommand.command.search(`${commandInvoke}debug`) !== -1 || stringCommand.command.search(`${commandInvoke}d`) !== -1) {
                    debug = true;
                }
            }

            //1st API check
            let firstCheck = await request.WGApiCall(`${realm.domain}/wotb/clans/list/?application_id=${SerBotTokens.Api_Token}&search=${stringCommand.search}&limit=1`);
            //determine whether there is such clan or not (notice the ! in front xD)
            if (firstCheck.meta.count === 0) {
                throw (SerBotDetails.ErrorArray.No_Clan)
            }
            let firstResult = firstCheck.data[0];
            //update the first batch of results into the dedicated object
            let csdata = {
                clanname: firstResult.name,
                clantag: firstResult.tag,
                created_at: firstResult.created_at * 1000,
                createddate: new Date(firstResult.created_at * 1000).toLocaleDateString(),
                members_count: firstResult.members_count,
                clan_id: firstResult.clan_id
            };

            //2nd API check
            let secondCheck = await request.WGApiCall(`${realm.domain}/wotb/clans/info/?application_id=${SerBotTokens.Api_Token}&extra=members&clan_id=${csdata.clan_id}`);
            //clam emblem id fix (custom emblems)
            let secondResult = secondCheck.data[csdata.clan_id];
            //update the 2nd batch of results into the dedicated object
            Object.assign(csdata, {
                member_id_stringed: secondResult.members_ids.toString(),
                member_id_array: secondResult.members_ids,
                leader: secondResult.leader_name,
                description: secondResult.description,
                motto: secondResult.motto,
                creator: secondResult.creator_name,
                emblem: secondResult.emblem_set_id,
                recruitment: secondResult.recruiting_policy
            });
            let tempMemberList = secondResult.members;
            //if there is a past clan name and tag then add them into the object
            if (!(secondResult.old_name === null && secondResult.old_tag === null)) {
                Object.assign(csdata, {
                    old_tag: secondResult.old_tag,
                    old_name: secondResult.old_name
                })
            }


            //3rd API check
            let thirdCheck = await request.WGApiCall(`${realm.domain}/wotb/account/info/?application_id=${SerBotTokens.Api_Token}&account_id=${csdata.member_id_stringed}&fields=statistics.all.battles%2Cstatistics.all.damage_dealt%2C%2Cstatistics.all.damage_received%2Cstatistics.all.wins%2Ccreated_at%2Clast_battle_time`);
            let thirdRequest = thirdCheck.data;
            //sort member list according to role and add the name of the role
            csdata.memberArray = csdata.member_id_array
                .filter(x => tempMemberList[x].role === `commander`)
                .concat(csdata.member_id_array
                    .filter(x => tempMemberList[x].role === `executive_officer`)
                    .concat(csdata.member_id_array
                        .filter(x => tempMemberList[x].role === `private`)))
                .filter(x => !(thirdRequest[x] === null || thirdRequest[x] === undefined))
                .map(x => tempMemberList[x])
                .map(x => {
                    switch (x.role) {
                        case 'commander':
                            x.role = 'Clan Commander'; return x;
                        case 'executive_officer':
                            x.role = 'Deputy Commander'; return x;
                        default:
                            x.role = 'Private'; return x;
                    }
                })
                .map(x => Object.assign(x, thirdRequest[x.account_id]))
                .map(x => {
                    x.days = parseInt((day - (x.created_at / 86400)).toFixed(0));
                    x.joinfor = parseInt((day - (x.joined_at / 86400)).toFixed(0));
                    x.lastPlayed = parseInt((day - (x.last_battle_time / 86400)).toFixed(0));
                    return x;
                });
            //clan total data
            csdata.clanTotal = csdata.memberArray
                .reduce(function (total, current) {
                    total.battles += current.statistics.all.battles;
                    total.days += current.days;
                    total.damage += current.statistics.all.damage_dealt;
                    total.damage_received += current.statistics.all.damage_received;
                    total.wins += current.statistics.all.wins;
                    return total
                }, {
                    battles: 0, days: 0, damage: 0, damage_received: 0, wins: 0
                });
            //previous clan tag and name
            let special;
            if (csdata.old_name === undefined && csdata.old_tag === undefined) {
                special = ``
            } else {
                special = `(previously known as \"${csdata.old_name}\" [${csdata.old_tag}])`
            }
            //TODO add 4th API check with promise.all for WN7 and WN8? *related to excel todo
            csdata.clanFinal = {
                wr: ((csdata.clanTotal.wins / csdata.clanTotal.battles) * 100).toFixed(2),
                battles: (csdata.clanTotal.battles / csdata.memberArray.length).toFixed(0),
                average_dmg: (csdata.clanTotal.damage / csdata.clanTotal.battles).toFixed(0),
                bpd: (csdata.clanTotal.battles / csdata.clanTotal.days).toFixed(0),
                dmg_ratio: (csdata.clanTotal.damage / csdata.clanTotal.damage_received).toFixed(3)
            };
            //clan classification
            if (csdata.memberArray.length < 10) {
                Object.assign(csdata.clanFinal, {color: 16777215, rating: `Unrated Clan`})
            } else {
                switch (true) {
                    case (csdata.clanFinal.wr >= 66):
                        Object.assign(csdata.clanFinal, {color: 5577355, rating: `___**Super Unicum Clan**___`});
                        break;
                    case (csdata.clanFinal.wr >= 61 && csdata.clanFinal.wr < 66):
                        Object.assign(csdata.clanFinal, {color: 14090495, rating: `___**Unicum Clan**___`});
                        break;
                    case (csdata.clanFinal.wr >= 57 && csdata.clanFinal.wr < 61):
                        Object.assign(csdata.clanFinal, {color: 37887, rating: `___**Great Clan**___`});
                        break;
                    case (csdata.clanFinal.wr >= 54 && csdata.clanFinal.wr < 57):
                        Object.assign(csdata.clanFinal, {color: 65535, rating: `___**Very Good Clan**___`});
                        break;
                    case (csdata.clanFinal.wr >= 51 && csdata.clanFinal.wr < 54):
                        Object.assign(csdata.clanFinal, {color: 29184, rating: `___**Good Clan**___`});
                        break;
                    case (csdata.clanFinal.wr >= 48 && csdata.clanFinal.wr < 51):
                        Object.assign(csdata.clanFinal, {color: 65280, rating: `___**Average Clan**___`});
                        break;
                    case (csdata.clanFinal.wr < 48):
                        Object.assign(csdata.clanFinal, {color: 16777215, rating: `Unrated Clan`});
                        break;
                }
            }

            //send the standard response!
            SerbLog(`The User ${message.author.username} From ${message.guild} at Channel #${message.channel.name} checked Clan Data of [${csdata.clantag}] From ${realm.server_fullName}. Full String: ${message.content}`);
            message.channel.send(`\`\`\`\nSerBot Clan Data Checking V2.0\n===========================\nClan Name   : ${csdata.clanname} [${csdata.clantag}] ${special} From ${realm.server_fullName}\nCreator     : ${csdata.creator}\nClan Leader : ${csdata.leader}\n\nDate of Creation : ${csdata.createddate}\n\nClan Motto : ${csdata.motto}\nClan Description : ${csdata.description}\n===========================\nNote: If you don't see the embeded message with Clan Statistics below this line, please Enable >Embed Links< Permission For SerBot!\`\`\``,
                {
                    embed:
                        {
                            color: csdata.clanFinal.color,
                            author: {
                                name: `SerBot Clan Data Checking V2.0 - By SerBot`,
                                icon_url: SerBot.user.avatarURL
                            },
                            "thumbnail": {"url": `https://wotblitz-gc.gcdn.co/icons/clanEmblems2x/clan-icon-v2-${csdata.emblem}.png`},
                            title: `Embeded Reply of Clan Statistics For [${csdata.clantag}], ${csdata.clanname}`,
                            description: `Clan Rating: ${csdata.clanFinal.rating}`,
                            fields: [
                                {name: 'Member Count', value: `**${csdata.memberArray.length}**`, inline: true},
                                {name: 'Average Winrate', value: `**${csdata.clanFinal.wr}%**`, inline: true},
                                {name: 'Average Damage', value: `**${csdata.clanFinal.average_dmg}**`, inline: true},
                                {name: 'Average Battles', value: `**${csdata.clanFinal.battles}**`, inline: true},
                                {name: 'Battles Per Day', value: `**${csdata.clanFinal.bpd}**`, inline: true},
                                {name: 'Damage Ratio', value: `**${csdata.clanFinal.dmg_ratio}**`, inline: true},
                                {
                                    name: 'Clan Damage Total',
                                    value: `**${numberWithCommas(csdata.clanTotal.damage)}**`,
                                    inline: true
                                }],
                            timestamp: new Date(csdata.created_at),
                            footer: {icon_url: SerBot.user.avatarURL, text: 'Detailed Time of Clan Creation'}
                        }
                });

            //members Command (pending improvement)
            //TODO uses excel to reply, instead of long ass embed.
            if (membersCommand) {
                let arried = csdata.memberArray.map((item, index) => {
                    return index % 5 === 0 ? csdata.memberArray.slice(index, index + 5) : null;
                })
                    .filter(x => x)
                    .map(function (x) {
                        return {
                            name: '------', value: x
                                .reduce((replystr, current) => {
                                    replystr += `**${current.account_name} (${current.role}, ${current.joinfor} Days In Clan)**\n\`Battles : ${current.statistics.all.battles}\nWR      : ${(100 * current.statistics.all.wins / current.statistics.all.battles).toFixed(2)}%\nBPD     : ${(current.statistics.all.battles / current.days).toFixed(0)}\nDamage  : ${(current.statistics.all.damage_dealt / current.statistics.all.battles).toFixed(0)}\`\n`;
                                    return replystr
                                }, ''), inline: false
                        }
                    });
                message.channel.send(``,
                    {
                        embed:
                            {
                                color: csdata.clanFinal.color,
                                author: {
                                    name: `SerBot Clan Data Checking V2.0, Members List Module - By SerBot`,
                                    icon_url: SerBot.user.avatarURL
                                },
                                "thumbnail": {"url": `http://dl-wotblitz-gc.wargaming.net/icons/clanIcons2x/clan-icon-v2-${csdata.emblem}.png`},
                                title: `Embeded Reply of Clan Member Statistics For [${csdata.clantag}], ${csdata.clanname}`,
                                fields: arried,
                                footer: {icon_url: SerBot.user.avatarURL, text: 'Provided by the Forever Loyal SerBot™'}
                            }
                    })
                    .catch(error => {
                        message.channel.send(`Failed to Return Member list due to: ${error}`);
                        SerbLog(`Failed to Return Member List due to: ${error}`)
                    });
            }

            //debug attachment
            if (debug) {
                message.channel.send('Debugging Purposes Only File', {
                    file: {
                        attachment: Buffer.from(JSON.stringify(csdata, null, 1), 'utf8'),
                        name: 'debug.json'
                    }
                })
            }

            message.channel.stopTyping();
            afterTypingCheck(message.channel);
        } catch (error) {
            if (error.response !== undefined) {
                errorReply(error.error, message, SerBotDetails.CommandArray.CSArray);
                message.channel.send(`Returned API: \`\`\`json\n${JSON.stringify(error.response, null, 2)}\`\`\``);
                SerbLog(`Reply:\n${JSON.stringify(error.response, null, 2)}`)
            } else if (error.sus === undefined) {
                errorReply(SerBotDetails.ErrorArray.Unexpected_Error, message, SerBotDetails.CommandArray.CSArray);
                message.channel.send(`Error Message: ${error}`);
                SerbLog(`Unexpected Error: ${error}`)
            } else {
                errorReply(error, message, SerBotDetails.CommandArray.CSArray)
            }
        }
    }

    //Player Stats Function
    if (commandAliasCheck(fullInput,SerBotDetails.CommandArray.PSArray)) {
        try {
            message.channel.startTyping();
            //init time
            let now = (new Date().getTime() / 86400000);
            //determine realm of the check
            let realm = await areaDetermination(fullInput[1]);
            //separate search string and command
            let stringCommand = {
                search: fullInput[2],
                command: fullInput.slice(3).join(" ")
            };
            if(stringCommand.search === undefined){
                throw (SerBotDetails.ErrorArray.Short_Search_String)
            }
            if(stringCommand.search.length < 3){
                throw (SerBotDetails.ErrorArray.Short_Search_String)
            }
            //commands
            //let eventcommand = false;
            let rating = false;
            let debug = false;
            let fuzzysearch = false;
            if (stringCommand.command !== undefined) {
                /*if(stringCommand.command.search(`${commandInvoke}e`) !== -1 || stringCommand.command.search(`${commandInvoke}event`) !== -1 ){
                    eventcommand = true;
                }*/
                if (stringCommand.command.search(`${commandInvoke}debug`) !== -1 || stringCommand.command.search(`${commandInvoke}d`) !== -1) {
                    debug = true;
                }
                if (stringCommand.command.search(`${commandInvoke}f`) !== -1 || stringCommand.command.search(`${commandInvoke}fuzzy`) !== -1) {
                    fuzzysearch = true;
                }
                if (stringCommand.command.search(`${commandInvoke}r`) !== -1 || stringCommand.command.search(`${commandInvoke}rating`) !== -1 || stringCommand.command.search(`${commandInvoke}ranting`) !== -1) {
                    rating = true;
                }
            }

            //1st API Check (obtain account id from IGN)
            let firstcheck;
            if (fuzzysearch) {
                firstcheck = await request.WGApiCall(`${realm.domain}/wotb/account/list/?application_id=71df07a3f5c764028c167d09eec0cd99&type=startswith&search=${stringCommand.search}&limit=1`)
            } else {
                firstcheck = await request.WGApiCall(`${realm.domain}/wotb/account/list/?application_id=71df07a3f5c764028c167d09eec0cd99&type=exact&search=${stringCommand.search}`)
            }
            if (firstcheck.meta.count === 0) {
                throw (SerBotDetails.ErrorArray.No_Player);
            }
            let firstResult = firstcheck.data[0];
            //update the first batch of results into the dedicated object
            let psdata = {
                ign: firstResult.nickname,
                acc_id: firstResult.account_id
            };

            //2nd API Check
            let secondCheck = await request.WGApiCall(`${realm.domain}/wotb/account/info/?application_id=71df07a3f5c764028c167d09eec0cd99&language=en&account_id=${psdata.acc_id}&fields=-statistics.clan%2C-statistics.all.max_frags_tank_id%2C-statistics.all.frags8p%2C-statistics.frags%2C-nickname%2C-private%2C-updated_at`);
            let secondResult = secondCheck.data[psdata.acc_id];
            //update the 2nd batch of results into the dedicated object
            Object.assign(psdata, {
                created_at: secondResult.created_at,
                last_battle_time: secondResult.last_battle_time
            }, secondResult.statistics.all);
            Object.assign(psdata, {
                playerfinal: {
                    created: new Date(psdata.created_at * 1000).toLocaleDateString(),
                    last_battle_time: psdata.last_battle_time * 1000,
                    battles: psdata.battles,
                    wr: psdata.wins / psdata.battles,
                    spots: (psdata.spotted / psdata.battles),
                    average_dmg: (psdata.damage_dealt / psdata.battles),
                    defend: (psdata.dropped_capture_points / psdata.battles),
                    kpb: (psdata.frags / psdata.battles),
                    hitrate: psdata.hits / psdata.shots,
                    max_xp: psdata.max_xp,
                    survive: psdata.survived_battles / psdata.battles,
                    win_and_survive: psdata.win_and_survived / psdata.battles,
                    cap: psdata.capture_points / psdata.battles,
                    dmgratio: (psdata.damage_dealt / psdata.damage_received),
                    avgexp: (psdata.xp / psdata.battles),
                    bpd: psdata.battles / (now - (psdata.created_at / 86400))
                }
            });
            let TankArray = require('./TankArray.json');
            if (TankArray.data[psdata.max_xp_tank_id] !== undefined) {
                psdata.playerfinal.max_xp_tank = TankArray.data[psdata.max_xp_tank_id].name
            }

            //3rd API Check (WN8, WN7 and MGR 2.2 (excluding platoon wins) Implementation)
            let thirdCheck = await request.WGApiCall(`${realm.domain}/wotb/tanks/stats/?application_id=71df07a3f5c764028c167d09eec0cd99&account_id=${psdata.acc_id}&fields=all.spotted%2C+all.frags%2C+all.wins%2C+all.battles%2C+all.damage_dealt%2C+all.damage_received%2C+all.dropped_capture_points%2C+all.survived_battles%2C+tank_id`);
            let thirdResult = thirdCheck.data[psdata.acc_id];
            if(thirdResult === null){
                throw (SerBotDetails.ErrorArray.No_Battles)
            }
            //load them into "tank_data" first
            psdata.tank_data = thirdResult;
            //extract average tier
            let tiertank = thirdResult.reduce((total, x) => {
                if (TankArray.data[x.tank_id] !== undefined) {
                    total.tier += (TankArray.data[x.tank_id].tier * x.all.battles);
                    total.battles += x.all.battles;
                }
                return total
            }, {tier: 0, battles: 0});
            psdata.playerfinal.avgTier = tiertank.tier / tiertank.battles;
            //
            psdata.playerfinal.tanks_data = thirdResult.map(x => {
                let dead_battles = x.all.battles - x.all.survived_battles;
                if (dead_battles === 0) {
                    dead_battles = 1
                }
                return {
                    tank_id: x.tank_id,
                    battles: x.all.battles,
                    avg_dmg: x.all.damage_dealt / x.all.battles,
                    des_ratio: x.all.frags / dead_battles,
                    wr: (x.all.wins / x.all.battles) * 100,
                    spots: x.all.spotted / x.all.battles,
                    kpb: x.all.frags / x.all.battles,
                    def: x.all.dropped_capture_points / x.all.battles
                }
            });

            //quick 4th check (platoon wins, just for MGR rating)
            let forthCheck = await request.WGApiCall(`${realm.domain}/wotb/account/achievements/?application_id=71df07a3f5c764028c167d09eec0cd99&account_id=${psdata.acc_id}&fields=max_series`);
            let forthResult = forthCheck.data[psdata.acc_id];
            if (forthResult.max_series.jointVictory === undefined) {
                psdata.playerfinal.platooned_wins = 0
            } else {
                psdata.playerfinal.platooned_wins = forthResult.max_series.jointVictory * 100 / psdata.wins
            }

            //MGR 2.2, WN8 and WN7 applied
            psdata.playerfinal = stats.MGR(psdata.playerfinal);
            psdata.playerfinal.wn7 = stats.wn7(psdata.playerfinal.avgTier, psdata.playerfinal.kpb, psdata.playerfinal.average_dmg, psdata.playerfinal.spots, psdata.playerfinal.defend, psdata.playerfinal.wr * 100, psdata.playerfinal.battles);
            psdata.playerfinal = stats.wn8(psdata.playerfinal);
            psdata.playerfinal.WGPR = stats.PersonalRating(psdata.playerfinal.battles, psdata.playerfinal.wr, psdata.playerfinal.survive, psdata.playerfinal.hitrate, psdata.playerfinal.average_dmg);

            //5th Api Check (clan related)
            let fifthCheck = await request.WGApiCall(`${realm.domain}/wotb/clans/accountinfo/?application_id=71df07a3f5c764028c167d09eec0cd99&account_id=${psdata.acc_id}&fields=clan_id%2Cjoined_at%2Crole`);
            let fifthResult = fifthCheck.data[psdata.acc_id];
            let psReply;
            let hasClan;
            let LastPlayed = ConvertTime(new Date().getTime() - psdata.playerfinal.last_battle_time);
            if (fifthResult === null) {
                psReply = `Name      : ${psdata.ign} From ${realm.server_fullName}\n\nDate Of Account Creation: ${psdata.playerfinal.created}\nLast Played: ${LastPlayed}Ago`;
                hasClan = false;
            } else if (fifthResult.clan_id === null){
                psReply = `Name      : ${psdata.ign} From ${realm.server_fullName}\n\nDate Of Account Creation: ${psdata.playerfinal.created}\nLast Played: ${LastPlayed}Ago`;
                hasClan = false;
            } else {
                hasClan = true;
                Object.assign(psdata, fifthResult);
                switch (psdata.role) {
                    case 'executive_officer':
                        psdata.playerfinal.clan_role = 'Deputy Commander';
                        break;
                    case 'commander':
                        psdata.playerfinal.clan_role = 'Clan Commander';
                        break;
                    case 'private':
                        psdata.playerfinal.clan_role = 'Private';
                        break;
                }
                psdata.playerfinal.joined_clan = (now - new Date(psdata.joined_at/86400)).toFixed(0)
            }

            //6th API Call
            //let sixthCheck = JSON.parse(await Request(`${realm.domain}/wotb/clans/info/?application_id=71df07a3f5c764028c167d09eec0cd99&clan_id=${psdata.clan_id}&fields=name%2Ctag`));
            //validate 5th API return value
            if (hasClan) {
                let sixthCheck = await request.WGApiCall(`${realm.domain}/wotb/clans/info/?application_id=71df07a3f5c764028c167d09eec0cd99&clan_id=${psdata.clan_id}&fields=name%2Ctag`);
                psdata.playerfinal.clan = sixthCheck.data[psdata.clan_id];
                psReply = `Name      : ${psdata.ign} [${psdata.playerfinal.clan.tag}] From ${realm.server_fullName}\nClan      : ${psdata.playerfinal.clan.name} (Joined ${psdata.playerfinal.joined_clan} Days Ago)\nPosition  : ${psdata.playerfinal.clan_role}\n\nDate Of Account Creation: ${psdata.playerfinal.created}\nLast Played: ${LastPlayed} Ago`
            }

            SerbLog(`The User ${message.author.username} From ${message.guild} at Channel #${message.channel.name} checked Player Data of ${psdata.ign} From ${realm.server_fullName}. Full String: ${message.content}`);
            message.channel.send(`\`\`\`\nSerBot Player Data Checking V 4.0\n===========================\n${psReply}\n===========================\nNote: If you don't see the embeded message with Player Statistics below this line, please Enable >Embed Links< Permission For SerBot!\`\`\``, {
                embed: {
                    color: psdata.playerfinal.wn8.color,
                    author: {name: 'SerBot Player Data Checking V 4.0 - By SerBot', icon_url: SerBot.user.avatarURL},
                    title: `Embeded Reply of Player Statistics For ${psdata.ign}`,
                    description: 'Details of Player Statistics',
                    fields: [
                        {name: `WN8`, value: `**${psdata.playerfinal.wn8.wn8.toFixed(0)} (${psdata.playerfinal.wn8.rating})**`, inline: true},
                        {name: 'WN7', value: `**${psdata.playerfinal.wn7.wn7.toFixed(0)} (${psdata.playerfinal.wn7.rating})**`, inline: true},
                        {name: `MGR 2.2`, value: `**[${psdata.playerfinal.MGR.MGR.toFixed(2)} (${psdata.playerfinal.MGR.rating})](http://forum.wotblitz.ru/index.php?/topic/37499-mgr-%D0%B2%D1%81%D1%82%D1%80%D0%B5%D1%87%D0%B0%D0%B5%D0%BC-%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8E-mgr-22/#topmost)**`, inline: true},
                        {name: 'WG Personal Rating', value: `**${psdata.playerfinal.WGPR.toFixed(0)}**`},
                        {name: 'Battles', value: `**${psdata.playerfinal.battles}**`, inline: true},
                        {name: 'Winrate', value: `**${(psdata.playerfinal.wr * 100).toFixed(2)}%**`, inline: true},
                        {name: 'Average Damage', value: `**${psdata.playerfinal.average_dmg.toFixed(0)}**`, inline: true},
                        {name: 'Spots Per Game', value: `**${psdata.playerfinal.spots.toFixed(2)}**`, inline: true},
                        {name: 'Kills Per Battle', value: `**${psdata.playerfinal.kpb.toFixed(2)}**`, inline: true},
                        {name: 'Damage Ratio', value: `**${psdata.playerfinal.dmgratio.toFixed(2)}**`, inline: true},
                        {name: 'Hit Ratio', value: `**${(psdata.playerfinal.hitrate * 100).toFixed(2)}%**`, inline: true},
                        {name: 'Platooned Wins / Wins', value: `**${psdata.playerfinal.platooned_wins.toFixed(2)}%**`, inline: true},
                        {name: 'Battles Per Day', value: `**${psdata.playerfinal.bpd.toFixed(0)}**`, inline: true},
                        {name: 'Average Tier', value: `**${psdata.playerfinal.avgTier.toFixed(2)}**`, inline: true},
                        {name: 'Survival Ratio', value: `**${(psdata.playerfinal.survive * 100).toFixed(2)}%**`, inline: true},
                        {name: 'Win + Survived Ratio', value: `**${(psdata.playerfinal.win_and_survive * 100).toFixed(2)}%**`, inline: true},
                        {name: 'Maximum Experience', value: `**${psdata.playerfinal.max_xp} on ${psdata.playerfinal.max_xp_tank}**`, inline: true},
                        {name: 'Average Experience', value: `**${psdata.playerfinal.avgexp.toFixed(2)}**`, inline: true},
                        {name: 'Cap Per battle', value: `**${psdata.playerfinal.cap.toFixed(2)}**`, inline: true},
                        {name: 'Defend Per Battle', value: `**${psdata.playerfinal.defend.toFixed(2)}**`, inline: true},
                        {name: 'Replays of this player', value: `[Link to this player's replays on WOTInspector.com](http://wotinspector.com/en/replays/sort/ut/?pl=${psdata.acc_id}#filters)`, inline: true}
                    ],
                    timestamp: new Date(psdata.playerfinal.last_battle_time),
                    footer: {icon_url: SerBot.user.avatarURL, text: 'Detailed Time last played'}}
            });

            if(rating){
                let ratingreq = JSON.parse(await request.Request(`https://wotblitz.${realm.exception_domain}/${realm.lan}/api/rating-leaderboards/user/${psdata.acc_id}/?neighbors=0`));
                if(ratingreq === undefined){
                    throw {
                        response: ratingreq,
                        error: SerBotDetails.ErrorArray.WG_api_Error
                    }
                }
                let norating = false;
                switch (ratingreq.league_index){
                    case 0:
                        psdata.playerfinal.league_name = 'Diamond League'; psdata.playerfinal.league_img = "a1.png"; psdata.playerfinal.league_color = 5910901; break;
                    case 1:
                        psdata.playerfinal.league_name = 'Platinum League'; psdata.playerfinal.league_img = "f1.png"; psdata.playerfinal.league_color = 8607645; break;
                    case 2:
                        psdata.playerfinal.league_name = 'Gold League'; psdata.playerfinal.league_img = "b1.png"; psdata.playerfinal.league_color = 37887; break;
                    case 3:
                        psdata.playerfinal.league_name = 'Silver League'; psdata.playerfinal.league_img = "d1.png"; psdata.playerfinal.league_color = 14136832; break;
                    case 4:
                        psdata.playerfinal.league_name = 'Bronze League'; psdata.playerfinal.league_img = "c1.png"; psdata.playerfinal.league_color = 13447987; break;
                    default:
                        norating = true; break;
                }
                if(norating){
                    message.channel.send(`No Rating Battle Record has been found for this player.`)
                } else {
                    if(ratingreq.number !== null){
                        psdata.playerfinal.league_ranking  = `${ratingreq.number} (Calibrated)`
                    } else {
                        psdata.playerfinal.league_ranking  = `Calibration not completed, ${ratingreq.calibrationBattlesLeft} battles left`
                    }
                    psdata.playerfinal.league_rating = ratingreq.score;
                    message.channel.send('', {
                        embed: {
                            color: psdata.playerfinal.league_color,
                            author: {name: 'SerBot Player Data Checking Beta (Ratings Module)', icon_url: SerBot.user.avatarURL},
                            thumbnail:{url: `http://static-wbp-sg.wgcdn.co/dcont/1.28.0/fb/image/${psdata.playerfinal.league_img}`},
                            title: `Embeded Reply of Rating Statistics For ${psdata.ign} From ${realm.server_fullName}` ,
                            fields: [
                                {name: 'Player Rating', value: `**${psdata.playerfinal.league_rating} (${psdata.playerfinal.league_name})**`, inline: true},
                                {name: 'Ranking', value: `**${psdata.playerfinal.league_ranking}**`, inline: true}
                            ],
                            footer: {icon_url: SerBot.user.avatarURL, text: 'Provided by The Forever Loyal SerBot™'
                            }
                        }
                    });
                }
            }


            //debug command
            if(debug){
                message.channel.send('Debugging Purposes Only File', {
                    file:{
                        attachment: Buffer.from(JSON.stringify(psdata,null,2),'utf8'),
                        name: 'debug.json'
                    }
                })
            }
            message.channel.stopTyping();
            afterTypingCheck(message.channel);
        }
        catch (error) {
            if (error.response !== undefined){
                errorReply(error.error, message, SerBotDetails.CommandArray.PSArray);
                message.channel.send(`Returned API: \`\`\`json\n${JSON.stringify(error.response,null,2)}\`\`\``);
                SerbLog(`Reply:\n${JSON.stringify(error.response,null,2)}`)
            } else if (error.sus === undefined) {
                errorReply(SerBotDetails.ErrorArray.Unexpected_Error, message, SerBotDetails.CommandArray.PSArray);
                message.channel.send(`Error Message: ${error}`);
                SerbLog(`Unexpected Error: ${error}`)
            } else {
                errorReply(error, message, SerBotDetails.CommandArray.PSArray)
            }
        }
    }

    //replays
    if (commandAliasCheck(fullInput,SerBotDetails.CommandArray.ReplaysArray)){
        try{
            // for permanently watching the replays.
            if(fullInput[1] !== undefined){
                switch(fullInput[1].toLowerCase()){
                    case "add":
                    case "add-channel":
                    case "addchannel":
                        if (!hasPermission("MANAGE_GUILD",message)){throw SerBotDetails.ErrorArray.Insufficient_Permission_Server}
                        if (await replay.addAutoChannel(message.guild.id, message.channel.id)){
                            message.channel.send('',{embed: {description: `SerBot is now watching this channel, <#${message.channel.id}> for replays!`, color: 3097087}})
                        } else {
                            message.channel.send('', {embed: {description: `SerBot has already been watching this channel for replays!`, color: 16711680}})
                        }
                        return;
                    case "remove":
                    case "remove-channel":
                    case "removechannel":
                        if (!hasPermission("MANAGE_GUILD",message)){throw SerBotDetails.ErrorArray.Insufficient_Permission_Server}
                        if (await replay.removeAutoChannel(message.guild.id, message.channel.id)){
                            message.channel.send('',{embed: {description: `Channel <#${message.channel.id}>, is now removed from SerBot's automatic replays detection system!`, color: 3097087}})
                        } else {
                            message.channel.send('', {embed: {description: `SerBot isn't watching this channel for replays!`, color: 16711680}});
                        }
                        return;
                }
            }
            let replayURL;
            let title;

            //search for replays
            if (message.attachments.array()[0] === undefined && fullInput[1] === undefined) {
                throw SerBotDetails.ErrorArray.Missing_Attachment_Replay;
            }

            //if the replay is in the message as url
            if (message.attachments.array()[0] === undefined) {
                replayURL = fullInput[1];
                if(fullInput[2] === undefined){
                    title = undefined
                } else {
                    title = fullInput.slice(2).join(" ")
                }
            } else {
                //if the replay is in the attachment
                replayURL = message.attachments.array()[0].url;
                if(fullInput[1] === undefined){
                    title = undefined
                } else {
                    title = fullInput.slice(1).join(" ")
                }
            }

            //if the attachment is not a wotbreplay
            if(!replayURL.endsWith("wotbreplay")){
                throw SerBotDetails.ErrorArray.Missing_Attachment_Replay;
            }

            //now wait for the reply
            message.channel.startTyping();
            const reply = await replay.uploadReplay(SerBot.user.avatarURL,replayURL,title);
            message.channel.send(reply.content, reply);

            //usual logging
            SerbLog(`The User ${message.author.username} From ${message.guild} at Channel #${message.channel.name} Uploaded Replays.`);

            message.channel.stopTyping();
        } catch (error){
            if (error.response !== undefined){
                errorReply(error.error, message, SerBotDetails.CommandArray.ReplaysArray);
                message.channel.send(`Returned API: \`\`\`json\n${JSON.stringify(error.response,null,2)}\`\`\``);
                SerbLog(`Reply:\n${JSON.stringify(error.response,null,2)}`)
            } else if (error.sus === undefined) {
                errorReply(SerBotDetails.ErrorArray.Unexpected_Error, message, SerBotDetails.CommandArray.ReplaysArray);
                message.channel.send(`Error Message: ${error}`);
                SerbLog(`Unexpected Error: ${error}`)
            } else {
                errorReply(error, message, SerBotDetails.CommandArray.ReplaysArray)
            }
        }
    } else if (message.channel.type === "text" && replay.isReplayChannel(message.guild.id,message.channel.id)){
        try{
            let replayURL = undefined;
            let title = undefined;
            if(message.attachments.array()[0] !== undefined){
                if(message.attachments.array()[0].url.endsWith('.wotbreplay')){
                    replayURL = message.attachments.array()[0].url;
                    title = message.cleanContent;
                }
            } else if (fullInput[0].endsWith('.wotbreplay')){
                replayURL = fullInput[0];
                title = fullInput.slice(1).join(" ");
            }
            if(replayURL !== undefined){
                message.channel.startTyping();
                const reply = await replay.uploadReplay(SerBot.user.avatarURL,replayURL,title);
                SerbLog(`The User ${message.author.username} From ${message.guild} at Channel #${message.channel.name} Uploaded Replays via AUTOMATIC REPLAY DETECTION.`);
                message.channel.send(reply.content, reply);
                message.channel.stopTyping();
            }
        } catch (error){
            errorReply(SerBotDetails.ErrorArray.Unexpected_Error, message, SerBotDetails.CommandArray.ReplaysArray);
            message.channel.send(`Error Message: ${error}`);
            SerbLog(`Unexpected Error: ${error}`)
        }
    }
});

SerBot.on('error', error => {
    SerbLog(`WebSocket Error! : ${error.message}`);
});

SerBot.login(SerBotTokens.Token).then(console.log(`Login Successful! Initializing`));
