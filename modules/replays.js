const medalList = require('./medal_replay.json');
const player = require('./playerstats.js');

//Enmap loading
const Enmap = require('enmap');
const EnmapSQLite = require('enmap-sqlite');
const autoUploadChannels = new Enmap({ provider: new EnmapSQLite({ name: 'GuildSettings' }) });

//load request for uploading
const request = require('./request.js');

//other utils
const util = require('./util.js');

async function addAutoChannel(guildID, channelID){
    try{
        //whether the record itself exists.
        if(autoUploadChannels.has(guildID)){
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
        if(autoUploadChannels.has(guildID)){
            //whether the property exists
            if(autoUploadChannels.hasProp(guildID,"replayChannelsArray")){
                //whether it's actually included in the list
                let replayChannelsArray = autoUploadChannels.getProp(guildID,"replayChannelsArray")
                if(replayChannelsArray.includes(channelID)){
                    //then remove it
                    autoUploadChannels.removeFrom(guildID,"replayChannelsArray", channelID.toString());
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

function isReplayChannel(guildID, channelID){
    try{
        if(autoUploadChannels.has(guildID)){
            let replayChannelsArray = autoUploadChannels.getProp(guildID, "replayChannelsArray");
            if (replayChannelsArray.includes(channelID)){
                return true;
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

                if(!summaryObj.details){
                    resolve({
                        embed:{
                            color: 16711680,
                            description: "No Battle results found! Please make sure you have stayed for the entire game so the battle results are also within the replay!"
                        }
                    })
                } else {
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

                    const epicMedalsArray = summaryObj.details.achievements.reduce((totalArray, curAcheieve) => {
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
                            pointsfieldValue = `${summaryObj.details.base_capture_points} / ${summaryObj.details.base_defend_points}`;
                            break;
                        case 1:
                            roomType = 'Supremacy Battle';
                            pointsfieldName = 'Victory Points Earned / Stolen';
                            pointsfieldValue = `${summaryObj.details.wp_points_earned} / ${summaryObj.details.wp_points_stolen}`;
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
                                    {name: 'Damage Dealt', value: `**${summaryObj.details.damage_made}**`, inline: true},
                                    {name: 'Damage Taken', value: `**${summaryObj.details.damage_received}**`, inline: true},
                                    {name: 'Assist Damage', value: `**${summaryObj.details.damage_assisted}**`, inline: true},
                                    {
                                        name: 'Experience (Base / Total)',
                                        value: `**${summaryObj.exp_base} / ${summaryObj.exp_total}**`
                                    },
                                    {
                                        name: 'Shots Fired / Hit / Penetrated / Splash (Hit Rate)',
                                        value: `**${summaryObj.details.shots_made} / ${summaryObj.details.shots_hit} / ${summaryObj.details.shots_pen} / ${summaryObj.details.shots_splash} (${((summaryObj.details.shots_hit / summaryObj.details.shots_made) * 100).toFixed(2)}%)**`
                                    },
                                    {
                                        name: 'Hits Taken / Penetrated / Not Penetrated / Splash',
                                        value: `**${summaryObj.details.hits_received} / ${summaryObj.details.hits_pen} / ${summaryObj.details.hits_bounced} / ${summaryObj.details.hits_splash}**`
                                    },
                                    {
                                        name: 'Enemies Damaged / Killed',
                                        value: `**${summaryObj.details.enemies_damaged} / ${summaryObj.details.enemies_destroyed}**`,
                                        inline: true
                                    },
                                    {name: pointsfieldName, value: `**${pointsfieldValue}**`, inline: true},
                                    {
                                        name: 'Credits (Base / Total)',
                                        value: `**${summaryObj.credits_base} / ${summaryObj.credits_total}**`,
                                        inline: true
                                    },
                                    { name: 'Time Alive', value: `**${util.ConvertTime(summaryObj.details.time_alive*1000)}**`},
                                    { name: 'Mileage (in Meters)' , value: `**${summaryObj.details.distance_travelled}**` }
                                ],
                                "timestamp": new Date(summaryObj.battle_start_timestamp*1000),
                                footer: {icon_url: SerBot, text: 'Support SerBot and WOTInspector! | Time of Battle'}
                            }
                        }
                    )
                }
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