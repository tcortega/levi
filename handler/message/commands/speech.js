const fs = require('fs');
const speech = require('@google-cloud/speech');
const clientSP = new speech.SpeechClient();
const ffmpeg = require('fluent-ffmpeg')
const {
    color
} = require('../../../utils')
const {
    decryptMedia
} = require('@open-wa/wa-automate')
let speechQueue = []

const speechCommand = async (client, message) => {
    const {
        id,
        from,
        quotedMsg,
        quotedMsgObj
    } = message

    if (!quotedMsg) return client.reply(from, 'ô seu imbecil, como eu vou ouvir se nao tem audio?', id)
    const {
        type
    } = quotedMsgObj
    const isQuotedAudio = type == 'audio' || type == 'ptt'
    if (!isQuotedAudio) return client.reply(from, 'ô seu imbecil, como eu vou ouvir se nao tem audio?', id)

    if (speechQueue.includes(quotedMsgObj.id))
        return await client.reply(from, 'o áudio ainda ta sendo processado porra eu não faço milagre não', id)

    speechQueue.push(quotedMsgObj.id)

    const uaOverride = process.env.UserAgent
    const _mimetype = quotedMsg.mimetype
    const mediaData = await decryptMedia(quotedMsg, uaOverride)
    const fileName = id.split('_')[2]
    const filePath1 = `./././temp-folder/${fileName}.mp3`
    const filePath2 = `./././temp-folder/${fileName}2.flac`

    fs.writeFileSync(filePath1, mediaData)

    await ffmpeg(filePath1)
        .input(filePath1)
        .on('error', (err) => {
            console.log(color('[ERROR STT]', 'red'), err)
            fs.unlinkSync(filePath1)
            client.reply(from, 'ô seu imbecil, como eu vou ouvir se nao tem audio?', id)
        })
        .on('end', async () => {
            const audio = {
                content: fs.readFileSync(filePath2, {
                    encoding: 'base64'
                })
            };
            const config = {
                encoding: 'FLAC',
                languageCode: 'pt-BR',
            };
            const request = {
                audio: audio,
                config: config,
            };

            let transcription = ''
            // Detects speech in the audio file
            try {
                const [response] = await clientSP.recognize(request);
                transcription = response.results
                    .map(result => result.alternatives[0].transcript)
                    .join('\n');
            } catch (err) {
                console.log(err.message)
            }
            fs.unlinkSync(filePath1)
            fs.unlinkSync(filePath2)
            speechQueue.splice(speechQueue.indexOf(quotedMsgObj.id), 1)

            if (transcription.length <= 1) return await client.reply(from, 'dicção de macaco entendi merda nenhuma', id)
            return await client.reply(from, transcription, id)
        })
        .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
        .toFormat('flac')
        .save(filePath2)
}

module.exports = {
    speechCommand
}