const Enmap = require('enmap');
const EnmapSQLite = require('enmap-sqlite');
// Oh look a shortcut to initializing ;)
const guildSettings = new Enmap({ provider: new EnmapSQLite({ name: 'GuildSettings' }) });


module.exports = guildSettings;
/*
Structure of the key
(key (guildID) , Obj: {
        replayChannelsArray = [channelID],

    }
}
 */