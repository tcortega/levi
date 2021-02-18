const {
    rmdirSync,
    mkdirSync
} = require('fs');
const {
    create,
    Client
} = require('@open-wa/wa-automate')
const {
    color
} = require('./utils')
const options = require('./utils/options')
const {
    reminderHandler
} = require('./handler/message/commands/lembrete')

const start = (client = new Client()) => {
    console.log('[DEV]', color('Levi', 'yellow'))
    console.log('[CLIENT] CLIENT Iniciado!')

    client.getHostNumber().then(botnumber => {
        console.log('[CLIENT] Número:', color(botnumber + '@c.us', 'yellow'))
    })

    // Cleaning temp folder everytime the bot starts
    rmdirSync('./temp-folder', {
        recursive: true
    })
    mkdirSync('./temp-folder')

    reminderHandler(client)

    // Force it to keep the current session
    client.onStateChanged((state) => {
        console.log('[CLIENT STATE]', state)
        if (state === 'CONFLICT') client.forceRefocus()
    })

    // listening on message
    client.onMessage((message) => {
        client.getAmountOfLoadedMessages() // Cut message Cache if cache more than 3K
            .then((msg) => {
                if (msg >= 2000) {
                    console.log('[CLIENT]', color(`Mensagens carregadas alcançou ${msg}, limpando cache...`, 'yellow'))
                    client.cutMsgCache()
                }
            })
        // Message Handler
        require('./handler/message')(client, message)
    })

    // listen group invitation
    client.onAddedToGroup(({
            groupMetadata: {
                id
            },
            contact: {
                name
            }
        }) =>
        client.getGroupMembersId(id)
        .then((ids) => {
            console.log('[CLIENT]', color(`Convidado para o grupo. [ ${name} : ${ids.length}]`, 'yellow'))
            client.sendText(id, `Olá membros do grupo *${name}*, obrigado por me convidar! Para ver o que eu posso fazer, mande: *#menu*`)
            client.sendText(id, 'Não esqueça que eu só vou funcionar se você tiver me cadastrado ;)')
            // }
        }))
}

create(options(true, start)).then((client) => start(client))
    .catch((err) => new Error(err))