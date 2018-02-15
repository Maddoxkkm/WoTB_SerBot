const request = require('request');

//require WebHook for logging
const SerbLog = require('./serblog');

//require SerBot Details
const SerBotDetails = require('./serbot_details');

//request (copied from https://stackoverflow.com/questions/38428027/why-await-is-not-working-for-node-request-module)
function Request(url){
    return new Promise(function (resolve, reject) {
        request(url, function (error, res, body) {
            //console.log('error:', error);
            //console.log('statusCode:', response && response.statusCode);
            //console.log('body:', body);
            if (!error && res.statusCode === 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

function apiValidation(data){
    return new Promise(function(resolve, reject){
        if(data.status === 'ok'){
            resolve(true)
        } else {
            let response = {
                response: data,
                error: SerBotDetails.ErrorArray.WG_api_Error
            };
            reject(response)
        }
    })
}

async function WGApiCall(url){
    return new Promise(async function(resolve, reject){
        const apiTries = 3; //at most request x times
        let response;
        for (let x = 0; x < apiTries; x++){
            response = JSON.parse(await Request(url));
            try{
                await apiValidation(response);
                resolve(response)
            }
            catch(error){
                if(x === apiTries - 1){
                    reject(error)
                } else {
                    SerbLog(`Retrying WG API call due to API returned Error Array`)
                }
            }
        }
        reject(response)
    })
}

exports.Request = Request;
exports.WGApiCall = WGApiCall;