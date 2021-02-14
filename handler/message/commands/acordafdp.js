const axios = require('axios').default;
const open = require('open');
const fs = require('fs');

const {
    color
} = require('../../../utils')

// Spotify Related
const SpotifyWebApi = require('spotify-web-api-node');
const apiKeys = JSON.parse(fs.readFileSync('./././settings/apiKeys.json'));

// Scopes but in a string so I can just split later
let scopesStr = 'streaming app-remote-control user-modify-playback-state user-read-private user-read-email user-read-playback-state'
let scopes = scopesStr.split(' ')

const spotifyApi = new SpotifyWebApi({
    clientId: apiKeys.spotify.clientId,
    clientSecret: apiKeys.spotify.clientSecret,
    redirectUri: apiKeys.spotify.redirectUri
});

const authorizeURL = spotifyApi.createAuthorizeURL(scopes, '');

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const startSpotify = async () => {
    // Spotify Related
    await open(authorizeURL)
    await sleep(5000)

    axios.get('http://localhost:39453/').then(res => {
            let authCode = res.data

            spotifyApi.authorizationCodeGrant(authCode)
                .then(data => {
                    spotifyApi.setAccessToken(data.body['access_token']);
                    spotifyApi.setRefreshToken(data.body['refresh_token']);
                    console.log('[CLIENT]', color('Conta Spotify configurada com sucesso', 'yellow'))
                    updateSpotifyTokens(true)
                })
                .catch(err => {
                    console.log(color('[ERROR CONFIG-SPTFY]', 'red'), err)
                })
        })
        .catch(err => {
            console.log(color('[ERROR DEPENDENCIES]', 'red'), err)
        })
}

const updateSpotifyTokens = async (isFirstTime) => {
    if (!isFirstTime) {
        await spotifyApi.refreshAccessToken().then(data => {
                spotifyApi.setAccessToken(data.body['access_token']);

                console.log('[CLIENT]', color('Tokens Spotify atualizados com sucesso'))
            })
            .catch(err => {
                console.log(color('[ERROR SPTFY-UPDT]', 'red'), err)
            })
    }
    await sleep(1800000)
    updateSpotifyTokens(false)
}

const acordarCommand = async (client, message) => {
    const {
        from
    } = message

    spotifyApi.getMyDevices()
        .then(async (data) => {
            let availableDevices = data.body.devices;
            let deviceId = '';
            availableDevices.forEach(device => {
                if (device.name.includes('Echo Dot'))
                    deviceId = device.id
            })

            if (deviceId != '') {
                await client.sendText(from, 'Definindo alexa como speaker para tocar músicas...')
                spotifyApi.transferMyPlayback([deviceId], {
                        play: true
                    })
                    .then(async () => {
                        await client.sendText(from, 'Alexa definida como speaker com sucesso!')
                        await sleep(2000)

                        spotifyApi.setVolume(100)
                            .then(async () => {
                                await client.sendText(from, 'Volume configurado no máximo.')
                                await client.sendText(from, 'To acordando o desgraçado, daqui a pouco ele te manda mensagem')
                            })
                            .catch(async (err) => {
                                await client.sendText(from, 'Erro ao colocar volume no máximo.')
                                console.log(color('[ERROR SPTFY]', 'red'), err)
                            })
                    })
                    .catch(async (err) => {
                        await client.sendText(from, 'Erro ao definir alexa como speaker pra músicas.')
                        console.log(color('[ERROR SPTFY]', 'red'), err)
                    })
            }
        })
        .catch((err) => {
            console.log(color('[ERROR SPTFY]', 'red'), err)
        })
}

module.exports = {
    acordarCommand,
    startSpotify
}