const axios = require('axios').default
const {
    color
} = require('../../../utils')

module.exports = wiki = async (client, message) => {
    const {
        from,
        type
    } = message
    let {
        body
    } = message

    const prefix = '#'
    body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
    const arg = body.trim().substring(body.indexOf(' ') + 1)
    const args = body.trim().split(/ +/).slice(1)
    const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()

    if (args.length <= 0) return client.sendText(from, 'você tem que me falar o que quer buscar né imbecil.')

    let wikiURL

    if (command == 'wikibr')
        wikiURL = 'https://pt.wikipedia.org/w/api.php';
    else if (command == 'wikius')
        wikiURL = 'https://en.wikipedia.org/w/api.php';
    else if (command == 'wiki')
        wikiURL = 'https://desciclopedia.org/api.php'

    axios.get(wikiURL, {
            params: {
                format: "json",
                action: "query",
                prop: "extracts",
                exintro: "",
                explaintext: "",
                redirects: "1",
                titles: arg
            }
        })
        .then(async (res) => {
            for (const page of Object.values(res.data.query.pages)) {
                if (page.hasOwnProperty('extract')) {
                    if (page.extract != "") {
                        return await client.sendText(from, page.extract);
                    } else {
                        return await client.sendText(from, 'Conteúdo da Wikipédia vazio :(');
                    }
                } else {
                    return await client.sendText(from, 'Não consegui encontrar nada na Wikipédia sobre isso :(');
                }
            }
        })
        .catch(async (err) => {
            await client.sendText(from, 'Erro, tente novamente!');
            return console.log(color('[ERROR]', 'red'), err);
        })
}