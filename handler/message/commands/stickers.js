const {
    msgFilter,
    color,
    processTime
} = require('../../../utils')
const {
    decryptMedia,
    Client
} = require('@open-wa/wa-automate')
const {
    menu
} = require('../text'); // Portuguese menu
const moment = require('moment-timezone')
moment.tz.setDefault('America/Sao_Paulo').locale('pt-br')

const stickerHandler = async (client = new Client(), message, args) => {
    try {
        const {
            id,
            from,
            t,
            isMedia,
            mimetype,
            quotedMsg,
            type
        } = message
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'
        const uaOverride = process.env.UserAgent
        const isQuotedVideo = quotedMsg && quotedMsg.type === 'video'
        const isVideo = type == 'video'

        if ((isVideo || isQuotedVideo)) {
            const encryptMedia = isQuotedVideo ? quotedMsg : message
            const _mimetype = isQuotedVideo ? quotedMsg.mimetype : mimetype
            const mediaData = await decryptMedia(encryptMedia, uaOverride)

            // old sticker code, api already handles this in case you're premium
            // const ext = _mimetype.split('/')[1]
            // const fileName = id.split('_')[2]
            // const filePath1 = `./././temp-folder/${fileName}.${ext}`
            // const filePath2 = `./././temp-folder/${fileName}2.webp`

            // fs.writeFileSync(filePath1, mediaData)

            // await ffmpeg(filePath1)
            //     .input(filePath1)
            //     .on('error', (err) => {
            //         console.log(color('[ERROR GIFSTICKER]', 'red'), err)
            //         fs.unlinkSync(filePath1)
            //         client.reply(from, 'Erro ao tentar transformar em sticker', id)
            //     })
            //     .on('end', () => {
            //         console.log(`Sticker Processed for ${processTime(t, moment())} seconds`)
            //         client.sendRawWebpAsSticker(from, fs.readFileSync(filePath2, {
            //             encoding: 'base64'
            //         }), true)
            //         fs.unlinkSync(filePath1)
            //         fs.unlinkSync(filePath2)
            //     })
            //     .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
            //     .toFormat('webp')
            //     .save(filePath2)
            const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
            await client.sendMp4AsSticker(from, imageBase64, {
                crop: false
            }, {
                author: 'meu bot de zap',
                pack: 'bit.ly/3tPqZ4H'
            })
        } else if ((isMedia || isQuotedImage)) {
            const encryptMedia = isQuotedImage ? quotedMsg : message
            const _mimetype = isQuotedImage ? quotedMsg.mimetype : mimetype
            const mediaData = await decryptMedia(encryptMedia, uaOverride)
            let nobg = false
            if (args.length > 1) {
                if (args[0].includes('bg')) {
                    nobg = true
                }
            }

            // old sticker code, api already handles this in case you're premium
            // let mediaData = await decryptMedia(encryptMedia, uaOverride)
            // mediaData = await sharp(mediaData)
            //     .resize(512, 512, {
            //         fit: 'contain',
            //         background: {
            //             r: 255,
            //             g: 255,
            //             b: 255,
            //             alpha: 0.0
            //         }
            //     })
            //     .toFormat('png')
            //     .png({
            //         quality: 100
            //     })
            //     .toBuffer()

            const imageBase64 = `data:${_mimetype};base64,${mediaData.toString('base64')}`
            client.sendImageAsSticker(from, imageBase64, {
                    author: 'meu bot de zap',
                    pack: 'bit.ly/3tPqZ4H',
                    keepScale: true,
                    removebg: nobg
                })
                .then(() => {
                    client.reply(from, 'Aqui está seu sticker!')
                    console.log(`Sticker Processed for ${processTime(t, moment())} seconds`)
                })
        } else {
            await client.reply(from, 'Não encontrei imagens! Para abrir a lista de comandos, use *#menu*', id)
        }

        if (msgFilter.isTTFiltered(from))
            return

        client.reply(from, menu.textSite(), id)

        return msgFilter.ttMessage(from)
    } catch (err) {
        return console.log(color('[ERROR STICKER]', 'red'), err)
    }
}

module.exports = {
    stickerHandler
}