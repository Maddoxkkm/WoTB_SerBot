/**
 * @readonly
 * @enum {Region}
 */
const region = {
    NA:{
        serverName: "North America Server",
        apiDomain: "http://api.wotblitz.com",
        shortServerName: "NA",
        portalPage: "http://wotblitz.com",
        mainLanguage: "en"
    },
    ASIA:{
        serverName: "South East Asia",
        apiDomain: "http://api.wotblitz.asia",
        shortServerName: "SEA",
        portalPage: "http://wotblitz.asia",
        mainLanguage: "en"
    },
    EU:{
        serverName: "European Server",
        apiDomain: "http://api.wotblitz.eu",
        shortServerName: "EU",
        portalPage: "http://wotblitz.eu",
        mainLanguage: "en"
    },
    RU:{
        serverName: "Russian Server",
        apiDomain: "http://api.wotblitz.ru",
        shortServerName: "RU",
        portalPage: "http://wotblitz.ru",
        mainLanguage: "ru"
    }
};

//prevents modification to object
module.exports = Object.freeze(region);