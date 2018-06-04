const Enmap = require('enmap');
const EnmapSQLite = require('enmap-sqlite');
// Oh look a shortcut to initializing ;)
const myColl = new Enmap({ provider: new EnmapSQLite({ name: 'GuildSettings' }) });

exports = myColl;


/*
Structure of the key
(key (guildID) , Obj: {
        replayChannelsArray = [channelID],

    }
}
 */