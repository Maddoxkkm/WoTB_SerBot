/*
    This module strictly requires all variables to be declared with const whenever possible.
 */
const realm = require('./region.js');
const request = require('./request.js');
const token = require('../SerBot.json').Api_Token;
const SerBotDetails = require('./serbot_details.js');



/**
 *
 * @param realm
 * @param id
 * @return {Promise<Player>}
 */
function players(realm, id){
    return new Promise(async function(resolve, reject){
        try{
            //1st call for overview
            const overview = (await request.WGApiCall(`${realm.apiDomain}/wotb/account/info/?application_id=${token}&language=en&account_id=${id}&fields=-statistics.clan%2C+-statistics.frags%2C+-private`)).data[id];
            const overviewStats = overview.statistics.all;
            let processedOverview = {
                ign: overview.nickname,
                acc_id: overview.account_id,
                raw: {
                    overview: overview
                },
                processed: {
                    created: new Date(overview.created_at*1000).toLocaleDateString(),
                    lastBattleTime: overview.last_battle_time*1000,
                    battles: overviewStats.battles
                }

            }
            //2nd call for tank-specific stats
            const tankStats = (await request.WGApiCall(`${realm.apiDomain}/wotb/tanks/achievements/?application_id=${token}&account_id=${id}`)).data[id];
            if (tankStats === null) throw SerBotDetails.ErrorArray.No_Battles;
            const tankArray = require('../TankArray.json');
            const tankTiers = tankStats.reduce((total, x) => {
                if (tankArray.data[x.tank_id] !== undefined) {
                    total.tier += (tankArray.data[x.tank_id].tier * x.all.battles);
                    total.battles += x.all.battles;
                }
                return total
            }, {tier: 0, battles: 0});
        } catch (e){
            reject(e)
        }

    })
}

function playerStatsWithIGN(realm, ign, fuzzy){
    return new Promise(async function(resolve, reject){
        //Using Wargaming API to get the id
        try {
            let ignReturn;
            if(fuzzy) {
                ignReturn = await request.WGApiCall(`${realm.apiDomain}/wotb/account/list/?application_id=${token}&type=startswith&search=${ign}&limit=1`)
            } else {
                ignReturn = await request.WGApiCall(`${realm.apiDomain}/wotb/account/list/?application_id=${token}&type=exact&search=${ign}`)
            }

            //Throw when no player is found
            if(firstcheck.meta.count === 0) throw SerBotDetails.ErrorArray.No_Player;

            const result = await players(realm, ignReturn.data[0].nickname);
            resolve(result);
        } catch (e){
            // If anything is caught (mainly from await), reject.
            reject(e);
        }
    })
}


/*
    poor way of getting data
 */
function playerStatsWithID(id){
    return new Promise(async function(resolve, reject){
        try {
            const realm = playerRealm(id);
            const result = await players(realm,id);
            resolve(result);
        } catch (e){
            // If anything is caught (mainly from await), reject.
            reject(e);
        }

    })
}

function playerRealm (id){
    if(id < 500000000){
        return realm.RU;
    }
    if(id < 1000000000){
        return realm.EU;
    }
    if (id < 2000000000) {
        return realm.NA;
    }
    return realm.ASIA;
}

async function playerClan (id){
    return new Promise(async function(resolve, reject) {
        try{
            //first get realm
            const realm = playerRealm(id);
            const clanCheck = await request.WGApiCall(`${realm.apiDomain}/wotb/clans/accountinfo/?application_id=71df07a3f5c764028c167d09eec0cd99&account_id=${id}&fields=clan%2Cjoined_at&extra=clan`);
            resolve(clanCheck)
        } catch(err){
            reject(err)
        }
    })
}

exports.playerClan = playerClan;
exports.playerRealm = playerRealm;
exports.playerStats = players;
exports.playerStatsWithID = playerStatsWithID;
exports.playerStatsWithIGN = playerStatsWithIGN;