const axios = require('axios').default;
const fs = require('fs')
const apiKeys = JSON.parse(fs.readFileSync('./settings/apiKeys.json'))
const igInfo = JSON.parse(fs.readFileSync('./settings/igInfo.json'))

const {
    fetchJson
} = require('../utils/fetcher')
const {
    promisify
} = require('util')
const {
    instagram,
    twitter
} = require('video-url-link')
const {
    color
} = require('../utils')

const ytdl = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg')


const igGetInfo = promisify(instagram.getInfo)
const twtGetInfo = promisify(twitter.getInfo)

/**
 * Get Instagram Metadata
 *
 * @param  {String} url
 */
const insta = (url) => new Promise((resolve, reject) => {
    console.log('Get metadata from =>', url)
    const uri = url.replace(/\?.*$/g, '')
    igGetInfo(uri, {})
        .then((result) => resolve(result))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})

const getUserId = async (user) => {
    let url = 'https://www.instagram.com/web/search/topsearch/?query=' + user
    return axios.get(url).then(res => res.data.users[0].user.pk)
}

const fetch_ig_stories = async (query) => {
    var header = {
        'Cookie': igInfo.cookies,
        'X-IG-App-ID': igInfo.appid
    };
    var opt2 = {
        "headers": header
    };

    return axios.get(query, opt2).then(res => res.data.reels_media[0].items).catch(err => 'erro')
}

/**
 * Get Instagram Stories Metadata
 *
 * @param  {String} url
 */
const storiesIg = (url) => new Promise(async (resolve, reject) => {
    console.log('Get metadata from =>', url)
    const uri = url.replace(/\?.*$/g, '')
    let userId = uri.split('/stories/')[1].split('/')[0]
    let storiesId = uri.split('/stories/')[1].split('/')[1]

    userId = await getUserId(userId)
    let query = 'https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=' + userId
    let stories = await fetch_ig_stories(query)
    if (stories != 'erro' && stories != null) {
        let targetStories = stories.filter(obj => obj.id == storiesId + '_' + userId)

        let videoArray = new Object()
        if (targetStories[0].hasOwnProperty('video_versions')) {
            videoArray.stories = targetStories[0].video_versions.sort((a, b) => b.height - a.height)[0]
            videoArray.filename = 'video.mp4'
        } else if (targetStories[0].hasOwnProperty('image_versions2')) {
            videoArray.stories = targetStories[0].image_versions2.candidates.sort((a, b) => b.height - a.height)[0]
            videoArray.filename = 'imagem.jpg'
        } else
            return reject('Erro! Perfil privado ou stories não disponível.')

        return resolve(videoArray)
    } else {
        return reject('Erro! Perfil privado ou stories não disponível.')
    }
})

/**
 * Get Twitter Metadata
 *
 * @param  {String} url
 */
const tweet = (url) => new Promise((resolve, reject) => {
    console.log('Get metadata from =>', url)
    twtGetInfo(url, {})
        .then((content) => resolve(content))
        .catch((err) => {
            console.error(err)
            reject(err)
        })
})

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * Get Youtube Metadata
 *
 * @param  {String} url
 */
const youtubeMp4 = (url) => new Promise((resolve, reject) => {
    console.log('Get metadata from =>', url)
    ytdl.getInfo(url)
        .then((info) => {
            if (Math.round(info.videoDetails.lengthSeconds / 60) > 10)
                throw 'Vídeo excede tempo limite.'

            const videoUrl = ytdl.chooseFormat(info.formats, {
                quality: 'highestvideo',
                filter: 'audioandvideo'
            })

            if (videoUrl.isLive)
                throw 'Live'

            obj = new Object()
            obj.url = videoUrl.url
            obj.title = info.videoDetails.title
            resolve(obj)
        })
        .catch((err) => {
            if (err == 'Vídeo excede tempo limite.') {
                console.log(color('[PREVENT YT]', 'red'), 'Vídeo excede tempo limite.')
                return reject('Vídeo excede tempo limite de 10 minutos!! 😡')

            } else if (err.message == 'Cannot read property \'length_seconds\' of undefined') {
                console.log(color('[ERROR]', 'red'), 'Erro no length_seconds')
                return reject('Não consegui encontrar informações do vídeo :(\nO vídeo é muito grande?')

            } else if (err.message == 'Live') {
                console.log(color('[PREVENT YT]', 'red'), 'Você não pode baixar uma live.')
                return reject('Você não pode baixar uma live.')
            }
        })
})

/**
 * Get Youtube Metadata
 *
 * @param  {String} url
 */
const youtube = (url) => new Promise((resolve, reject) => {
    console.log('Get metadata from =>', url)
    let stream = ytdl(url, {
        quality: 'highestaudio',
    })

    let filename = makeid(7)
    let dataObject = new Object()

    dataObject.filename = filename

    ytdl.getInfo(url)
        .then((data) => {
            if (Math.round(data.videoDetails.lengthSeconds / 60) > 15)
                throw 'Vídeo excede tempo limite.'

            dataObject.title = data.videoDetails.title

            ffmpeg(stream)
                .audioBitrate(192)
                .save(`./temp-folder/${filename}.mp3`)
                .on('end', () => {
                    resolve(dataObject)
                })
        })
        .catch((err) => {
            if (err == 'Vídeo excede tempo limite.') {
                console.log(color('[ERROR]', 'red'), 'Vídeo excede tempo limite.')
                return reject('Vídeo excede tempo limite de 15 minutos!! 😡')

            } else if (err.message == 'Cannot read property \'length_seconds\' of undefined') {
                console.log(color('[ERROR]', 'red'), 'Erro no length_seconds')
                return reject('Não consegui encontrar informações do vídeo :(\nO vídeo é muito grande?')

            } else {
                ffmpeg(stream)
                    .audioBitrate(192)
                    .save(`./temp-folder/${filename}.mp3`)
                    .on('end', () => {
                        resolve(dataObject)
                    })
            }
        })

})

/**
 * Get Youtube Metadata
 *
 * @param  {String} url
 */
const youtubeVideo = (url) => new Promise((resolve, reject) => {
    console.log('Get metadata from =>', url)
    let stream = ytdl(url, {
        filter: 'audioandvideo'
    })

    let filename = makeid(7)
    let dataObject = new Object()

    dataObject.filename = filename

    ytdl.getInfo(url)
        .then((data) => {
            if (Math.round(data.videoDetails.lengthSeconds / 60) > 15)
                throw 'Vídeo excede tempo limite.'

            dataObject.title = data.videoDetails.title

            ffmpeg(stream)
                .audioBitrate(192)
                .save(`./temp-folder/${filename}.mp4`)
                .on('end', () => {
                    resolve(dataObject)
                })
        })
        .catch((err) => {
            if (err == 'Vídeo excede tempo limite.') {
                console.log(color('[ERROR]', 'red'), 'Vídeo excede tempo limite.')
                return reject('Vídeo excede tempo limite de 15 minutos!! 😡')

            } else if (err.message == 'Cannot read property \'length_seconds\' of undefined') {
                console.log(color('[ERROR]', 'red'), 'Erro no length_seconds')
                return reject('Não consegui encontrar informações do vídeo :(\nO vídeo é muito grande?')

            } else {
                ffmpeg(stream)
                    .audioBitrate(192)
                    .save(`./temp-folder/${filename}.mp4`)
                    .on('end', () => {
                        resolve(dataObject)
                    })
            }
        })

})

module.exports = {
    tiktok,
    insta,
    tweet,
    storiesIg,
    youtube,
    youtubeVideo,
    youtubeMp4,
    makeid
}