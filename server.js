const express = require("express")
const server = express()

// use routes
const routes = require("./routes")
server.use(routes)

const port = 3000

server.listen(port, () => {
    console.log("Server started at: " + port)
})