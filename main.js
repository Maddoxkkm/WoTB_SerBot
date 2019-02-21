//load Bot tokens
const tokens = require('./token.json');
const discordToken = tokens.discordToken;
const wgapiToken = tokens.wgapiToken;
const targetGuild = tokens.guildID;
const serverport = tokens.serverport;

//manually set prefix and command invoke
const prefix = 'wg!';
const commandInvoke = '-';

//Discord
const Discord = require("discord.js");
const authBot = new Discord.Client({
    messageCacheLifetime: 60,
    messageSweepInterval: 400,
    messageCacheMaxSize: 10,
    disabledEvents: ["TYPING_START"]
});

//Region and related stuff
const region = require('./modules/region.js');

//Enmap Interface
const playerDB = require('./modules/data.js');

//Import webservice
const http = require('http');
const url = require('url');

//import homemade requests :3
const request = require('./modules/request.js');

/**
 * A Function that converts ms to a String that indicates lengh ot time
 * @param {number} ms
 * @return {string}
 * @constructor
 */
function convertMS(ms){
    let timeArray = [];
    let temp = Math.floor(ms / 1000);
    let sec = temp % 60;
    temp = Math.floor(temp / 60);
    let min = temp % 60;
    temp = Math.floor(temp / 60);
    let hrs = temp % 24;
    temp = Math.floor(temp / 24);
    let days = temp;

    if(days > 0){
        if(days === 1){
            timeArray.push("1 Day")
        } else {
            timeArray.push(`${days} Days`)
        }
    }

    if(hrs > 0){
        if(hrs === 1){
            timeArray.push("1 Hour")
        } else {
            timeArray.push(`${hrs} Hours`)
        }
    }

    if(min > 0){
        if(min === 1){
            timeArray.push("1 Minute")
        } else {
            timeArray.push(`${min} Minutes`)
        }
    }

    if(sec > 0){
        if(days === 1){
            timeArray.push("1 Second")
        } else {
            timeArray.push(`${sec} Seconds`)
        }
    }
    return timeArray.join(", ");
}

function serverShortNametoRegion(serverShortName){
    switch(serverShortName){
        case region.NA.shortServerName:
            return region.NA;
        case region.EU.shortServerName:
            return region.EU;
        case region.ASIA.shortServerName:
            return region.ASIA;
        case region.RU.shortServerName:
            return region.RU;
        default:
            throw "Invalid Region";
    }
}

const commands = [
    {
        name: "Identity Verification command",
        command: ["verify","identity"],
        description: "Used to link your Wargaming to your Discord account.",
        do: function(message, args){
            sendVerification(message.author)
        },
        permission: function(guildUser){
            return !playerDB.hasPlayer(guildUser.id);
        }
    }
];

authBot.on('ready', function(){
    //verify whether the bot is in the guild or not
        const guild = authBot.guilds.get(targetGuild);
    if(!authBot.guilds.has(targetGuild)) {
        console.log('The Bot will be idle until it has joined the target guild');
    } else {

        console.log(`bot is ready to serve in "${guild.name}" with ${guild.memberCount} members`)
    }
    guild.roles.map(function(value,key,collection){
        console.log(`${key}, ${value.name}`)
    });

    http.createServer(async function (req, res) {
        try {
            //Return the url part of the request object:
            const parsed = url.parse(req.url, true);
            const uriArray = parsed.pathname.split('/').filter(x => x !== '');
            if(uriArray.length === 3 && uriArray[0] === "regPlayer"){
                // known the uri is for regPlayer, we can continue to check the region,
                const realm = serverShortNametoRegion(uriArray[1]);

                //got the region, next is to grab the Discord ID, and record everything about it
                const discordID = uriArray[2].toString();
                //See if the user is accessible
                const targetUser = authBot.users.get(discordID);
                if(targetUser === undefined) throw "Invalid Discord User";
                if(parsed.query.status === "error") throw JSON.stringify(parsed.query);

                //now we've got everything, time to grab the access token (and verify it), not the player ID directly (because the call can be made up and checking validity of token is more secure)
                const newToken = JSON.parse(await request.Post({url:`https://api.worldoftanks.${realm.toplevelDomain}/wot/auth/prolongate/`, form:{access_token: parsed.query.access_token, application_id: wgapiToken}}));
                if(newToken.status === "error") throw JSON.stringify(newToken);

                //Only if the token is confirmed valid (not made up), we then proceed to add the player to the record
                await playerDB.setPlayer(newToken.data.account_id, realm,discordID);

                targetUser.send('',{
                    embed: {
                        color: 3097087,
                        author: {
                            name: authBot.user.username,
                            icon_url: authBot.user.avatarURL
                        },
                        title: `${authBot.user.username}'s Vericifation Module`,
                        description: `You have successfully verified your Wargaming Identity, ${playerDB.mainStorage.getProp(discordID,'player.nickname')}!`,
                    }});
                const guildUser = guild.members.get(discordID);
                ignSet(guildUser);
                grantRoles(guildUser);
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(`You have successfully verified your identity, ${authBot.user.username} will send you a PM to confirm!`);
            } else {
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.write("ERROR 404 NOT FOUND");
            }
            res.end();
        } catch (e) {
            console.log(e);
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.write(`ERROR 404 NOT FOUND\<\p\> REASON: ${e}`);
            res.end();
        }}).listen(serverport);
});

//log any error
authBot.on('error', error => console.log(`ERROR: ${error}`));

//When a new member joins the observing server
authBot.on('guildMemberAdd', guildMember => {
    //ignore any member join that is not part of the guild && has already verified
    if (guildMember.guild.id === targetGuild && !playerDB.hasPlayer(guildMember.id)) {
        sendVerification(guildMember.user)
    }
});

async function ignSet(guildMember){
    try{
        //if the bot can't do anything to the member then forget about it.
        if(guildMember.manageable){
            const memberid = guildMember.id;
            const reasonString = `${authBot.user.username}'s NickName Update Service`;
            if(!playerDB.hasPlayer(memberid)) throw "Player does not exist?";
            const memberData = playerDB.mainStorage.get(memberid);
            console.log(memberData);
            const ign = memberData.player.nickname;
            const clanData = memberData.clan;
            const server = memberData.region;
            if(clanData === null){
                await guildMember.setNickname(`${ign} (${server})`, reasonString);
            } else {
                await guildMember.setNickname(`${ign} [${clanData.clan.tag}] (${server})`, reasonString)
            }
        }
    } catch (e) {
        throw e
    }
}

async function grantRoles(guildMember){
    //feel free to edit this to grant whatever roles you like
    try {
        const memberid = guildMember.id;
        const reasonString = `${authBot.user.username}'s Role Update Service`;
        if(playerDB.hasPlayer(memberid)){
            await guildMember.addRole('529865664941391872', reasonString);
            const playerStats = playerDB.mainStorage.getProp(memberid, "player");
            const wr = playerStats.statistics.all.wins/playerStats.statistics.all.battles;
            const battles = playerStats.statistics.all.battles;
            if(wr>=0.6 && battles>=15000){
                await guildMember.addRole('529865726492934155', reasonString);
            }
        }
    } catch (e) {
        throw e
    }

}

function sendVerification(user){
    const guild = authBot.guilds.get(targetGuild);
    user.send('',{
        embed: {
            color: 3097087,
            author: {
                name: authBot.user.username,
                icon_url: authBot.user.avatarURL
            },
            title: `${authBot.user.username}'s Vericifation Module`,
            description: `Verify your Wargaming Identity in order to enjoy the full member privilage of **${guild.name}**!\nPlease click on one of the following links corresponding to the server you play on, and login using your credentials! This bot has no access to any info about your account details, as you will be logging in via Wargaming's portals.\n\nAlso, Do **NOT** share this link to anyone else, as they will be able to link their Wargaming account to your Discord ID, which is irreversible!\n\nBy Signing in and verifying your identity, you agree to obey the rules and regulations of **${guild.name}**.`,
            fields: [
                {
                    'name':`${region.NA.serverName}`,
                    'value':`[Click Here](https://api.worldoftanks.com/wot/auth/login/?application_id=${wgapiToken}&redirect_uri=http://${tokens.serverDomainPort}/regPlayer/${region.NA.shortServerName}/${user.id}/)`
                },
                {
                    'name':`${region.EU.serverName}`,
                    'value':`[Click Here](https://api.worldoftanks.eu/wot/auth/login/?application_id=${wgapiToken}&redirect_uri=http://${tokens.serverDomainPort}/regPlayer/${region.EU.shortServerName}/${user.id}/)`
                },
                {
                    'name':`${region.ASIA.serverName}`,
                    'value':`[Click Here](https://api.worldoftanks.asia/wot/auth/login/?application_id=${wgapiToken}&redirect_uri=http://${tokens.serverDomainPort}/regPlayer/${region.ASIA.shortServerName}/${user.id}/)`
                },
                {
                    'name':`${region.RU.serverName}`,
                    'value':`[Click Here](https://api.worldoftanks.ru/wot/auth/login/?application_id=${wgapiToken}&redirect_uri=http://${tokens.serverDomainPort}/regPlayer/${region.RU.shortServerName}/${user.id}/)`
                }
            ]
        }
    })
}

//react to messages
authBot.on('message', message => {
    if(!message.content.toLowerCase().startsWith(prefix) || message.guild === null) return;
    const args = message.content.split(' ');

    const finalCommand = commands.reduce(function(prev, cur){
        let equal = false;
        cur.command.map(function(commandCall){
            if(args[0].toUpperCase() === prefix.toUpperCase() + commandCall.toUpperCase()){
                equal = true;
            }
        });
        if(equal === true){
            return cur;
        }
    },undefined);

    if(finalCommand !== undefined) finalCommand.do(message,args)

    // Update their data when they send messages, and their last update is 6 hours ago


});

authBot.login(discordToken)
    .then(console.log('login successful'))
    .catch(err => console.log(err));


module.exports = authBot;

