const {
    Client
} = require("@open-wa/wa-automate");
const {
    urlShortener,
    downloader
} = require('../../../lib');
const {
    processTime,
    color,
    isUrl
} = require('../../../utils')
const moment = require('moment-timezone')
moment.tz.setDefault('America/Sao_Paulo').locale('pt-br')

module.exports = twitterCommand = async (client = new Client(), message, args) => {
    const {
        id,
        from,
        t
    } = message
    const url = args.length !== 0 ? args[0] : ''

    if (args.length !== 1) return client.reply(from, 'O formato da mensagem está errado, verifique o correto no menu!', id)
    if (!isUrl(url) || !url.includes('twitter.com') && !url.includes('t.co')) return client.reply(from, 'esse link nem é do twitter retardado', id)
    await client.reply(from, `_Pegando dados..._`, id)
    downloader.tweet(url).then(async (data) => {
            if (data.type === 'video') {
                const content = data.variants.filter(x => x.content_type !== 'application/x-mpegURL').sort((a, b) => b.bitrate - a.bitrate)
                const result = await urlShortener(content[0].url)
                console.log('Shortlink: ' + result)
                console.log(content[0].url)
                await client.sendFileFromUrl(from, content[0].url, 'video.mp4', `Processado por ${processTime(t, moment())} _segundos_`, null, null, true)
                    .then((serialized) => console.log(`Envio de arquivos com sucesso, id: ${serialized} tempo de processamento ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            } else if (data.type === 'photo') {
                for (let i = 0; i < data.variants.length; i++) {
                    await client.sendFileFromUrl(from, data.variants[i], data.variants[i].split('/media/')[1], '', null, null, true)
                        .then((serialized) => console.log(`Envio de arquivos com sucesso, id: ${serialized} tempo de processamento ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                }
            }
        })
        .catch((err) => {
            console.log(color('[ERROR TWITTER]', 'red'), err)
            client.sendText(from, 'Desculpe, o link que você enviou ou é inválido ou não tem nenhuma imagem.')
        })
}