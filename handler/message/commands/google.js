const {
    color
} = require('../../../utils')
const axios = require('axios').default
const fs = require('fs')
const apiKeys = JSON.parse(fs.readFileSync('./settings/apiKeys.json'))

const googleCommand = async (client, message, args) => {
    const {
        id,
        from
    } = message

    if (args.length <= 0) return client.reply(from, 'Você precisa específicar o que quer buscar.\n\nExemplo: *#google site de filme gratis*', id)
    axios.get(`https://api.vhtear.com/googlesearch?query=${encodeURIComponent(args.join(' '))}&apikey=${apiKeys.vhtear}`)
        .then(async (res) => {
            res = res.data
            res.result.pop()
            const arr = res.result
            const resultadoMsg = '*Os seguintes links foram encontrados para sua pesquisa:*' + '\n' + arr.join('\n')
            return await client.reply(from, resultadoMsg, id)
        })
        .catch((err) => {
            console.log(color('[ERROR GOOGLE]', 'red'), err.message)
            client.reply(from, 'Houve um erro na sua solicitação :(', id)
        })
}

module.exports = {
    googleCommand
}