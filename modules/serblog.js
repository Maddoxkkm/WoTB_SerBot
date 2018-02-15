const SerBotTokens = require('../SerBot.json');

const Discord = require("discord.js");

//WebHook to MadWoTBMods Logging
const webhookurl = SerBotTokens.Webhook.split('/');
const SerbHook = new Discord.WebhookClient(webhookurl[5],webhookurl[6]);
function SerbLog(logmsg){
    if (logmsg.length < 2000){
        SerbHook.send('`SerBot` | `' + logmsg + '`')
            .then(console.log(logmsg))
            .catch(err => console.log(`SerBLog Failed. ${err} Console log:`, logmsg));
        //console.log(logmsg)
    } else {
        SerbHook.send('txt file (due to oversized webhook)', {
            file: {
                attachment: Buffer.from(logmsg, 'utf8'),
                name: 'WebHook.txt'
            }
        })
            .then(console.log(logmsg))
            .catch(err => console.log(`SerBLog Failed. ${err} Console log:`, logmsg));
    }
}

module.exports = SerbLog;