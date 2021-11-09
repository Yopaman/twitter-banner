require('dotenv').config()
const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer
const puppeteer = require('puppeteer')
const TwitterApi = require('twitter-api-v2')
const winston = require('winston')
let available = true
let lastTweet = ""

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.timestamp(),
    transports: [
        new winston.transports.File({ filename: 'twitter-banner.log' }),
    ],
    });

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

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
                bot.chat("Prise de la photo dans 10 secondes.")
                const browser = await puppeteer.launch({
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                })
                const page = await browser.newPage()
                await page.goto('http://localhost:3000', {waitUntil: 'networkidle2'})
                setTimeout(async () => {
                    bot.chat("Cheese !!!")
                    await page.screenshot({ path: 'banner.png' })
                    await browser.close()
                    await twitterClient.v1.updateAccountProfileBanner('./banner.png', { offset_top: 640, offset_left: 400 });
                    available = false
                    const now = Date.now()
                    lastTweet = new Date(now).toTimeString()
                    logger.info("Le joueur " + username + " a pris une photo")
                    setTimeout(() => {
                        available = true
                    }, 600000)
                }, 10000)
            })();
        } else {
            bot.chat("Vous devez attendre 10 minutes entre chaque utilisations de la commande ! (dernière photo : " + lastTweet + ")")
            
        }
    }
})

bot.on('kicked', console.log)
bot.on('error', console.log)