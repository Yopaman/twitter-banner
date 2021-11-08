require('dotenv').config()
const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const puppeteer = require('puppeteer')
const TwitterApi = require('twitter-api-v2')
let available = true
let lastTweet = ""

const twitterClient = new TwitterApi.TwitterApi({
    appKey: process.env.TWITTER_CONSUMER_KEY,
    appSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
})

const bot = mineflayer.createBot({
    host: process.env.MINECRAFT_HOST,
    username: 'Bot'
})

bot.once('spawn', () => {
    mineflayerViewer(bot, { port: 3000, firstPerson: true }) // Start the viewing server on port 3000
})

bot.on('chat', (username, message) => {
    if (username === bot.username) return
    if (message == 'photo') {
        if (available) {
            (async () => {
                const browser = await puppeteer.launch()
                const page = await browser.newPage()
                await page.goto('http://localhost:3000', {waitUntil: 'networkidle2'})
                setTimeout(async () => {
                    await page.screenshot({ path: 'banner.png' })
                    await browser.close()
                    await twitterClient.v1.updateAccountProfileBanner('./banner.png', { offset_top: 640, offset_left: 400 });
                    available = false
                    lastTweet = 
                    setTimeout(() => {
                        available = true
                    }, 600000)
                }, 8000)
            })();
        } else {
            bot.chat("Vous devez attendre 10 minutes entre chaque utilisations de la commande !")
            
        }
    }
})

bot.on('kicked', console.log)
bot.on('error', console.log)