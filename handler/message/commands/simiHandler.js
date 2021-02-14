const axios = require('axios').default;
const {
    color
} = require('../../../utils')

const simiHandler = async (client, message, bodyMsg) => {
    const {
        from,
        id
    } = message
    // set up your own simSimi url, this api link is already broken
    axios.get(`https://secureapp.simsimi.com/v1/simsimi/talkset?uid=301371440&av=6.9.4.0&lc=pt&cc=BR&tz=Asia%2FShanghai&os=a&ak=zUvkY4JFT%2BNKGjQkwtpGu0NKDVs%3D&message_sentence=${encodeURIComponent(bodyMsg)}&normalProb=2&isFilter=1&talkCnt=0&talkCntTotal=0&reqFilter=0&session=7HNEtddtRhT5yW7A3moWy5gxh1hda5jAKif7KcTDdcYtTAspvJkeXVBcxTNBAjkEkCRrQr8tB5rCnBjX6yESWhj2&triggerKeywords=%5B%5D`)
        .then(async (res) => {
            let answ = res.data.simsimi_talk_set.answers[0].origin_answerSentence.trim()
            return await client.reply(from, answ, id)
        })
        .catch(err => {
            console.log(color('[ERROR SIMI]', 'red'), err.message)
        })
}

module.exports = {
    simiHandler
}