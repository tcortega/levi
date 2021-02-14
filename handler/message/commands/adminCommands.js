const fs = require('fs')
const contatos = JSON.parse(fs.readFileSync('./././settings/contacts.json'))

const promoteCommand = async (client, message, args) => {
    const {
        id,
        from,
        sender,
        isGroupMsg,
        chat,
        quotedMsg,
        quotedMsgObj,
        chatId
    } = message

    let msgInvalidos = ''

    const groupId = isGroupMsg ? chat.groupMetadata.id : ''
    const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
    const isGroupAdmins = groupAdmins.includes(sender.id) || false
    const isDev = sender.id == contatos.Developer || false

    args = [...new Set(args)]

    if (quotedMsg) {
        if ((isDev || isGroupAdmins)) {
            return await client.promoteParticipant(quotedMsgObj.chatId, quotedMsgObj.author)
        } else {
            return await client.reply(from, 'só obedeço admins blz cachorra', id)
        }
    } else {
        args.forEach(async num => {
            if (!num.startsWith('@')) return msgInvalidos = `${num} não é um participante válido.\n`
            num = num.replace('@', '') + '@c.us'

            await client.promoteParticipant(chatId, num)

        })
        if (msgInvalidos != '') {
            return client.reply(from, msgInvalidos, id)
        }
    }
}

const banCommand = async (client, message, args) => {
    const {
        id,
        from,
        sender,
        isGroupMsg,
        chat,
        quotedMsg,
        quotedMsgObj,
        chatId
    } = message

    let msgInvalidos = ''

    const botNumber = await client.getHostNumber() + '@c.us'
    const groupId = isGroupMsg ? chat.groupMetadata.id : ''
    const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
    const isGroupAdmins = groupAdmins.includes(sender.id) || false
    const isDev = sender.id == contatos.Developer || false

    args = [...new Set(args)]

    if (quotedMsg) {
        if ((isDev || isGroupAdmins)) {
            if (quotedMsgObj.author == contatos.Developer) return client.reply(from, 'ele tem antiban burro', id)
            if (quotedMsgObj.author == botNumber) return client.reply(from, 'eu não vou me banir né animal', id)
            await client.removeParticipant(quotedMsgObj.chatId, quotedMsgObj.author)
        } else {
            return await client.reply(from, 'só obedeço admins blz cachorra', id)
        }
    } else {
        args.forEach(async num => {
            if (!num.startsWith('@')) return msgInvalidos = `${num} não é um participante válido.\n`
            num = num.replace('@', '') + '@c.us'

            if (num == botNumber) return client.reply(from, 'eu não vou me banir né animal', id)
            if (num == contatos.Developer) return client.reply(from, 'ele tem antiban burro', id)

            await client.removeParticipant(chatId, num)

        })
        if (msgInvalidos != '') {
            return client.reply(from, msgInvalidos, id)
        }
    }
}

module.exports = {
    banCommand,
    promoteCommand
}