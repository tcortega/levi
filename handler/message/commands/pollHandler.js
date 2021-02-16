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
        isGroupMsg,
        sender
    } = message

    // Validating the command usage
    if (!isGroupMsg) return client.reply(from, 'Você precisa estar em um grupo para usar este comando.', id)
    if (args.length !== 2) return client.reply(from, `O formato do comando está incorreto, você deve específicar o ID da votação e a sua opção.
*Exemplo:*
*#vote <id> <opcao>*
*#vote 1 0*

Verifique as opções na própria votação com o comando *#vervotacao <id>*
Verifique as votações ativas com o comando #votacoes `, id)

    const voteOption = args[1]

    const opcoesValidas = ['1', '2', '3']
    if (!opcoesValidas.includes(args[1])) return client.reply(from, 'A opção escolhida é inválida, verifique as opções disponíveis na própria votação.', id)

    // Getting the poll
    const poll = findActivePoll(args[0], from)

    if (!poll.value()) return client.reply(from, 'Esta votação não existe ou já foi finalizada, verifique as votações ativas com o comando *#votacoes*', id)
    if (verifyVoteExistence(sender.id, poll)) return client.reply(from, 'Seu voto já foi computado nesta votação.', id)

    // Voting in a poll
    const positiveVotes = poll.get('positiveVotes')
    const negativeVotes = poll.get('negativeVotes')
    const neutralVotes = poll.get('neutralVotes')
    if (voteOption === '1') {
        positiveVotes.push(sender.id)
            .write()
    } else if (voteOption === '2') {
        negativeVotes.push(sender.id)
            .write()
    } else if (voteOption === '3') {
        neutralVotes.push(sender.id)
            .write()
    }
    const positiveVotesVal = positiveVotes.value().length
    const negativeVotesVal = negativeVotes.value().length
    const neutralVotesVal = neutralVotes.value().length
    client.reply(from, `Voto computado com sucesso!

*Estado atual da votação:*
*${positiveVotesVal === 1 ? positiveVotesVal + '* pessoa votou que concorda.' : positiveVotesVal + '* pessoas votaram que concordam'} 
*${negativeVotesVal === 1 ? negativeVotesVal + '* pessoa votou que discorda.' : negativeVotesVal + '* pessoas votaram que discordam'}
*${neutralVotesVal === 1 ? neutralVotesVal + '* pessoa votou tanto faz.' : neutralVotesVal + '* pessoas votaram tanto faz'}`, id)
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
    if (args.join(' ').length >= 350) return client.reply(from, 'O título não pode ter mais de 350 letras.', id)

    const chatId = from.split('@')[0]
    if (!db.has(chatId).value()) {
        db.set(chatId, [])
            .write()
    }

    const chatPolls = db.get(chatId)
    const pollId = (db.get(chatId).value().length + 1).toString()
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

    await client.reply(from, 'Votação criada com sucesso!', id)
    await client.sendTextWithMentions(from, `*Uma nova votação foi criada!*

*ID:* ${pollId}
*${args.join(' ')}*
*Criador:* @${pollStarter.split('@')[0]}
            
*Opções:*
*1* - Concordo
*2* - Discordo
*3* - Tanto faz
            
*Como votar:*
*#vote <id> <opção>*`)

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

    const chatId = from.split('@')[0]
    const chatPolls = db.get(chatId)
    const activePolls = chatPolls.filter({
            active: true
        })
        .value()
    const endedPolls = chatPolls.filter({
            active: false
        })
        .value()


    let msg = ''
    if (activePolls.length > 0) {
        msg += '*Votações em andamento:*\n'
        activePolls.forEach((poll) => {
            msg += '*ID -* ' + poll.id + ' *|* ' + poll.title + '\n'
        })
    }
    if (endedPolls.length > 0) {
        if (msg != '') msg += '\n'

        msg += '*Votações finalizadas:*\n'
        endedPolls.forEach((poll) => {
            msg += '*ID -* ' + poll.id + ' *|* ' + poll.title + '\n'
        })
    }

    if (msg === '')
        msg = 'Nenhuma votação foi encontrada para este grupo.'

    client.sendTextWithMentions(from, msg)
        .catch(() => {
            client.reply(from, msg, id)
        })
}

const pollStats = async (client, message, args) => {
    const {
        id,
        from,
        isGroupMsg
    } = message

    if (!isGroupMsg) return client.reply(from, 'Você precisa estar em um grupo para usar este comando.', id)
    if (args.length !== 1) return client.reply(from, `O formato da mensagem está incorreto, você deve especificar o ID da votação.
*Exemplo:*
*#votacao <id>*
*#votacao 1*`, id)

    const poll = getPoll(args[0], from)

    if (!poll.value()) return client.reply(from, 'Esta votação não existe ou já foi finalizada, verifique as votações ativas com o comando *#votacoes*', id)

    const dadosVotacao = poll.value()

    const positiveVotesVal = dadosVotacao.positiveVotes.length
    const negativeVotesVal = dadosVotacao.negativeVotes.length
    const neutralVotesVal = dadosVotacao.neutralVotes.length
    const msg = `*ID:* ${dadosVotacao.id}
*${dadosVotacao.title}*
*Criador:* @${dadosVotacao.pollStarter.split('@')[0]}
            
*Estado da votação:*
*${positiveVotesVal === 1 ? positiveVotesVal + '* pessoa votou que concorda.' : positiveVotesVal + '* pessoas votaram que concordam'} 
*${negativeVotesVal === 1 ? negativeVotesVal + '* pessoa votou que discorda.' : negativeVotesVal + '* pessoas votaram que discordam'}
*${neutralVotesVal === 1 ? neutralVotesVal + '* pessoa votou tanto faz.' : neutralVotesVal + '* pessoas votaram tanto faz'}`

    return client.sendTextWithMentions(from, msg)
}

const endPoll = async (client, message, args) => {
    const {
        id,
        from,
        isGroupMsg,
        sender
    } = message

    if (!isGroupMsg) return client.reply(from, 'Você precisa estar em um grupo para usar este comando.', id)
    if (args.length !== 1) return client.reply(from, `O formato da mensagem está incorreto, você deve especificar o ID da votação.
*Exemplo:*
*#finalizar <id>*
*#finalizar 1*`, id)

    const poll = findActivePoll(args[0], from)

    if (!poll.value()) return client.reply(from, 'Esta votação não existe ou já foi finalizada, verifique as votações ativas com o comando *#votacoes*', id)
    if (poll.get('pollStarter').value() != sender.id) return client.reply(from, 'Apenas o criador da votação pode finalizá-la.', id)

    const dadosVotacao = poll.value()
    poll.assign({
            active: false
        })
        .write()

    const positiveVotesVal = dadosVotacao.positiveVotes.length
    const negativeVotesVal = dadosVotacao.negativeVotes.length
    const neutralVotesVal = dadosVotacao.neutralVotes.length
    const msg = `*Votação finalizada com sucesso!*

*ID:* ${dadosVotacao.id}
*${dadosVotacao.title}*
*Criador:* @${dadosVotacao.pollStarter.split('@')[0]}
            
*Resultado:*
*${positiveVotesVal === 1 ? positiveVotesVal + '* pessoa votou que concorda.' : positiveVotesVal + '* pessoas votaram que concordam'} 
*${negativeVotesVal === 1 ? negativeVotesVal + '* pessoa votou que discorda.' : negativeVotesVal + '* pessoas votaram que discordam'}
*${neutralVotesVal === 1 ? neutralVotesVal + '* pessoa votou tanto faz.' : neutralVotesVal + '* pessoas votaram tanto faz'}`

    return client.sendTextWithMentions(from, msg)
}

const reactivatePoll = async (client, message, args) => {
    const {
        id,
        from,
        isGroupMsg,
        sender
    } = message

    if (!isGroupMsg) return client.reply(from, 'Você precisa estar em um grupo para usar este comando.', id)
    if (args.length !== 1) return client.reply(from, `O formato da mensagem está incorreto, você deve especificar o ID da votação.
*Exemplo:*
*#reativar <id>*
*#reativar 1*`, id)

    const poll = findEndedPoll(args[0], from)

    if (!poll.value()) return client.reply(from, 'Esta votação não existe ou já foi reativada, verifique as votações finalizadas com o comando *#votacoes*', id)
    if (poll.get('pollStarter').value() != sender.id) return client.reply(from, 'Apenas o criador da votação pode reativá-la.', id)

    const dadosVotacao = poll.value()
    poll.assign({
            active: true
        })
        .write()

    const positiveVotesVal = dadosVotacao.positiveVotes.length
    const negativeVotesVal = dadosVotacao.negativeVotes.length
    const neutralVotesVal = dadosVotacao.neutralVotes.length
    const msg = `*Votação reativada com sucesso!*

*ID:* ${dadosVotacao.id}
*${dadosVotacao.title}*
*Criador:* @${dadosVotacao.pollStarter.split('@')[0]}
            
*Estado atual da votação:*
*${positiveVotesVal === 1 ? positiveVotesVal + '* pessoa votou que concorda.' : positiveVotesVal + '* pessoas votaram que concordam'} 
*${negativeVotesVal === 1 ? negativeVotesVal + '* pessoa votou que discorda.' : negativeVotesVal + '* pessoas votaram que discordam'}
*${neutralVotesVal === 1 ? neutralVotesVal + '* pessoa votou tanto faz.' : neutralVotesVal + '* pessoas votaram tanto faz'}`

    return client.sendTextWithMentions(from, msg)
}

const resetPolls = async (client, message) => {
    const {
        id,
        from,
        isGroupMsg
    } = message

    if (!isGroupMsg) return client.reply(from, 'Você precisa estar em um grupo para usar este comando.', id)

    const chatId = from.split('@')[0]
    db.set(chatId, [])
        .write()

    return await client.reply(from, 'Todas votações foram deletadas com sucesso.', id)
}

const verifyVoteExistence = (voter, poll) => {
    if (poll.get('positiveVotes').value().includes(voter))
        return true
    if (poll.get('negativeVotes').value().includes(voter))
        return true
    if (poll.get('neutralVotes').value().includes(voter))
        return true

    return false
}

const findActivePoll = (id, chatId) => {
    chatId = chatId.split('@')[0]
    const poll = db.get(chatId)
        .find({
            id: id,
            active: true
        })

    return poll
}

const findEndedPoll = (id, chatId) => {
    chatId = chatId.split('@')[0]
    const poll = db.get(chatId)
        .find({
            id: id,
            active: false
        })

    return poll
}

const getPoll = (id, chatId) => {
    chatId = chatId.split('@')[0]
    const poll = db.get(chatId)
        .find({
            id: id
        })

    return poll
}

module.exports = {
    voteCommand,
    createPoll,
    listPoll,
    endPoll,
    reactivatePoll,
    pollStats,
    resetPolls
}