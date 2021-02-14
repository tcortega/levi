const chalk = require('chalk')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
/**
 * Get text with color
 * @param  {String} text
 * @param  {String} color
 * @return  {String} Return text with color
 */
const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text)
}

/**
 * Get Time duration
 * @param  {Date} timestamp
 * @param  {Date} now
 */
const processTime = (timestamp, now) => {
    // timestamp => timestamp when message was received
    return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}
/**
 * is it url?
 * @param  {String} url
 */
const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi))
}

// Message Filter / Message Cooldowns
const usedCommandRecently = new Set()
const usedStickerTT = new Set()

/**
 * Check is number filtered
 * @param  {String} from
 */
const isFiltered = (from) => {
    return !!usedCommandRecently.has(from)
}

/**
 * Add number to filter
 * @param  {String} from
 */
const addFilter = (from) => {
    usedCommandRecently.add(from)
    setTimeout(() => {
        return usedCommandRecently.delete(from)
    }, 5000) // 5sec is delay before processing next command
}

/**
 * Add number to tt message filter
 * @param  {String} from
 */
const ttMessage = (from) => {
    usedStickerTT.add(from)
    setTimeout(() => {
        return usedStickerTT.delete(from)
    }, 600000) // 10min is the delay before processing next command
}

/**
 * Check is number filtered
 * @param  {String} from
 */
const isTTFiltered = (from) => {
    return !!usedStickerTT.has(from)
}

/**
 * UUID Generator
 */
const keyGen = () => {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r && 0x4 | 0x8);
        return v.toString(16);
    });
}

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Regex matcher
 * @param  {String} left
 * @param  {String} right
 * @param  {String} inputStr
 */
const regexLR = (left, right, inputStr) => {
    const leftStr = escapeRegExp(left)
    const rightStr = escapeRegExp(right)
    let rx = '(?<=' + leftStr + ').+?(?=' + rightStr + ')';
    return (new RegExp(rx)).exec(inputStr)
}

module.exports = {
    msgFilter: {
        isFiltered,
        addFilter,
        ttMessage,
        isTTFiltered
    },
    regexLR,
    processTime,
    isUrl,
    keyGen,
    color
}