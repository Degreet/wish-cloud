const fs = require('fs'), fsp = fs.promises
const {ObjectId} = require("mongodb")

module.exports = async function requestHandler(req, res) {
    let { url } = req
    if (url.startsWith('/api/')) {
        res.setHeader('Content-Type', 'application/json')
        url = url.slice(5)

        if (url.startsWith('ping?')) {
            const id = url.match(/id=([^&$]*)/)
            if (id) {
                const user = global.count.find(user => user.id == id[1])
                if (user) user.ts = Date.now()
                else global.count.push({id: id[1].c(), ts: Date.now()})
            }
            res.end(String(global.count.length))
        } else if (url == 'like') {
            const wishId = await streamToString(req)
            if (wishId) {
                wishes.updateOne({_id: ObjectId(wishId)}, {$inc: {rating: 1}})
            }

            res.end()
        } else if (url == 'addwish') {
            const wishText = (await streamToString(req)).trim()
            if (wishText) {
                const wish = {text: wishText, date: new Date, rating: 0}
                await wishes.insertOne(wish)
                res.end(JSON.stringify(wish))
            }
        } else if (url.startsWith('wishes?')) {
            const by = url.match(/by=([^&$]*)/)[1]
            const asc = +url.match(/asc=([^&$]*)/)[1]
            const offset = +(url.match(/offset=([^&$]*)/) || [0, 0])[1]
            const limit = +(url.match(/limit=([^&$]*)/) || [0, 10])[1]
            getDocs(wishes, limit, by, asc, offset).then(wishesData => res.end(JSON.stringify(wishesData)))
        } else if (url == 'remove') {
            const {key, id} = JSON.parse((await streamToString(req)).trim())
            if (key == process.env.KEY) wishes.deleteOne({_id: ObjectId(id)})
            res.end()
        }
    } else {
        let path = process.cwd()+'/public'+url.replace(/\/$/, '')

        try {
            const target = await fsp.stat(path).catch(_=> fsp.stat(path+='.html'))
            if (target.isDirectory()) path += '/index.html'
            const match = path.match(/\.(\w+)$/), ext = match? match[1] : 'html'

            if (path.endsWith("/public/index.html")) {
                const [file, wishesData] = await Promise.all([fsp.readFile(path), getDocs(wishes, 10, '_id')])
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

function getDocs(collection, num, by, asc, offset=0) {
    return collection.find().sort({[by]:asc?1:-1}).skip(offset).limit(num).toArray()
}