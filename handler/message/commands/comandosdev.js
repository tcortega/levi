const fs = require('fs');
const {
    Client
} = require('@open-wa/wa-automate')
const {
    keyGen,
    color
} = require('../../../utils');
const cadastros = JSON.parse(fs.readFileSync('./././settings/cadastros.json'))
const contatos = JSON.parse(fs.readFileSync('./././settings/contacts.json'))

const gerarKey = async (client = new Client(), message) => {
    const {
        type,
        id,
        from,
        caption
    } = message
    let {
        body
    } = message

    const prefix = '#'
    body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
    const args = body.trim().split(/ +/).slice(1)

    let key = keyGen()
    while (cadastros.keysDisponiveisChat.includes(key) || cadastros.keysDisponiveisGrupo.includes(key))
        key = keyGen()

    if (args[0].startsWith('g'))
        cadastros.keysDisponiveisGrupo.push(key)
    else if (args[0].startsWith('c') || args[0].startsWith('p'))
        cadastros.keysDisponiveisChat.push(key)
    else
        return client.reply(from, 'Você precisa específicar o tipo de key.', id)

    fs.writeFileSync('./././settings/cadastros.json', JSON.stringify(cadastros, null, 1))
    return client.reply(from, 'A key gerada é: ' + key, id)
}

const listarKeys = async (client = new Client(), message) => {
    const {
        id,
        from
    } = message
    let msgKeys = ""

    if (cadastros.keysDisponiveisGrupo.length > 0) {
        msgKeys += "*As seguintes keys de grupo estão disponíveis:*\n\n"
        cadastros.keysDisponiveisGrupo.forEach((key) => {
            msgKeys += key + "\n"
        })
    }
    if (cadastros.keysDisponiveisChat.length > 0) {
        msgKeys += "\n*As seguintes keys de chat estão disponíveis:*\n\n"
        cadastros.keysDisponiveisChat.forEach((key) => {
            msgKeys += key + "\n"
        })
    }
    if (msgKeys == "") {
        msgKeys += "*Não existe nenhuma key disponível.*"
    }

    return client.reply(from, msgKeys, id)
}

const descadastrar = async (client = new Client(), message) => {
    const {
        id,
        from,
        sender,
        isGroupMsg,
        chat
    } = message
    const groupId = isGroupMsg ? chat.groupMetadata.id : ''
    const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
    const isGroupAdmins = groupAdmins.includes(sender.id) || false
    const isDev = sender.id == contatos.Developer || false

    if ((isDev || isGroupAdmins) && isGroupMsg) {
        if (cadastros.chatsPermitidos.includes(from)) {
            cadastros.chatsPermitidos.splice(cadastros.chatsPermitidos.indexOf(from), 1)
            fs.writeFileSync('./././settings/cadastros.json', JSON.stringify(cadastros, null, 1))
            return client.reply(from, 'Grupo descadastrado com sucesso!', id)
        } else {
            return client.reply(from, 'Errr... O grupo nem cadastrado tá', id)
        }
    }
    if (cadastros.chatsPermitidos.includes(from) && !isGroupMsg) {
        cadastros.chatsPermitidos.splice(cadastros.chatsPermitidos.indexOf(from), 1)
        fs.writeFileSync('./././settings/cadastros.json', JSON.stringify(cadastros, null, 1))
        return client.reply(from, 'Chat descadastrado com sucesso!', id)
    } else {
        return client.reply(from, 'Errr... O chat nem cadastrado tá', id)
    }
}

const cadastrar = async (client = new Client(), message, key) => {
    const {
        id,
        from,
        isGroupMsg,
    } = message

    if (isGroupMsg) {
        if (cadastros.keysDisponiveisGrupo.includes(key)) {
            if (cadastros.chatsPermitidos.includes(from)) {
                return client.reply(from, 'O grupo já consta como cadastrado por aqui...', id)
            } else {
                cadastros.keysDisponiveisGrupo.splice(cadastros.keysDisponiveisGrupo.indexOf(key), 1)
                cadastros.chatsPermitidos.push(from)
                fs.writeFileSync('./././settings/cadastros.json', JSON.stringify(cadastros, null, 1))
                return client.reply(from, 'O grupo já pode usar o bot!\nComece vendo o *#menu* :)', id)
            }
        } else {
            return client.reply(from, 'A key é inválida ou é apenas para chat privado, mas tem certeza que digitou tudo certo?', id)
        }
    } else {
        if (cadastros.keysDisponiveisChat.includes(key)) {
            if (cadastros.chatsPermitidos.includes(from)) {
                return client.reply(from, 'O chat já consta como cadastrado por aqui...', id)
            } else {
                cadastros.keysDisponiveisChat.splice(cadastros.keysDisponiveisChat.indexOf(key), 1)
                cadastros.chatsPermitidos.push(from)
                fs.writeFileSync('./././settings/cadastros.json', JSON.stringify(cadastros, null, 1))
                return client.reply(from, 'Agora você pode usar o bot!\nComece vendo o *#menu* :)', id)
            }
        } else {
            return client.reply(from, 'A key é inválida ou é apenas para grupos, mas tem certeza que digitou tudo certo?', id)
        }
    }
}

const delKey = async (client = new Client(), message) => {
    const {
        from,
        sender,
        body,
        id
    } = message

    const isDev = sender.id == contatos.Developer || false
    const args = body.trim().split(/ +/).slice(1)


    if (isDev && args.length === 1) {
        const key = args[0]
        if (cadastros.keysDisponiveisGrupo.includes(key)) {
            cadastros.keysDisponiveisGrupo.splice(cadastros.keysDisponiveisGrupo.indexOf(key), 1)
        } else if (cadastros.keysDisponiveisChat.includes(key)) {
            cadastros.keysDisponiveisChat.splice(cadastros.keysDisponiveisChat.indexOf(key), 1)
        } else {
            client.reply(from, 'Não encontrei essa key, talvez já tenha sido deletada?', id)
        }
        fs.writeFileSync('./././settings/cadastros.json', JSON.stringify(cadastros, null, 1))
        return client.reply(from, 'Key deletada com sucesso!', id)
    }
}

const verificarCadastro = (from) => {
    if (cadastros.chatsPermitidos.includes(from))
        return true
    else
        return false
}

const updtCommand = (client, arg) => {
    cadastros.chatsPermitidos.forEach(chatMsg => {
        try {
            client.sendText(chatMsg, arg)
        } catch (err) {
            console.log(color(`[ERROR UPDT ${chatMsg}]`, 'red'), err.message)
        }
    })
}

module.exports = {
    gerarKey,
    listarKeys,
    descadastrar,
    cadastrar,
    delKey,
    verificarCadastro,
    updtCommand
}