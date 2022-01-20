const express = require("express")
const server = express()

const cors = require('cors');

//Middleware
server.use(express.json());
server.use(cors());
server.options('*', cors());

// use routes
const routes = require("./routes")
server.use(routes)

const port = 3000

server.listen(port, () => {
    console.log("Server started at: " + port)
})