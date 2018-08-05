/**
 * A function that converts a integer to a String that contains comma
 * @param {number} x
 * @return {string}
 */
function numberWithCommas(x){
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}


/**
 * A Function that converts ms to a String that indicates lengh ot time
 * @param {number} ms
 * @return {string}
 * @constructor
 */
function convertTime(ms){
    let timeArray = [];
    let temp = Math.floor(ms / 1000);
    let sec = temp % 60;
    temp = Math.floor(temp / 60);
    let min = temp % 60;
    temp = Math.floor(temp / 60);
    let hrs = temp % 24;
    temp = Math.floor(temp / 24);
    let days = temp;

    if(days !== 0){
        if(days === 1){
            timeArray.push("1 Day")
        } else {
            timeArray.push(`${days} Days`)
        }
    }

    if(hrs !== 0){
        if(hrs === 1){
            timeArray.push("1 Hour")
        } else {
            timeArray.push(`${hrs} Hours`)
        }
    }

    if(min !== 0){
        if(min === 1){
            timeArray.push("1 Minute")
        } else {
            timeArray.push(`${min} Minutes`)
        }
    }

    if(sec !== 0){
        if(days === 1){
            timeArray.push("1 Second")
        } else {
            timeArray.push(`${sec} Seconds`)
        }
    }
    return timeArray.join(", ");
}


exports.numberWithCommas = numberWithCommas;
exports.convertTime = convertTime;