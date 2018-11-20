//WN7 Calculation
exports.wn7 = function(tier,kills,dmg,spot,def,wr,battles){
    let wn7 = ((1240 - 1040 / Math.pow(Math.min(tier, 6), 0.164)) * kills)+(dmg * 530 / (184 * Math.pow(Math.E, (0.24 * tier)) + 130))+(spot * 125)+(Math.min(def, 2.2) * 100)+(((185 / (0.17 + Math.pow(Math.E, ((wr - 35) * - 0.134)))) - 500) * 0.45)-(((5 - Math.min(tier, 5)) * 125) / (1 + Math.pow(Math.E, ((tier - Math.pow((battles / 220), (3 / tier))) * 1.5))));
    let rating;
    switch (true){
        case (wn7 > 2050):
            rating = 'Super Unicum'; break;
        case (wn7 > 1850 && wn7 <= 2050):
            rating = 'Unicum'; break;
        case (wn7 > 1550 && wn7 <= 1850):
            rating = 'Great'; break;
        case (wn7 > 1350 && wn7 <= 1550):
            rating = 'Very Good'; break;
        case (wn7 > 1100 && wn7 <= 1350):
            rating = 'Good'; break;
        case (wn7 > 900 && wn7 <= 1100):
            rating = 'Average'; break;
        case (wn7 > 700 && wn7 <= 900):
            rating = 'Below Average'; break;
        case (wn7 > 500 && wn7 <= 700):
            rating = 'Bad'; break;
        default:
            rating = 'Very Bad'; break;
    }
    return {wn7: wn7, rating}
};

//MGR 2.2 Calculation Function
exports.MGR = function(playerdata){
    let MGRTable = require('./mgr.json');
    playerdata.tanks_data.map(x => {
        if(MGRTable[x.tank_id] !== undefined){
            if((MGRTable[x.tank_id].tier === 7 && x.battles >= 30) || (MGRTable[x.tank_id].tier === 8 && x.battles >= 50) || (MGRTable[x.tank_id].tier === 9 && x.battles >= 75) || (MGRTable[x.tank_id].tier === 10 && x.battles >= 100)){
                x.MGRValue = (x.avg_dmg*MGRTable[x.tank_id].mgr_coeff*(1+(x.des_ratio/18))+33*x.wr+200*x.spots)*0.00909*(1+Math.min(2000,x.battles)*0.000075)
            }
        }
    });
    let weightingMGR = playerdata.tanks_data.reduce((total,x) => {
        if(x.MGRValue !== undefined){
            switch (MGRTable[x.tank_id].tier){
                case 7:
                    total.tier7.mgrtotal += x.MGRValue; total.tier7.count += 1; break;
                case 8:
                    total.tier8.mgrtotal += x.MGRValue; total.tier8.count += 1; break;
                case 9:
                    total.tier9.mgrtotal += x.MGRValue; total.tier9.count += 1; break;
                case 10:
                    total.tier10.mgrtotal += x.MGRValue; total.tier10.count += 1; break;}
        }
        return total;
    },{tier7: {mgrtotal: 0, count:0}, tier8: {mgrtotal: 0, count:0}, tier9: {mgrtotal: 0, count:0}, tier10: {mgrtotal: 0, count:0}
    });
    let weightedMGR = (weightingMGR.tier10.mgrtotal * 1.04 + weightingMGR.tier9.mgrtotal * 0.78 + weightingMGR.tier8.mgrtotal * 0.52 + weightingMGR.tier7.mgrtotal * 0.26)/(weightingMGR.tier10.count + weightingMGR.tier9.count * 0.75 + weightingMGR.tier8.count * 0.5 + weightingMGR.tier7.count * 0.25);
    playerdata.MGR = {};
    playerdata.MGR.MGR = weightedMGR * (1.08 - (playerdata.platooned_wins / 1000)) * (1 + (weightingMGR.tier10.count + weightingMGR.tier9.count + weightingMGR.tier8.count + weightingMGR.tier7.count) * 0.002083);
    switch (true){
        case (playerdata.MGR.MGR >= 60):
            playerdata.MGR.rating = 'Unicum'; break;
        case (playerdata.MGR.MGR >= 52 && playerdata.MGR.MGR < 60):
            playerdata.MGR.rating = 'Great'; break;
        case (playerdata.MGR.MGR >= 46 && playerdata.MGR.MGR < 52):
            playerdata.MGR.rating = 'Good'; break;
        case (playerdata.MGR.MGR >= 37 && playerdata.MGR.MGR < 46):
            playerdata.MGR.rating = 'Average'; break;
        case (playerdata.MGR.MGR >= 22 && playerdata.MGR.MGR < 37):
            playerdata.MGR.rating = 'Below Aveage'; break;
        case (playerdata.MGR.MGR >= 0 && playerdata.MGR.MGR < 22):
            playerdata.MGR.rating = 'Bad'; break;
        default:
            playerdata.MGR.rating = 'Unavailable'; break;
    }
    return playerdata
};

//WN8 Calculation Function (career wn8 only, WOTLABS Scale) TODO make a version for Per-Tank Stats, if needed
exports.wn8 = function(playerdata){
    let wn8Table = require('../BlitzStars.json');
    let wn8_cache = playerdata.tanks_data.reduce((total,x) => {
        if(wn8Table[x.tank_id] !== undefined && x.battles > 0){
            //rDamage accumulation
            total.rDamage.acc += x.battles * x.avg_dmg;
            total.rDamage.exp += x.battles * wn8Table[x.tank_id].dmg;
            //rSpot accumulation
            total.rSpot.acc += x.battles * x.spots;
            total.rSpot.exp += x.battles * wn8Table[x.tank_id].spot;
            //rFrag accumulation
            total.rFrag.acc += x.battles * x.kpb;
            total.rFrag.exp += x.battles * wn8Table[x.tank_id].frag;
            //rDef accumulation
            total.rDef.acc += x.battles * x.def;
            total.rDef.exp += x.battles * wn8Table[x.tank_id].def;
            //rWin accumulation
            total.rWin.acc += x.battles * (x.wr / 100);
            total.rWin.exp += x.battles * (wn8Table[x.tank_id].wr / 100);
        }
        return total
    }, {rDamage:{acc: 0, exp: 0}, rSpot:{acc: 0, exp: 0}, rFrag:{acc: 0, exp: 0}, rDef:{acc: 0, exp: 0}, rWin:{acc: 0, exp: 0}});
    //getting step 1 values
    wn8_cache.rDamage.value = wn8_cache.rDamage.acc / wn8_cache.rDamage.exp;
    wn8_cache.rSpot.value = wn8_cache.rSpot.acc / wn8_cache.rSpot.exp;
    wn8_cache.rFrag.value = wn8_cache.rFrag.acc / wn8_cache.rFrag.exp;
    wn8_cache.rDef.value = wn8_cache.rDef.acc / wn8_cache.rDef.exp;
    wn8_cache.rWin.value = wn8_cache.rWin.acc / wn8_cache.rWin.exp;

    //getting step 2 values
    wn8_cache.rWinC = Math.max(0, (wn8_cache.rWin.value - 0.71) / (1 - 0.71));
    wn8_cache.rDamageC = Math.max(0, (wn8_cache.rDamage.value - 0.22) / (1 - 0.22));
    wn8_cache.rFragC = Math.max(0, Math.min(wn8_cache.rDamageC + 0.2 ,(wn8_cache.rFrag.value - 0.12) / (1 - 0.12)));
    wn8_cache.rSpotC = Math.max(0, Math.min(wn8_cache.rDamageC + 0.1 ,(wn8_cache.rSpot.value - 0.38) / (1 - 0.38)));
    wn8_cache.rDefC = Math.max(0, Math.min(wn8_cache.rDamageC + 0.1 ,(wn8_cache.rDef.value - 0.10) / (1 - 0.10)));

    playerdata.wn8 = {
        wn8_cache,
        wn8: (980 * wn8_cache.rDamageC) + (210 * wn8_cache.rDamageC * wn8_cache.rFragC) + (155 * wn8_cache.rFragC * wn8_cache.rSpotC) + (75 * wn8_cache.rDefC * wn8_cache.rFragC) + (145 * Math.min(1.8, wn8_cache.rWinC))
    };
    switch (true){
        case (playerdata.wn8.wn8 >= 2900):
            playerdata.wn8.rating = 'Super Unicum'; playerdata.wn8.color = 4198512;  break;
        case (playerdata.wn8.wn8 >= 2450 && playerdata.wn8.wn8 < 2900):
            playerdata.wn8.rating = 'Unicum'; playerdata.wn8.color = 7945606; break;
        case (playerdata.wn8.wn8 >= 2000 && playerdata.wn8.wn8 < 2450):
            playerdata.wn8.rating = 'Great'; playerdata.wn8.color = 3764934; break;
        case (playerdata.wn8.wn8 >= 1600 && playerdata.wn8.wn8 < 2000):
            playerdata.wn8.rating = 'Very Good'; playerdata.wn8.color = 4233663; break;
        case (playerdata.wn8.wn8 >= 1200 && playerdata.wn8.wn8 < 1600):
            playerdata.wn8.rating = 'Good'; playerdata.wn8.color = 5075750; break;
        case (playerdata.wn8.wn8 >= 900 && playerdata.wn8.wn8 < 1200):
            playerdata.wn8.rating = 'Above Average'; playerdata.wn8.color = 8690468; break;
        case (playerdata.wn8.wn8 >= 650 && playerdata.wn8.wn8 < 900):
            playerdata.wn8.rating = 'Average'; playerdata.wn8.color = 13416448; break;
        case (playerdata.wn8.wn8 >= 450 && playerdata.wn8.wn8 < 650):
            playerdata.wn8.rating = 'Below Average'; playerdata.wn8.color = 13400576; break;
        case (playerdata.wn8.wn8 >= 300 && playerdata.wn8.wn8 < 450):
            playerdata.wn8.rating = 'Bad'; playerdata.wn8.color = 13447987; break;
        default:
            playerdata.wn8.rating = 'Very Bad'; playerdata.wn8.color = 9637133; break;
    }

    return playerdata
};

//WG PR Calculation
/**
 * @return {number}
 */
exports.PersonalRating = function(battles,winrate,survivalrate,hitrate,avgdmg){
    let r1 = 2 / (1 + Math.exp(-(battles) / 3000)) - 1;
    let r2 = 3000 / (1 + Math.exp(13 - 25 * winrate));
    let r3 = 1300 / (1 + Math.exp(7 - 22 * survivalrate));
    let r4 = 700 / (1 + Math.exp(14 - 24 * hitrate));
    let r5 = r2 + r3 + r4 + avgdmg;
    return (r1 * r5);
};