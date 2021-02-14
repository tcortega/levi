const tts = require('@google-cloud/text-to-speech')
const clientTTS = new tts.TextToSpeechClient();
const {
    color
} = require('../../../utils')
let ttsQueue = []

const ttsCommand = async (client, message, args) => {
    const {
        id,
        from
    } = message

    if (ttsQueue.includes(id))
        return await client.reply(from, 'o áudio ainda ta sendo processado porra eu não faço milagre não', id)

    try {
        if (args.length <= 0) return client.reply(from, 'Você precisa específicar o que quer no áudio.\n\nExemplo: *#tts Olá mundo*', id)
        const msg = args.join(' ')
        if (msg.length > 5000) return client.reply(from, 'O texto excede o limite de 5000 letras.', id)

        ttsQueue.push(id)
        const request = {
            input: {
                text: msg
            },
            voice: {
                languageCode: 'pt-BR',
                ssmlGender: 'NEUTRAL'
            },
            audioConfig: {
                audioEncoding: 'MP3'
            },
        };

        // Performs the text-to-speech request
        const [response] = await clientTTS.synthesizeSpeech(request);

        ttsQueue.splice(ttsQueue.indexOf(id), 1)
        return await client.sendPtt(from, `data:audio/mp3;base64,${response.audioContent.toString('base64')}`)
    } catch (err) {
        return console.log(color('[ERROR TTS]', 'red'), err)
    }
}

const tts2Command = async (client, message, args) => {
    const {
        id,
        from
    } = message

    if (ttsQueue.includes(id))
        return await client.reply(from, 'o áudio ainda ta sendo processado porra eu não faço milagre não', id)

    try {
        if (args.length <= 1) return client.reply(from, 'Você precisa específicar o que quer no áudio e o idioma.\n\nExemplo: *#tts2 <idioma> Hello World*\nConsulte os idiomas aqui: https://cloud.google.com/text-to-speech/docs/voices', id)
        const idioma = args.shift()
        const msg = args.join(' ')
        if (msg.length > 5000) return client.reply(from, 'O texto excede o limite de 5000 letras.', id)

        ttsQueue.push(id)
        const request = {
            input: {
                text: msg
            },
            voice: {
                languageCode: idioma,
                ssmlGender: 'NEUTRAL'
            },
            audioConfig: {
                audioEncoding: 'MP3'
            },
        };

        // Performs the text-to-speech request
        const [response] = await clientTTS.synthesizeSpeech(request);

        ttsQueue.splice(ttsQueue.indexOf(id), 1)
        return await client.sendPtt(from, `data:audio/mp3;base64,${response.audioContent.toString('base64')}`)
    } catch (err) {
        if (err.message == '3 INVALID_ARGUMENT: Request contains an invalid argument.') {
            return client.reply(from, 'Código de idioma incorreto, verifique os códigos disponiveis aqui: https://cloud.google.com/text-to-speech/docs/voices', id)
        } else {
            return console.log(color('[ERROR TTS2]', 'red'), err)
        }
    }
}

module.exports = {
    ttsCommand,
    tts2Command
}