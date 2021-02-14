const {
    meme
} = require('../../../lib')
const {
    color
} = require('../../../utils')


module.exports = rndMemeCommand = async (client, message) => {
    const {
        id,
        from
    } = message

    meme.random('')
        .then(res => {
            if (!res.url)
                console.log(res)

            return client.sendImage(from, res.url, res.url.split('/')[3], `${res.title}\nSubreddit: ${res.subreddit}`, id)
        })
        .catch(err => {
            console.log(color('[ERROR RNDMEME]', 'red'), err)
        })

}