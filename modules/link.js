const http = require('http');
const url = require('url');

const webService = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    //Return the url part of the request object:
    const parsed = url.parse(req.url, true);
    const uriArray = parsed.pathname.split('/').filter(x => x !== '');
    if(uriArray.length === 3 && uriArray[0] === "playerreg"){
        console.log("test")
    } else {
        res.write("ERROR 404 NOT FOUND")
    }

    console.log(uriArray);
    console.log(parsed);

    res.end();
});

exports.webService = webService;
//https://api.worldoftanks.asia/wot/auth/login/?application_id=71df07a3f5c764028c167d09eec0cd99&redirect_uri=http://localhost/playerreg/asia/76584929063866368/
