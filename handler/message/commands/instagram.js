const {
    Client
} = require("@open-wa/wa-automate");
const {
    downloader
} = require('../../../lib');
const {
    color,
    processTime,
    isUrl
} = require('../../../utils')
const moment = require('moment-timezone')
moment.tz.setDefault('America/Sao_Paulo').locale('pt-br')

module.exports = instaCommand = async (client = new Client(), message, args) => {
    const {
        id,
        from,
        t
    } = message
    const url = args.length !== 0 ? args[0] : ''

    if (args.length !== 1) return client.reply(from, 'O formato da mensagem está errado, verifique o correto no menu!', id)
    if (!isUrl(url) || !url.includes('instagram.com')) return client.reply(from, 'esse link nem é do instagram retardado', id)
    await client.reply(from, `_Pegando dados..._`, id)
    if (url.includes('/stories/')) {
        downloader.storiesIg(url).then(async (data) => {
                return client.sendFileFromUrl(from, data.stories.url, data.filename, '', id)
            })
            .catch((err) => client.reply(from, err.message, id))
    } else {
        downloader.insta(url).then(async (data) => {
                if (data.type == 'GraphSidecar') {
                    if (data.image.length != 0) {
                        data.image.map((x) => client.sendFileFromUrl(from, x, 'photo.jpg', '', null, null, true))
                            .then((serialized) => console.log(`Envio de arquivos com sucesso, id: ${serialized} tempo de processamento ${processTime(t, moment())}`))
                            .catch((err) => console.log(color('[ERROR INSTA]', 'red'), err))
                    }
                    if (data.video.length != 0) {
                        data.video.map((x) => client.sendFileFromUrl(from, x.videoUrl, 'video.jpg', '', null, null, true))
                            .then((serialized) => console.log(`Envio de arquivos com sucesso, id: ${serialized} tempo de processamento ${processTime(t, moment())}`))
                            .catch((err) => console.log(color('[ERROR INSTA]', 'red'), err))
                    }
                } else if (data.type == 'GraphImage') {
                    client.sendFileFromUrl(from, data.image, 'photo.jpg', '', null, null, true)
                        .then((serialized) => console.log(`Envio de arquivos com sucesso, id: ${serialized} tempo de processamento ${processTime(t, moment())}`))
                        .catch((err) => console.log(color('[ERROR INSTA]', 'red'), err))
                } else if (data.type == 'GraphVideo') {
                    client.sendFileFromUrl(from, data.video.videoUrl, 'video.mp4', '', null, null, true)
                        .then((serialized) => console.log(`Envio de arquivos com sucesso, id: ${serialized} tempo de processamento ${processTime(t, moment())}`))
                        .catch((err) => console.log(color('[ERROR INSTA]', 'red'), err))
                }
            })
            .catch((err) => {
                if (err === 'Not a video') {
                    return client.reply(from, 'Erro, não tem nenhum vídeo no link enviado.', id)
                }
                client.reply(from, 'Erro, usuário privado ou link inválido!', id)
            })
    }
}