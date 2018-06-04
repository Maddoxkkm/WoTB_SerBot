const medalList = require('./medal_replay.json');
const player = require('./playerstats.js');

//Enmap loading
const Enmap = require('enmap');
const EnmapSQLite = require('enmap-sqlite');
const autoUploadChannels = new Enmap({ provider: new EnmapSQLite({ name: 'GuildSettings' }) });

//load request for uploading
const request = require('./request.js');

async function addAutoChannel(guildID, channelID){
    try{
        await autoUploadChannels.defer;
        //whether the record itself exists.
        if(await autoUploadChannels.has(guildID)){
            //whether the property exists
            if(autoUploadChannels.hasProp(guildID,"replayChannelsArray")){
                //whether it's already included in the list
                if(!autoUploadChannels.getProp(guildID,"replayChannelsArray").includes(channelID)){
                    //then add it
                    autoUploadChannels.pushIn(guildID, "replayChannelsArray", channelID, false);
                    return true;
                }
            } else {
                //if property doesn't exist
                autoUploadChannels.setProp(guildID,"replayChannelsArray", [channelID]);
                return true;
            }
        } else {
            //the record itself doesn't exist
            await autoUploadChannels.setAsync(guildID, {replayChannelsArray: [channelID]});
            return true;
        }
        return false;
    } catch (err){
        console.log(err, "Some error occured");
        return false;
    }
}

async function removeAutoChannel(guildID, channelID){
    try{
        //whether the record itself exists.
        if(await autoUploadChannels.has(guildID)){
            //whether the property exists
            if(autoUploadChannels.hasProp(guildID,"replayChannelsArray")){
                //whether it's actually included in the list
                if(autoUploadChannels.getProp(guildID,"replayChannelsArray").includes(channelID)){
                    //then remove it
                    //autoUploadChannels.removeFrom(guildID,"replayChannelsArray", channelID.toString());
                    let newChannelArray = autoUploadChannels.getProp(guildID,"replayChannelsArray").filter(x => x !== `${channelID}`);
                    autoUploadChannels.setProp(guildID,"replayChannelsArray",newChannelArray);
                    return true;
                }
            } else {
                //if property doesn't exist
                autoUploadChannels.setProp(guildID,"replayChannelsArray", []);
            }
        } else {
            //the record itself doesn't exist
            await autoUploadChannels.setAsync(guildID, {replayChannelsArray: []})
        }
        return false;
    } catch (err){
        console.log(err, "Some error occured");
        return false;
    }
}

async function isReplayChannel(guildID, channelID){
    try{
        if(await autoUploadChannels.has(guildID)){
            let replayChannelsArray = autoUploadChannels.getProp(guildID, "replayChannelsArray");
            if (replayChannelsArray.includes(channelID)){
                return true
            }
        }
        return false;
    } catch (err){
        console.log(err, "Error Occured when checking whether channel is replayChannel");
        return false;
    }
}

function uploadReplay(SerBot, url, title = undefined){
    return new Promise(async function(resolve, reject){
        try {
            let replayrequestURL;
            if (title === undefined) {
                replayrequestURL = `https://wotinspector.com/api/replay/upload/?url=${url}`
            } else {
                replayrequestURL = `https://wotinspector.com/api/replay/upload/?url=${url}&title=${title}`
            }

            let response = JSON.parse(await request.Request(replayrequestURL));

            //eval response valid or not
            if (response.status === "ok") {

                const summaryObj = response.data.summary;

                //BattleType
                let gamemode;
                switch (summaryObj.battle_type){
                    case 2:
                        gamemode = "Training Room";
                        break;
                    case 4:
                        gamemode = "Tournament";
                        break;
                    case 7:
                        gamemode = "Rating Battle";
                        break;
                    default:
                        gamemode = "Random Battle";
                        break;
                }

                //process realm
                const serverName = player.playerRealm(summaryObj.protagonist).server_fullName;

                //parsing Mastery Data
                let masteryData = {};
                switch (summaryObj.mastery_badge) {
                    case 1:
                        masteryData.class = '3rd Class Mastery';
                        masteryData.color = 4233663;
                        break;
                    case 2:
                        masteryData.class = '2nd Class Mastery';
                        masteryData.color = 3764934;
                        break;
                    case 3:
                        masteryData.class = '1st Class Mastery';
                        masteryData.color = 7945606;
                        break;
                    case 4:
                        masteryData.class = 'Ace Tanker';
                        masteryData.color = 4198512;
                        break;
                    default:
                        masteryData.class = '';
                        masteryData.color = 3097087;
                        break;
                }

                //process achievement list
                let achievementArray = [];
                if (masteryData.class !== '') {
                    achievementArray.push(masteryData.class);
                }

                const epicMedalsArray = summaryObj.achievements.reduce((totalArray, curAcheieve) => {
                    if (medalList[curAcheieve.t] !== undefined) {
                        totalArray.push(medalList[curAcheieve.t]);
                    }
                    return totalArray;
                }, achievementArray);

                let epicMedalsString = epicMedalsArray.join(', ');
                if (epicMedalsArray.length === 0){
                    epicMedalsString = 'No Epic Achievements recorded for this battle'
                }

                //check if tank name is returned properly
                let vehicle;
                if (summaryObj.vehicle === null) {
                    vehicle = 'Unknown Tank (Not recorded in Database)'
                } else {
                    vehicle = summaryObj.vehicle
                }

                // Room Type
                let roomType;
                let pointsfieldName;
                let pointsfieldValue;
                switch (summaryObj.battle_type) {
                    case 0:
                        roomType = 'Standard Battle';
                        pointsfieldName = 'Capture Points Earned / Dropped';
                        pointsfieldValue = `${summaryObj.capture_points} / ${summaryObj.capture_points_dropped}`;
                        break;
                    case 1:
                        roomType = 'Supremacy Battle';
                        pointsfieldName = 'Victory Points Earned / Stolen';
                        pointsfieldValue = `${summaryObj.wp_points_earned} / ${summaryObj.wp_points_stolen}`;
                        break;
                }

                // Win or lose
                let win;
                if (summaryObj.battle_result === 1) {
                    win = 'Victory'
                } else {
                    win = 'Defeat'
                }

                //name display
                let clan = await player.playerClan(summaryObj.protagonist);
                const nameDisplay = `${summaryObj.player_name} [${clan.data[summaryObj.protagonist].clan.tag}]`;

                resolve({
                        content: `\`\`\`\nSerBot Replay Report V 1.0 - brought to you with the help of WOTInspector.com!\n===========================\n Replay Title: ${summaryObj.title}\n       Player: ${nameDisplay} from ${serverName}\n Tank and Map: ${vehicle}, on Map ${summaryObj.map_name}\n  Battle Type: ${gamemode}\n    Game Mode: ${roomType}\n       Result: ${win}\n Achievements: ${epicMedalsString}\n===========================\nNote: If you don't see the embeded message with Replay Statistics below this line, please Enable >Embed Links< Permission For SerBot!\`\`\``,
                        embed: {
                            color: masteryData.color,
                            author: {name: 'SerBot Replay Data Parsing V 1.0 - By SerBot & WOTInspector', icon_url: SerBot},
                            title: `Embeded Reply of Replay Statistics For ${summaryObj.player_name}`,
                            "thumbnail": {
                                "url": "https://i.imgur.com/AyWeJNM.png"
                            },
                            description: `Details of Battle Statistics - View Detailed Statistic on [WOTInspector Replays](${response.data.view_url})`,
                            fields: [
                                {name: 'Damage Dealt', value: `**${summaryObj.damage_made}**`, inline: true},
                                {name: 'Damage Taken', value: `**${summaryObj.damage_received}**`, inline: true},
                                {name: 'Assist Damage', value: `**${summaryObj.damage_assisted}**`, inline: true},
                                {
                                    name: 'Experience (Base / Total)',
                                    value: `**${summaryObj.exp_base} / ${summaryObj.exp_total}**`
                                },
                                {
                                    name: 'Shots Fired / Hit / Penetrated (Hit Rate)',
                                    value: `**${summaryObj.shots_made} / ${summaryObj.shots_hit} / ${summaryObj.shots_pen} (${((summaryObj.shots_hit / summaryObj.shots_made) * 100).toFixed(2)}%)**`
                                },
                                {
                                    name: 'Hits Taken / Penetrated / Not Penetrated',
                                    value: `**${summaryObj.hits_received} / ${summaryObj.hits_pen} / ${summaryObj.hits_bounced}**`
                                },
                                {
                                    name: 'Enemies Damaged / Killed',
                                    value: `**${summaryObj.enemies_damaged} / ${summaryObj.enemies_destroyed}**`,
                                    inline: true
                                },
                                {name: pointsfieldName, value: `**${pointsfieldValue}**`, inline: true},
                                {
                                    name: 'Credits (Base / Total)',
                                    value: `**${summaryObj.credits_base} / ${summaryObj.credits_total}**`,
                                    inline: true
                                },
                            ],
                            footer: {icon_url: SerBot, text: 'Support SerBot and WOTInspector!'}
                        }
                    }
                )
            } else {
                reject(response)
            }
        } catch (err){
            console.log(err)
        }
    })
}

exports.removeAutoChannel = removeAutoChannel;
exports.isReplayChannel = isReplayChannel;
exports.addAutoChannel = addAutoChannel;
exports.uploadReplay = uploadReplay;