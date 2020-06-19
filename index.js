require("c4console")
const {MongoClient, ObjectId} = require("mongodb")
const {createServer} = require('http')
const fs = require('fs'), fsp = fs.promises
const server = createServer(requestHandler)
const uri = "mongodb+srv://Node:D9tsePvH7yKtlNLw@cluster0-ttfss.mongodb.net/serverdb?retryWrites=true&w=majority"
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true})
client.connect(err => {
    if (err) console.log(err)
    global.wishes = client.db("serverdb").collection("wishes")
    server.listen(process.env.PORT || 3000, () => console.log('Server started at http://localhost:3000'))

    setTimeout(() => {
        client.close()
    }, 1e9)
})

async function requestHandler(req, res) {
    let { url } = req
    if (url.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json')
        url = url.slice(5)
        if (url == 'addwish') {
            const wishText = (await streamToString(req)).trim()
            if (wishText) {
                const wish = {text: wishText, date: new Date, rating: 0}
                await wishes.insertOne(wish)
                res.end(JSON.stringify(wish))
            }
        } else if (url == 'like') {
            const wishId = await streamToString(req)
            if (wishId) {
                wishes.updateOne({_id: ObjectId(wishId)}, {$inc: {rating: 1}})
            }
        }
    } else {
        let path = process.cwd()+'/public'+url

        try {
            const target = await fsp.stat(path).catch(_=> fsp.stat(path+='.html'))
            if (target.isDirectory()) path += '/index.html'
            const match = path.match(/\.(\w+)$/), ext = match? match[1] : 'html'

            if (path.c().endsWith("/public/index.html")) {
                const [file, wishesData] = await Promise.all([fsp.readFile(path), getLast(wishes, 10)])
                const html = file.toString().replace(/(id="wishList">)/, '$1' + wishesData.map(buildWish).join(''))
                res.setHeader('Content-Type', 'text/html')
                res.end(html)
            } else {
                fs.createReadStream(path).pipe(res)
                res.setHeader('Content-Type', {
                    html: 'text/html',
                    json: 'application/json',
                    css: 'text/css',
                    ico: 'image/x-icon',
                    jpg: 'image/jpeg',
                    png: 'image/png',
                    gif: 'image/gif',
                    svg: 'image/svg+xml',
                    js: 'application/javascript',
                }[ext])
            }
        } catch {
            res.end('"... sorry, ' + url + ' is not available"')
        }
    }
}

function streamToString(stream) {
    const chunks = []
    return new Promise((resolve, reject) => {
        stream.on('data', chunk => chunks.push(chunk))
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
}

function buildWish(wish) {
    return `<li class="wish">
        <b>${wish.text}</b>
        <div class="left">
            <p>${formatDate(wish.date)}</p>
            <a id="w${wish._id}" href=""><i class="fa fa-thumbs-up"></i> <span>${wish.rating}</span></a>
        </div>
    </li>`
}

function formatDate(date) {
    return `${date.getDate().toString().padStart(2, '0')}.${
        (date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear() % 100}`
}

function getLast(collection, num) {
    return collection.find().sort({_id:-1}).limit(num).toArray()
}