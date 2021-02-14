const {
    Client
} = require("@open-wa/wa-automate");
const math = require('mathjs');

module.exports = calcCommand = async (client = new Client(), message, args) => {
    const {
        id,
        from
    } = message

    try {
        const args = body.trim().split(/ +/).slice(1)

        if (args.length === 0) return client.reply(from, 'Você precisa específicar uma expressão matemática, exemplo:\n*#calc 2+2*', id)
        else return client.reply(from, 'O resultado da expressão é: *' + math.evaluate(arg) + '*', id)
    } catch (err) {
        return client.reply(from, 'Erro ao calcular expressão', id)
    }
}