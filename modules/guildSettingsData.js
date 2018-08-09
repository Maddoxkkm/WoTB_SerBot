const Enmap = require('enmap');
const EnmapSQLite = require('enmap-sqlite');
// Oh look a shortcut to initializing ;)
const myColl = new Enmap({ provider: new EnmapSQLite({ name: 'GuildSettings' }) });

class GuildSettings{
    constructor(guildID){
        this.guildID = guildID;
        this.guildSettings = myColl.get(this.guildID)
    }


    update(){
        myColl.set(this.guildID, this.guildSettings);
    }


}



/*
Structure of the key
(key (guildID) , Obj: {
        replayChannelsArray = [channelID],

    }
}
 */