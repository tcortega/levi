const low = require('lowdb')
const fs = require('lowdb/adapters/FileSync')
const adapter = new fs('./././settings/polldata.json')
const db = low(adapter)
const moment = require('moment-timezone')
moment.tz.setDefault('America/Sao_Paulo').locale('pt-br')

const voteCommand = async (client, message, args) => {
    const {
        id,
        from,
        isGroupMsg
    } = message

    if (!isGroupMsg) return client.reply(from, 'Você precisa estar em um grupo para usar este comando.', id)

}

const createPoll = async (client, message, args) => {
    const {
        id,
        from,
        sender,
        isGroupMsg
    } = message

    if (!isGroupMsg) return client.reply(from, 'Você precisa estar em um grupo para usar este comando.', id)
    if (args.length <= 0) return client.reply(from, 'Você precisa dar um título/texto para a votação.', id)

    const chatId = from.split('@')[0]
    if (!db.has(chatId).value()) {
        db.set(chatId, [])
            .write()
    }

    const chatPolls = db.get(chatId)
    const pollId = db.get(chatId).value().length + 1
    const pollStarter = sender.id
    const startDate = moment().format('DD-MMM-YYYY-hh:mm:ss')
    chatPolls.push({
            id: pollId,
            title: args.join(' '),
            pollStarter: pollStarter,
            active: true,
            startDate: startDate,
            positiveVotes: [],
            negativeVotes: [],
            neutralVotes: []
        })
        .write()

    const dataFormatada = startDate.split('-')[0] + ' de ' + startDate.split('-')[1] + ' às ' + startDate.split('-')[3].split(':')[0] + 'h' + startDate.split('-')[3].split(':')[1]

    await client.reply(from, 'Votação criada com sucesso!', id)
    await client.sendTextWithMentions(from, `*Uma nova votação foi criada!*

*ID:* ${pollId}
*${args.join(' ')}*
*Criador:* @${pollStarter.split('@')[0]}
            
*Opções:*
*0* - Sim
*1* - Não
*2* - Tanto faz
            
*Como votar:*
*#vote <id> <opção>*
            
*Exemplo:*
*#vote ${pollId} 0*`)

    return await client.reply(from, `Você pode desativar a votação a qualquer momento usando o comando:
*#resultado ${pollId}*
            
e reativar utilizando:
*#reativar ${pollId}*`)
}

const listPoll = async (client, message) => {
    const {
        id,
        from,
        isGroupMsg
    } = message

    if (!isGroupMsg) return client.reply(from, 'Você precisa estar em um grupo para usar este comando.', id)
}

module.exports = {
    voteCommand,
    createPoll,
    listPoll
}