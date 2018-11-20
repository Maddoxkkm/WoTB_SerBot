const realm = require('./Region.js');
const request = require('./request.js');

exports.playerStats = function (realm, IGN){
    return new Promise(async function(resolve, reject){
        
    })
};
exports.playerStats = function (ID){
    return new Promise(async function(resolve, reject){
        const realm = playerRealm(ID);
    })
};

function playerRealm (ID){
    if(ID < 500000000){
        return realm.RU;
    }
    if(ID < 1000000000){
        return realm.EU;
    }
    if (ID < 2000000000) {
        return realm.NA;
    }
    return realm.ASIA;
}

async function playerClan (ID){
    return new Promise(async function(resolve, reject) {
        try{
            //first get realm
            const realm = playerRealm(ID);
            let clanCheck = await request.WGApiCall(`${realm.apiDomain}/wotb/clans/accountinfo/?application_id=71df07a3f5c764028c167d09eec0cd99&account_id=${ID}&fields=clan%2Cjoined_at&extra=clan`);
            resolve(clanCheck)
        } catch(err){
            reject(err)
        }
    })
}

exports.playerClan = playerClan;
exports.playerRealm = playerRealm;