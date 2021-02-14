const {
    color,
    processTime,
    isUrl
} = require('../../../utils')
const {
    decryptMedia,
    Client
} = require('@open-wa/wa-automate')
const moment = require('moment-timezone')
moment.tz.setDefault('America/Sao_Paulo').locale('pt-br')

module.exports = gifsticker = async (client = new Client(), message, args) => {
    try {
        const {
            id,
            from,
            t,
            mimetype,
            type,
            quotedMsg
        } = message
        const isQuotedVideo = quotedMsg && quotedMsg.type === 'video'
        const isVideo = type == 'video'
        const url = args.length !== 0 ? args[0] : ''
        const uaOverride = process.env.UserAgent

        if ((isVideo || isQuotedVideo) && args.length === 0) {
            const encryptMedia = isQuotedVideo ? quotedMsg : message
            const _mimetype = isQuotedVideo ? quotedMsg.mimetype : mimetype
            const mediaData = await decryptMedia(encryptMedia, uaOverride)
            const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
            client.sendMp4AsSticker(from, imageBase64, null, {
                author: 'meu bot de zap',
                pack: 'twitter.com/tcortega_'
            }).then(() => {
                client.reply(from, 'Aqui está seu sticker!')
                console.log(`Sticker Processed for ${processTime(t, moment())} seconds`)
            })
        } else if (args.length === 1) {
            if (!isUrl(url)) {
                return await client.reply(from, 'O link que você enviou não é válido.', id)
            }
            client.sendStickerfromUrl(from, url).then((r) => (!r && r !== undefined) ?
                client.sendText(from, 'Você enviou um link sem imagem!!') :
                client.reply(from, 'Aqui está seu sticker')).then(() => console.log(`Sticker Processed for ${processTime(t, moment())} seconds`))
        } else {
            return await client.reply(from, 'Não encontrei imagens! Para abrir a lista de comandos, use *#menu*', id)
        }
        return
    } catch (err) {
        return console.log(color('[ERROR GIFSTICKER]', 'red'), err)
    }
}