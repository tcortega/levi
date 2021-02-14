const {
    downloader
} = require('../../../lib');
const {
    isUrl,
    color
} = require('../../../utils')

const tikTokCommand = async (client, message, args) => {
    const {
        id,
        from
    } = message
    const url = args.length !== 0 ? args[0] : ''

    if (args.length !== 1) return client.reply(from, 'O formato da mensagem está errado, verifique o correto no menu!', id)
    if (!isUrl(url) && !url.includes('tiktok.com')) return client.reply(from, 'Desculpe, o link que você enviou é inválido.', id)
    await client.reply(from, '_Pegando dados..._', id)

    downloader.tiktok(url)
        .then(async (res) => {
            return await client.sendFileFromUrl(from, res, 'videoTikTok.mp4', '', id)
        })
        .catch(err => {
            console.log(color('[ERROR TIKTOK]', 'red'), err.message)
            if (err.message.includes('TIMEDOUT')) return client.reply(from, 'Tente denovo, o servidor tá meio lento', id)
        })
}

module.exports = {
    tikTokCommand
}