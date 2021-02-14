exports.textTwt = () => {
    return `Siga meu criador no twitter para ficar por dentro das atualizações:
twitter.com/tcortega_`
}

exports.textSite = () => {
    return `Guarda o meu site pra ficar sempre com o meu contato atualizado :)
tcortega.github.io/whatsapp-bot-website`
}

exports.textMenu = (pushname) => {
    return `
eae ${pushname}
aqui tem alguns comandos do bot(preguiça de escrever todos)

Criador de Sticker:
1. *#fig*
Transforma imagens ou videos em stickers.
Como usar: Envie uma imagem com a legenda #sticker ou responda à alguma imagem enviada, escrevendo #sticker

Downloader:
1. *#ytb* _<link do vídeo>_ ou _<titulo>_
Faz download de qualquer vídeo do youtube em formato de áudio.
Como usar: #ytb https://www.youtube.com/watch?v=mmUA8NpJ6ks

2. *#fb* _<post/video url>_
Faz download de vídeos do Facebook.
Como usar: Envie uma mensagem como *#fb https://www.facebook.com/.....*

3. *#ig* _<instagram post url>_
Faz download de fotos e vídeos do Instagram.
Como usar: Envie uma mensagem como *#ig https://www.instagram.com/p/CG9rKOFD5XrJJS7pyhhE8Kzw1LNeQVVwzu3Qpo0/*

4. *#twt* _<twitter post url>_
Faz download de fotos e vídeos do Twitter.
Como usar: Envie uma mensagem como *#twt https://twitter.com/cleytxn/status/1321893733982457858*

Outros:
1. *#dol* ou *#dolar*
Vai mandar uma imagem no chat com a cotação atualdo do dólar!
Como usar: Basta digitar *#dol* ou *#dolar*

2. *#traduzir* _<idioma alvo>_ (BUGADO!!)
Vai traduzir a mensagem marcada para o idioma específicado.
Como usar: Responda ou cite a mensagem que você quer traduzir, exemplo _*#traduzir id*_ <- id é o código do idioma, você pode ver todos ids em: *https://bit.ly/33FVldE*

3. *#rastreio* _<codigo rastreio>_
Verifica o status da sua encomenda correios ou outras transportadoras.
Como usar: Ainda não implementado.

4. *#txt* _<texto primario>_|_<texto secundario>_ (Não use acentos!)
Gera uma imagem de meme com dois textos de sua escolha.
Como usar: envie uma foto com a legenda _*#meme mama minha | pirocona*_, ou responda à uma imagem existente.

5. *#covid19 _<UF>_*
Verifica as estatísticas de covid19 em um UF específicado.
Exemplo: #covid19 SP

6. *#covidbr*
Verifica as estatísticas de covid19 no brasil.
Exemplo: #covidbr

7. *#wikibr _<pesquisa>_* (Acentos e letras maiúsculas importam e muito ao fazer a busca)
Trás dados da Wikipédia brasileira sobre determinado assunto.
Como usar: #wikibr Menestrel

7². *#wikius _<pesquisa>_* (Acentos e letras maiúsculas importam e muito ao fazer a busca)
Trás dados da Wikipédia inglês sobre determinado assunto.
Como usar: #wikius particles

7³. *#wiki _<pesquisa>_* (Acentos e letras maiúsculas importam e muito ao fazer a busca)
Trás dados da Desciclopédia sobre determinado assunto.
Como usar: #wiki Rogério Skylab

8. *#todos _<mensagem>_*
Manda uma mensagem marcando todos membros do grupo.
Como usar: #todos Olá mundo!
OBS.: Também funciona com #everyone ou #anunciar
`
}