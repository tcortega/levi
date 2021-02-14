const {
    color
} = require('../../../utils')
const axios = require('axios').default
const fs = require('fs')
const apiKeys = JSON.parse(fs.readFileSync('./settings/apiKeys.json'))

const pinterestCommand = async (client, message, args) => {
    const {
        id,
        from
    } = message

    if (args.length <= 0) return client.reply(from, 'Você precisa específicar o que quer buscar.\n\nExemplo: *#pinterest anime*', id)
    axios.get(`https://api.vhtear.com/pinterest?query=${encodeURIComponent(args.join(' '))}&apikey=${apiKeys.vhtear}`)
        .then(async (res) => {
            res = res.data
            const arr = res.result
            const rndResult = arr[Math.floor(Math.random() * arr.length)];
            return await client.sendFileFromUrl(from, rndResult, rndResult.slice(rndResult.lastIndexOf('/') + 1), '*Resultado da pesquisa no Pinterest*', id)
        })
        .catch((err) => {
            console.log(color('[ERROR PINTEREST]', 'red'), err.message)
            client.reply(from, 'Houve um erro na sua solicitação :(', id)
        })
}

module.exports = {
    pinterestCommand
}