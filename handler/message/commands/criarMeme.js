const {
    meme
} = require('../../../lib')
const {
    uploadImages
} = require('../../../utils/fetcher')
const {
    decryptMedia
} = require('@open-wa/wa-automate')
const {
    color,
    processTime
} = require('../../../utils')
const moment = require('moment-timezone')
moment.tz.setDefault('America/Sao_Paulo').locale('pt-br')

module.exports = criarMemeCommand = async (client, message) => {
    const {
        type,
        id,
        from,
        t,
        caption,
        isMedia,
        quotedMsg
    } = message
    let {
        body
    } = message

    const prefix = '#'
    body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
    const arg = body.trim().substring(body.indexOf(' ') + 1)
    const args = body.trim().split(/ +/).slice(1)
    const uaOverride = process.env.UserAgent
    const isQuotedImage = quotedMsg && quotedMsg.type === 'image'


    if ((isMedia || isQuotedImage) && args.length >= 1) {
        let top
        let bottom

        if (arg.indexOf('|') == -1) {
            top = arg.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\u1F600-\u1F6FF\s]/g, '')
            bottom = ''
        } else {
            top = arg.split('|')[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\u1F600-\u1F6FF\s]/g, '')
            bottom = arg.split('|')[1].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\u1F600-\u1F6FF\s]/g, '')
            if (bottom.startsWith(' '))
                bottom = bottom.substring(1)
        }

        const encryptMedia = isQuotedImage ? quotedMsg : message
        const mediaData = await decryptMedia(encryptMedia, uaOverride)
        const getUrl = await uploadImages(mediaData, false)
        const ImageBase64 = await meme.custom(getUrl, top, bottom)
        client.sendFile(from, ImageBase64, 'image.png', '', null, true)
            .then((serialized) => console.log(`Envio de arquivos com sucesso, id: ${serialized} tempo de processamento ${processTime(t, moment())}`))
            .catch((err) => console.error(color('[ERROR TXTMEME]', 'red'), err))
    } else {
        await client.reply(from, 'Sem imagem! Para ver como usar, use o comando *#menu*!', id)
    }
}