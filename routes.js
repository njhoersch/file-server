var router = require("express").Router()
var multer = require("multer")
var fs = require("fs")

var fileStorage = multer.diskStorage({
    destination: "files",
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

var fileUpload = multer({
    storage: fileStorage
})

router.post("/uploadFile", fileUpload.single("file"), (req, res) => {
    res.send(req.file)
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get("/getFiles", (req, res) => {
    try {
        var dir = fs.opendirSync("files")

        var entries = []

        var entry = dir.readSync()
        while (entry != null) {
            if (entry.name.charAt(0) != ".") {
                entries.push(entry.name)
            }
            entry = dir.readSync()
        }
    
        dir.closeSync()

        res.status(200).send(entries)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.get("/downloadFile", (req, res) => {
    var fileName = req.query.fileName

    if (fileName == null || fileName == "") {
        res.status(400).send(
            "Must provide a file name. Change route to: downloadFile?fileName='someFileName.extension'"
        )
        return;
    }

    try {
        var dir = fs.opendirSync("files")
        
        var file = dir.readSync()

        while (file.name != fileName) {
            file = dir.readSync()

            if (file == null) {
                res.status(400).send("File not found.")
                return
            }
        }

        dir.closeSync()

        res.download("files/" + file.name)
    } catch(e) {
        res.status(500).send("Server error occured: " + e)
    }
})

module.exports = router