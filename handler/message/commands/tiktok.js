const {
    isUrl,
    color
} = require('../../../utils')
const TikTokScraper = require("tiktok-scraper");

const fullLinkRegex = /https:\/\/www\.tiktok\.com\/@.*\/video\/\d{18,}.*/;
const shortLinkRegex = /https??:\/\/(v[m|t]\.)??tiktok\.com\/(\w|\W|\d)+/;

const tikTokCommand = async (client, message, args) => {
    const {
        id,
        from
    } = message
    const url = args.length !== 0 ? args[0] : ''

    if (args.length !== 1) return client.reply(from, 'O formato da mensagem está errado, verifique o correto no menu!', id)
    if (!isUrl(url) && !fullLinkRegex.test(url) & !shortLinkRegex(url)) return client.reply(from, 'Desculpe, o link que você enviou é inválido.', id)
    await client.reply(from, '_Pegando dados..._', id)

    TikTokScraper.getVideoMeta(url, {
            noWaterMark: true,
            hdVideo: true,
        })
        .then((res) => {
            const headers = {
                headers: res.headers
            }
            res = res.collector[0]

            return client.sendFileFromUrl(from, res.videoUrl, 'tiktokVideo.mp4', res.text, id, headers)
        })
        .catch((err) => {
            console.log(color('[ERROR TIKTOK]', 'red'), err.message)
            return client.reply(from, 'Ocorreu algum erro ao tentar baixar o vídeo :(', id)
        })
}

module.exports = {
    tikTokCommand
}