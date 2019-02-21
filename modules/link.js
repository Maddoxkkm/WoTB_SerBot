const http = require('http');
const url = require('url');
const util = require('./util.js');

const webService = function (req, res) {
    //Return the url part of the request object:
    const parsed = url.parse(req.url, true);
    const uriArray = parsed.pathname.split('/').filter(x => x !== '');
    if(uriArray.length === 3 && uriArray[0] === "playerreg"){
        // known this is for playerreg, we can continue to check the region,
        const region = util.areaDetermination(uriArray[1]);
        //got the region, next is to grab the Discord ID, and record everything about it
        const discordID = uriArray[2];

        console.log("test")
    } else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.write("ERROR 404 NOT FOUND");
    }

    console.log(uriArray);
    console.log(parsed);

    res.end();
};

exports.webService = webService;
//https://api.worldoftanks.asia/wot/auth/login/?application_id=71df07a3f5c764028c167d09eec0cd99&redirect_uri=http://localhost/playerreg/asia/76584929063866368/
