const fs = require('fs');
const axios = require('axios').default;
const registros = JSON.parse(fs.readFileSync('./settings/chatsRegistrados.json'));
const contatos = JSON.parse(fs.readFileSync('./settings/contacts.json'));
const apiKeys = JSON.parse(fs.readFileSync('./settings/apiKeys.json'))

require('dotenv').config()

const {
    Client
} = require('@open-wa/wa-automate')
const moment = require('moment-timezone')
moment.tz.setDefault('America/Sao_Paulo').locale('pt-br')
const Jimp = require('jimp')
const {
    msgFilter,
    color,
    processTime
} = require('../../utils')
const instaCommand = require('./commands/instagram')
const twitterCommand = require('./commands/twitter')
const facebookCommand = require('./commands/facebook')
const calcCommand = require('./commands/calcular')
const wikiCommand = require('./commands/wiki')
const criarMemeCommand = require('./commands/criarMeme')
const traduzirCommand = require('./commands/traduzir')
const rndMemeCommand = require('./commands/rndMeme')

const {
    stickerHandler
} = require('./commands/stickers')
const {
    banCommand,
    promoteCommand
} = require('./commands/adminCommands')
const {
    lembreteCommand
} = require('./commands/lembrete')
const {
    gerarKey,
    listarKeys,
    descadastrar,
    cadastrar,
    delKey,
    verificarCadastro,
    updtCommand
} = require('./commands/comandosdev')
const {
    ytbMp3Command,
    ytbMp4Command
} = require('./commands/youtube')
const {
    tikTokCommand
} = require('./commands/tiktok')
const {
    pinterestCommand
} = require('./commands/pinterest')
const {
    googleCommand
} = require('./commands/google')
const {
    ttsCommand,
    tts2Command
} = require('./commands/tts')
const {
    speechCommand
} = require('./commands/speech')
const {
    simiHandler
} = require('./commands/simiHandler')
const {
    createPoll,
    voteCommand,
    listPoll
} = require('./commands/pollHandler')

const {
    menu
} = require('./text'); // Portuguese menu

module.exports = msgHandler = async (client = new Client(), message) => {
    try {
        const {
            type,
            id,
            from,
            t,
            sender,
            isGroupMsg,
            chat,
            caption,
            isMedia,
            mimetype,
            quotedMsg,
            quotedMsgObj,
            mentionedJidList,
            chatId
        } = message
        let {
            body
        } = message
        const {
            name,
            formattedTitle
        } = chat
        let {
            pushname,
            verifiedName,
            formattedName
        } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await client.getHostNumber() + '@c.us'
        const startTime = moment()
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
        const isDev = sender.id == contatos.Developer || false
        // const simiStatus = simSimi.includes(chatId);
        const premium = verificarCadastro(from);

        // Automatic read messages
        client.sendSeen(id)

        // Bot Prefix
        const prefix = '#'
        const bodyMsg = (type === 'chat') ? body : (((type === 'image' || type === 'video') && caption)) ? caption : ''
        body = (type === 'chat' && body.startsWith(prefix)) ? body : (((type === 'image' || type === 'video') && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.trim().substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        let url = args.length !== 0 ? args[0] : ''

        if (!registros.chatsRespondidos.includes(from) && !isGroupMsg) {
            await client.sendText(from, 'Olá! Pra começar a usar o bot, basta digitar *#menu*')
            await client.sendText(from, 'Não esqueça que eu só vou funcionar se você tiver me cadastrado, caso contrário ignorarei suas mensagens. ;)')
            await client.sendText(from, 'Caso tenha uma key do bot, envie aqui no chat que cadastrarei você!')

            registros.chatsRespondidos.push(from);
            fs.writeFileSync('./settings/chatsRegistrados.json', JSON.stringify(registros, null, 1));
        }

        if (!isCmd && bodyMsg.match(/^\w{4}-\w{4}-\w{4}-\w{4}$/)) {
            cadastrar(client, message, bodyMsg)
        }

        // Leave groups/ignore chats that aren't in the allowed object.
        if (!premium && !isDev && command != 'cadastrar') {
            if (isGroupMsg)
                return client.leaveGroup(from)
            return
        }

        // simiHandler, disabled by default in case you don't have the api URL
        // if (simiStatus && !isCmd && bodyMsg) {
        //     await simiHandler(client, message, bodyMsg)
        // }

        // [BETA] Avoid Spam Message
        if (!isDev && isCmd && msgFilter.isFiltered(from) && !isGroupMsg) {
            return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'de', color(pushname))
        }
        if (!isDev && isCmd && msgFilter.isFiltered(from) && isGroupMsg) {
            return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'de', color(pushname), 'em', color(name || formattedTitle))
        }
        //
        if (!isCmd && !isGroupMsg) {
            return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Mensagem de', color(pushname))
        }
        if (!isCmd && isGroupMsg) {
            return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Mensagem de', color(pushname), 'em', color(name || formattedTitle))
        }
        if (isCmd && !isGroupMsg) {
            console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'de', color(pushname))
        }
        if (isCmd && isGroupMsg) {
            console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'de', color(pushname), 'em', color(name || formattedTitle))
        }

        // [BETA] Avoid Spam Message
        if (!isDev)
            msgFilter.addFilter(from)

        switch (command) {
            // Menu and TnC
            case 'menu':
            case 'ajuda': {
                await client.sendText(from, menu.textMenu(pushname))
                break
            }
            case 'velocidade':
            case 'ping': {
                await client.sendText(from, `Pong!!!!\nVelocidade: ${processTime(moment().unix() ,startTime)} _Segundos_`)
                break
            }
            case 'debug':
            case 'dbg': {
                // debugging purposes
                break
            }

            // Sticker Creator
            case 'fig':
            case 'figurinha':
            case 'sticker':
            case 'stiker':
            case 'stikergif':
            case 'stickergif':
            case 'gifstiker':
            case 'gifsticker': {
                await stickerHandler(client, message, args)
                break
            }
            // Video Downloader
            case 'tiktok':
            case 'ttk':
            case 'tik':
            case 'tok': {
                await tikTokCommand(client, message, args)
                break
            }
            case 'ig':
            case 'instagram':
            case 'insta': {
                await instaCommand(client, message, args)
                break
            }
            case 'tt':
            case 'twt':
            case 'twitter': {
                await twitterCommand(client, message, args)
                break
            }
            case 'fb':
            case 'facebook': {
                await facebookCommand(client, message, args)
                break
            }
            case 'pintrest':
            case 'pintere':
            case 'pinterest': {
                await pinterestCommand(client, message, args)
                break
            }
            case 'calculadora':
            case 'calc':
            case 'calcular': {
                await calcCommand(client, message)
                break
            }
            case 'gerarkey':
            case 'keygen':
            case 'genkey': {
                if (isDev) {
                    await gerarKey(client, message)
                }
                break
            }
            case 'listarkeys':
            case 'keysd':
            case 'keysdisponiveis':
            case 'keys': {
                if (isDev) {
                    await listarKeys(client, message)
                }
                break
            }
            case 'banir':
            case 'ban': {
                if (!isBotGroupAdmins) return client.reply(from, 'Como eu vou fazer isso sem ser admin macaco', id)
                await banCommand(client, message, args)
                break
            }
            case 'adm':
            case 'admin': {
                if (!isBotGroupAdmins) return client.reply(from, 'Como eu vou fazer isso sem ser admin macaco', id)
                await promoteCommand(client, message, args)
                break
            }
            case 'descadastrar':
            case 'unregister':
            case 'unreg': {
                await descadastrar(client, message)
                break
            }
            case 'cadastrar':
            case 'cadastra':
            case 'cadastro': {
                if (args.length !== 1) return client.reply(from, 'Formato da mensagem é errado, tá colocando só a key?')
                await cadastrar(client, message, arg)
                break
            }
            case 'delkey':
            case 'deletarkey': {
                if (isDev && args.length === 1) {
                    await delKey(client, message)
                }
                break
            }
            case 'tts': {
                await ttsCommand(client, message, args)
                break
            }
            case 'tts2': {
                await tts2Command(client, message, args)
                break
            }
            case 'musica':
            case 'ytb':
            case 'youtube':
            case 'ytbaudio':
            case 'ybt': {
                await ytbMp3Command(client, message)
                break
            }
            case 'ytbmp4':
            case 'ytbmp4':
            case 'ytbv':
            case 'ytbvideo': {
                await ytbMp4Command(client, message, args)
                break
            }
            // Other Command
            case 'wiki':
            case 'wikibr':
            case 'wikius': {
                await wikiCommand(client, message)
                break
            }
            case 'google':
            case 'ggle': {
                await googleCommand(client, message, args)
                break
            }
            case 'stt':
            case 'ouvir':
            case 'transcrever':
            case 'transcript':
            case 'txt': {
                await speechCommand(client, message)
                break
            }
            case 'criarmeme':
            case 'escrever':
            case 'texto':
            case 'editar':
            case 'edit': {
                await criarMemeCommand(client, message)
                break
            }
            case 'meme': {
                await rndMemeCommand(client, message)
                break
            }
            case 'traduzir': {
                await traduzirCommand(client, message)
                break
            }
            case 'lembrete':
            case 'lembrar': {
                await lembreteCommand(client, message, args)
                break
            }
            case 'criarvotacao':
            case 'votacao':
            case 'cvote': {
                await createPoll(client, message, args)
                break
            }
            case 'votar':
            case 'vote':
            case 'voto': {
                await voteCommand(client, message, args)
                break
            }

            case 'rastreio':
            case 'rastrear':
                if (args[0] == null) return client.reply(from, 'Você precisa especificar pelo menos o código de rastreio.', id)
                if (args.length == 1) {
                    if (!/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(args[0])) return client.reply(from, 'O código inserido não é válido ou não é da Correios.', id)

                    axios.get(`https://api.linketrack.com/track/json?${apiKeys.linketrackquery}&codigo=` + args[0])
                        .then(res => {
                            let data = res.data,
                                lastUpdate = data.eventos[0],
                                status = lastUpdate.status,
                                local = lastUpdate.local,
                                dataTempo = lastUpdate.data,
                                hora = lastUpdate.hora,
                                origem,
                                destino

                            try {
                                origem = lastUpdate.subStatus[0]
                                destino = lastUpdate.subStatus[1]
                            } catch (e) {}

                            if (origem == null && destino == null)
                                return client.reply(from, `Está em ${local}\n\nStatus: ${status}\nHorário e data da informação: ${dataTempo} às ${hora}`, id);
                            else
                                return client.reply(from, `Está em ${local}\n\nStatus: ${status}\nHorário e data da informação: ${dataTempo} às ${hora}\n\n${origem}\n${destino}`, id);
                        })
                        .catch(err => {
                            console.log(color('[ERROR RASTREIO]', 'red'), err)
                        })
                }
                break
            case 'btc':
            case 'bitcoin':
                if (args.length === 0) {
                    axios.get('https://blockchain.info/ticker')
                        .then((res) => {
                            let data = res.data
                            client.reply(from, `O valor atual do Bitcoin é de: \nR$ ${data.BRL.last}`, id)
                        })
                        .catch((err) => {
                            console.log(color('[ERROR BTC]', 'red'), err)
                        })
                }
                break
            case 'dol':
            case 'dollar':
            case 'dolar':
            case 'dólar':
                axios.get('https://economia.awesomeapi.com.br/all/USD-BRL').then(async (response) => {
                    let valorAtual = parseFloat(response.data.USD.bid).toFixed(2)
                    let img = await Jimp.read('./img/dollar-template.jpeg')
                    let font = await Jimp.loadFont('./fonts/dollar-font.fnt')
                    let finalImg = await img.print(font, 225, 493, valorAtual)
                    finalImg.getBase64(Jimp.AUTO, (err, result) => {
                        if (err) {
                            console.log(color('[ERROR]', 'red'), err)
                            return client.reply(from, 'Erro :( tenta denovo!')
                        } else {
                            const imageBase64 = `${result.toString('base64')}`
                            return client.sendImage(from, imageBase64, 'dollar.jpeg', 'tá alto em', id)
                        }
                    })
                }).catch((err) => {
                    console.log(color('[ERROR]', 'red'), err)
                    return client.reply(from, 'Erro :( tenta denovo!')
                })
                break

            case 'myid':
            case 'meuid':
            case 'mynum':
            case 'meunum':
                if (isDev)
                    return client.reply(from, 'Meu id é:' + botNumber, id)
                else
                    return


            case 'getgroup':
            case 'pegarid':
            case 'pegargrupo':
            case 'chatid': {
                await client.reply(from, 'O id do chat é: ' + from, id)
                break
            }

            case 'todos':
            case 'everyone':
            case 'anunciar': {
                if (isGroupMsg) {
                    try {
                        await client.tagEveryone(from, args.join(' '))
                    } catch (err) {
                        let msg = ''
                        const members = await client.getGroupMembersId(from)
                        members.forEach(mem => {
                            msg += `@${mem.split('@')[0]} `
                        })
                        msg += '\n\n'
                        msg += args.join(' ')
                        await client.sendTextWithMentions(from, msg)
                    }
                    break
                }
            }

            case 'update':
            case 'updt': {
                if (isDev) {
                    updtCommand(client, arg)
                }
                break
            }
            case 'report': {
                if (args.length < 2) return client.reply(from, 'O formato correto é:\n*#report <comando/tópico> <texto>*\n\nExemplo: *#report sticker nao esta funcionando.*')
                // Comando aguardando desenvolvimento

                break
            }
            case 'covid19':
            case 'covid':
                if (args.length !== 1) return client.reply(from, 'Você precisa informar um estado de forma correta, verifique um exemplo no *#menu*', id)
                axios.get(`https://covid19-brazil-api.now.sh/api/report/v1/brazil/uf/${args[0]}`)
                    .then(async (response) => {
                        if (response.data.hasOwnProperty('error'))
                            return client.reply(from, 'Não encontrei o estado informado! :(', id)
                        else
                            client.reply(from, `*» Estado:* ${response.data.state}\n*» Confirmados:* ${response.data.cases}\n*» Suspeitas:* ${response.data.suspects}\n*» Mortes:* ${response.data.deaths}`, id)
                    }).catch((error) => {
                        console.log(error)
                        return client.reply(from, 'Ocorreu um erro :( Tente novamente ou avise o meu DEV!')
                    })
                break
            case 'covidbr':
                axios.get('https://api.covid19api.com/total/country/brazil')
                    .then(async (response) => {
                        response.data = response.data[response.data.length - 1]
                        client.reply(from, `*» País:* ${response.data.Country}\n*» Ativos:* ${response.data.Active}\n*» Confirmados:* ${response.data.Confirmed}\n*» Mortes:* ${response.data.Deaths}\n*» Recuperados:* ${response.data.Recovered}`, id)
                    }).catch((error) => {
                        console.log(error)
                        return client.reply(from, 'Ocorreu um erro :( Tente novamente ou avise o meu DEV!', id)
                    })
                break
            case 'botstat':
                const loadedMsg = await client.getAmountOfLoadedMessages()
                const chatIds = await client.getAllChatIds()
                const groups = await client.getAllGroups()
                if (isDev)
                    client.sendText(from, `Status :\n- *${loadedMsg}* Mensagens Carregadas\n- *${groups.length}* Grupos\n- *${chatIds.length - groups.length}* Chats Privados\n- *${chatIds.length}* Chats Totais`)
                break

                // simiHandler, remember to set the simi api link
                // case 'conversar':
                // case 'conversa':
                // case 'fala':
                // case 'falar':
                // case 'ia':
                // case 'ai':
                //     // if (!isGroupMsg) return client.reply(from, 'Você precisa estar em um grupo para usar essa função!', id)
                //     if (!isDev) {
                //         if (isGroupMsg && !isGroupAdmins) return client.reply(from, 'Você precisa ser administrador do grupo para ativar ou desativar essa função.', id)
                //     }
                //     if (args.length !== 1) return client.reply(from, 'Você precisa especificar os parametros *on* ou *off*.', id)

                //     if (args[0].toLowerCase() == 'on') {
                //         if (simiStatus) {
                //             return client.reply(from, 'Er... O modo conversa já está ativo, você não quis dizer off não?')
                //         }
                //         simSimi.push(chatId)
                //         fs.writeFileSync('./settings/simsimi.json', JSON.stringify(simSimi))
                //         client.reply(from, 'A partir de agora o bot conversará com você!', id)
                //     } else if (args[0].toLowerCase() == 'off' && simiStatus) {
                //         simSimi.splice(simSimi.indexOf(chatId), 1)
                //         fs.writeFileSync('./settings/simsimi.json', JSON.stringify(simSimi))
                //         client.reply(from, 'Modo conversa desativado.', id)
                //     } else {
                //         client.reply(from, 'Parâmetro inválido, use *ON* ou *OFF*', id)
                //     }
                //     break

            case 'send':
                if (isDev) {
                    if (args.length != 2) return client.reply(from, 'Formato incorreto!', id)
                    const numero = args[0] + 'c.us'
                    args.shift()
                    await client.sendText(numero, args.join(' '))
                }
                break
                // Group Commands (group admin only)
                // case 'kick':
                //     if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
                //     if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
                //     if (!isBotGroupAdmins) return client.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup! [Bot Not Admin]', id)
                //     if (mentionedJidList.length === 0) return client.reply(from, 'O formato da mensagem está errado, verifique o correto no menu!', id)
                //     if (mentionedJidList[0] === botNumber) return await client.reply(from, 'O formato da mensagem está errado, verifique o correto no menu!', id)
                //     await client.sendTextWithMentions(from, `Request diterima, mengeluarkan:\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
                //     for (let i = 0; i < mentionedJidList.length; i++) {
                //         if (groupAdmins.includes(mentionedJidList[i])) return await client.sendText(from, 'Gagal, kamu tidak bisa mengeluarkan admin grup.')
                //         await client.removeParticipant(groupId, mentionedJidList[i])
                //     }
                //     break
                // case 'promote':
                //     if (!isGroupMsg) return await client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
                //     if (!isGroupAdmins) return await client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
                //     if (!isBotGroupAdmins) return await client.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup! [Bot not Admin]', id)
                //     if (mentionedJidList.length != 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format, Only 1 user]', id)
                //     if (groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Maaf, user tersebut sudah menjadi admin. [Bot is Admin]', id)
                //     if (mentionedJidList[0] === botNumber) return await client.reply(from, 'O formato da mensagem está errado, verifique o correto no menu!', id)
                //     await client.promoteParticipant(groupId, mentionedJidList[0])
                //     await client.sendTextWithMentions(from, `Request diterima, menambahkan @${mentionedJidList[0].replace('@c.us', '')} sebagai admin.`)
                //     break
                // case 'demote':
                //     if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
                //     if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
                //     if (!isBotGroupAdmins) return client.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup! [Bot not Admin]', id)
                //     if (mentionedJidList.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format, Only 1 user]', id)
                //     if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Maaf, user tersebut tidak menjadi admin. [user not Admin]', id)
                //     if (mentionedJidList[0] === botNumber) return await client.reply(from, 'O formato da mensagem está errado, verifique o correto no menu!', id)
                //     await client.demoteParticipant(groupId, mentionedJidList[0])
                //     await client.sendTextWithMentions(from, `Request diterima, menghapus jabatan @${mentionedJidList[0].replace('@c.us', '')}.`)
                //     break
                // case 'bye':
                //     if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
                //     if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
                //     client.sendText(from, 'Good bye... ( ⇀‸↼‶ )').then(() => client.leaveGroup(groupId))
                //     break
            case 'del':
                if (!isGroupAdmins && !isDev) return client.reply(from, 'Você precisa ser administrador do grupo para usar essa função.', id)
                if (!quotedMsg) return client.reply(from, 'Você deve marcar a mensagem que deseja deletar usando o comando #del', id)
                if (!quotedMsgObj.fromMe) return client.reply(from, 'Não foi eu quem enviou a mensagem, como vou deletá-la?', id)
                client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
                break

            default:
                console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Unregistered Command from', color(pushname))
                break
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}