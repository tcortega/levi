const axios = require('axios').default;
const cheerio = require('cheerio');
const {
    Client
} = require('@open-wa/wa-automate');
const {
    isUrl,
    color
} = require('../../../utils')
const moment = require('moment-timezone')
moment.tz.setDefault('America/Sao_Paulo').locale('pt-br')

module.exports = facebookCommand = async (client = new Client(), message, args) => {
    const {
        id,
        from
    } = message
    const url = args.length !== 0 ? args[0] : ''

    if (args.length !== 1) return client.reply(from, 'O formato da mensagem está errado, verifique o correto no menu!', id)
    if (!isUrl(url) && (!url.includes('facebook.com') && !url.includes('fb.watch'))) return client.reply(from, 'Desculpe, o link que você enviou é inválido.', id)
    await client.reply(from, '_Pegando dados..._', id)

    axios.post('https://www.getfvid.com/pt/downloader', `url=${url}`)
        .then(async (res) => {
            const $ = cheerio.load(res.data)
            const videoUrl = $('.btns-download p a').attr('href')

            if (isUrl(videoUrl))
                return await client.sendFileFromUrl(from, videoUrl, 'videoFb.mp4', '', id)

            return await client.reply(from, 'O vídeo aparenta ser privado, não vou conseguir baixar :(', id)
        })
        .catch(err => {
            console.log(color('[ERROR FB]', 'red'), err)
        })
}