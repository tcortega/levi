const {
    downloader
} = require('../../../lib')
const {
    color,
    isUrl
} = require('../../../utils')
const fs = require('fs')
const YouTube = require("discord-youtube-api")
const axios = require('axios').default;
const apiKeys = JSON.parse(fs.readFileSync('./././settings/apiKeys.json'))

const youtube = new YouTube(apiKeys.ytb)

const ytbMp3Command = async (client, message) => {
    const {
        type,
        id,
        caption,
        from
    } = message
    let {
        body
    } = message

    const prefix = '#'
    body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
    const arg = body.trim().substring(body.indexOf(' ') + 1)
    const args = body.trim().split(/ +/).slice(1)
    let url = args.length !== 0 ? args[0] : ''

    if (!isUrl(url) || !url.toString().match('^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$')) {
        try {
            url = await youtube.searchVideos(arg)
            url = url.id
        } catch (err) {
            if (err) {
                console.log(color('[ERROR YTBMP3]', 'red'), err)
                return client.reply(from, 'Não encontrei o vídeo informado :(', id)
            }
        }
    }

    // Treating shorts links
    if (url.includes('shorts/'))
        url = url.replace('shorts/', 'watch?v=')

    await client.reply(from, `_Pegando dados..._`, id)
    downloader.youtube(url).then((audioMP3) => {
        client.sendFile(from, `./././temp-folder/${audioMP3.filename}.mp3`, `${audioMP3.filename}.mp3`, '', id).then(() => {
            client.getMyLastMessage(from).then(lastMsg => client.reply(from, audioMP3.title, lastMsg.id))
            fs.unlink(`./././temp-folder/${audioMP3.filename}.mp3`, (err) => {
                if (err)
                    console.log(color('[ERROR YTBMP3]', 'red'), err)
            })
        })
    }).catch((err) => {
        console.log(color('[ERROR YTBMP3]', 'red'), err)
        client.reply(from, err, id)
    })
}

const ytbMp4Command = async (client, message, args) => {
    const {
        id,
        from
    } = message

    let url = args.length !== 0 ? args[0] : ''

    if (!isUrl(url) || !url.toString().match('^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$')) {
        try {
            url = await youtube.searchVideos(args.join(' '))
            url = url.id
        } catch (err) {
            if (err) {
                console.log(color('[ERROR YTBV]', 'red'), err)
                return client.reply(from, 'Não encontrei o vídeo informado :(', id)
            }
        }
    }

    // Treating shorts links
    if (url.includes('shorts/'))
        url = url.replace('shorts/', 'watch?v=')

    await client.reply(from, `_Pegando dados..._`, id)
    downloader.youtubeMp4(url)
        .then(async (res) => {
            return await client.sendFileFromUrl(from, res.url, 'videoyt.mp4', res.title, id)
        })
        .catch((err) => {
            console.log(color('[ERROR YTBV]', 'red'), err)
            client.reply(from, 'Houve um erro na sua solicitação :(', id)
        })
}

module.exports = {
    ytbMp3Command,
    ytbMp4Command
}