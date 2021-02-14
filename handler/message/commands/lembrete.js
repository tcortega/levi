const fs = require('fs');
const {
    color
} = require('../../../utils')
const moment = require('moment-timezone')
moment.tz.setDefault('America/Sao_Paulo').locale('pt-br')
const {
    Client
} = require('@open-wa/wa-automate')
const lembretes = JSON.parse(fs.readFileSync('./././settings/lembretes.json'))

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const reminderHandler = async (client = new Client()) => {
    let lembretesAlterados = false;
    if (lembretes.dados.length > 0) {
        lembretes.dados.forEach(lembrete => {
            if (moment() >= moment(lembrete[2])) {
                if (lembrete[0] == lembrete[1]) {
                    client.sendText(lembrete[0], `*Ei, aqui está seu lembrete!* ⏰\n\n${lembrete[3]}`)
                } else {
                    client.sendTextWithMentions(lembrete[1], `*Ei @${lembrete[0].split('@')[0]}, aqui está seu lembrete!* ⏰\n\n${lembrete[3]}`)
                }
                lembretes.dados.splice(lembretes.dados.indexOf(lembrete), 1)
                lembretesAlterados = true
            }
        })
        if (lembretesAlterados)
            fs.writeFileSync('./././settings/lembretes.json', JSON.stringify(lembretes, null, 1))
    }

    await sleep(15000)
    reminderHandler(client)
}

const lembreteCommand = async (client, message, args) => {
    const {
        id,
        from,
        sender
    } = message
    const today = moment();

    try {
        if (args.length < 3) return client.reply(from, 'O formato está incorreto. Formato exemplo:\n*#lembrar 17/05 22:50 Comprar plug anal*.', id)
        if (!/^[0-3][0-9][/][0-1][0-9]$/.test(args[0])) return client.reply(from, 'O formato está incorreto, use exemplo:\n*lembrar 17/05 22:50 Comprar plug anal*.', id)
        if (!/^[0-2][0-9][:][0-5][0-9]$/.test(args[1])) return client.reply(from, 'O formato está incorreto, use exemplo:\n*lembrar 17/05 22:50 Comprar plug anal*.', id)

        let dia, mes, horas, minutos
        try {
            dia = parseInt(args[0].split('/')[0])
            mes = parseInt(args[0].split('/')[1])
            horas = parseInt(args[1].split(':')[0])
            minutos = parseInt(args[1].split(':')[1])
        } catch (error) {
            return client.reply(from, 'Data ou hora inserida é inválida.', id)
        }

        if (dia > 31 || dia < 1 || mes > 12 || mes < 1) return client.reply(from, 'Data inserida inválida.', id)
        if (horas > 23 || horas < 0 || minutos > 59 || minutos < 0) return client.reply(from, 'Hora inserida inválida.', id)

        dia = args[0].split('/')[0], mes = args[0].split('/')[1]
        args.shift()
        horas = args[0].split(':')[0], args[0].split(':')[1]
        args.shift()

        let lembrete = args.join(' ')
        let data = moment(`${dia}-${mes}-${today.year()}-${horas}:${minutos}`, 'DD-MM-YYYY-hh:mm')

        if (data.unix() <= today.unix())
            data.add(1, 'y')

        let arrDados = [sender.id, from, data.format(), lembrete]
        lembretes.dados.push(arrDados)
        fs.writeFileSync('./././settings/lembretes.json', JSON.stringify(lembretes, null, 1))

        return client.reply(from, 'Lembrete agendado com sucesso!', id)

    } catch (err) {
        console.log(color('[ERROR LEMBRETE]', 'red'), err)
    }
}

module.exports = {
    reminderHandler,
    lembreteCommand
}