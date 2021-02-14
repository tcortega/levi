const {
    decryptMedia
} = require('@open-wa/wa-automate')
const {
    createWorker
} = require('tesseract.js')
const {
    translate
} = require('../../../lib')

module.exports = traduzirCommand = async (client, message) => {
    const {
        type,
        id,
        from,
        caption,
        isMedia,
        quotedMsg
    } = message
    let {
        body
    } = message
    const prefix = '#'
    body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
    const args = body.trim().split(/ +/).slice(1)
    const uaOverride = process.env.UserAgent
    const isQuotedImage = quotedMsg && quotedMsg.type === 'image'

    if (args.length != 1) return client.reply(from, 'O formato da mensagem está errado, verifique o correto no menu!', id)
    if (isMedia || isQuotedImage) {
        const encryptMedia = isQuotedImage ? quotedMsg : message
        const mediaData = await decryptMedia(encryptMedia, uaOverride)
        const imageBuffer = Buffer.from(mediaData.toString('base64'), 'base64')
        const worker = createWorker()
        await worker.load()
        await worker.loadLanguage('eng')
        await worker.initialize('eng')
        client.reply(from, '_Traduzindo imagem..._')
        const {
            data: {
                text
            }
        } = await worker.recognize(imageBuffer)
        translate(text, 'pt')
            .then((result) => client.sendText(from, result))
            .catch((err) => client.sendText(from, 'Houve um erro, tenta de novo mais tarde :('))

        return
    }
    if (!quotedMsg) return client.reply(from, 'O formato da mensagem está errado, verifique o correto no menu!', id)
    const quoteText = quotedMsg.type == 'chat' ? quotedMsg.body : quotedMsg.type == 'image' ? quotedMsg.caption : ''
    translate(quoteText, args[0])
        .then((result) => client.sendText(from, result))
        .catch((err) => client.sendText(from, 'Erro, código de idioma incorreto ou meu IP foi banido do tradutor do google :('))
}