/**
 * @typedef {object} region
 * @readonly
 * @enum {region}
 */
const Region = {
    NA:{
        serverName: "North America Server",
        apiDomain: "http://api.wotblitz.com",
        shortServerName: "NA",
        portalPage: "http://wobtlitz.com",
        mainLanguage: "en"
    },
    ASIA:{
        serverName: "South East Asia",
        apiDomain: "http://api.wotblitz.asia",
        shortServerName: "SEA",
        portalPage: "http://wobtlitz.asia",
        mainLanguage: "en"
    },
    EU:{
        serverName: "European Server",
        apiDomain: "http://api.wotblitz.eu",
        shortServerName: "EU",
        portalPage: "http://wobtlitz.eu",
        mainLanguage: "en"
    },
    RU:{
        serverName: "Russian Server",
        apiDomain: "http://api.wotblitz.ru",
        shortServerName: "RU",
        portalPage: "http://wobtlitz.ru",
        mainLanguage: "ru"
    }
};

module.exports = Object.freeze(Region);