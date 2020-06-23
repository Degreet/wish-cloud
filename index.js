require("c4console")
const {MongoClient, ObjectId} = require("mongodb")
const {createServer} = require('http')
const requestHandler = process.env.PORT ? require('./requestHandler') : (req, resp) => {
    require('./requestHandler')(req, resp)
    delete require.cache[require.resolve('./requestHandler')]
}
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