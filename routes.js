var router = require("express").Router();
var multer = require("multer");
var fs = require("fs");
var db_connection_object = require("./db_connect.json");

var Pool = require("pg").Pool;
var db = new Pool(db_connection_object);

var fileStorage = multer.diskStorage({
    destination: "files",
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

var fileUpload = multer({
    storage: fileStorage,
});

router.get("/testdb", (req, res) => {
    db.query("SELECT * FROM files", (error, results) => {
        if (error) {
            res.status(500).send("PG DB Error occured.");
        } else {
            res.status(200).json(results.rows);
        }
    });
});

router.post(
    "/uploadFile",
    fileUpload.single("file"),
    async (req, res) => {
        if (req.body.size == null) {
            res.status(400).send("Must provide file size");
            return;
        }

        if (req.file == null) {
            res.status(400).send("Must provide a file");
        }

        try {
            await db.query(
                "INSERT INTO files (id, name, type, size) VALUES (DEFAULT, $1, $2, $3);",
                [req.file.originalname, req.body.type, Math.ceil(req.body.size)]
            );
        } catch (e) {
            res.status(500).send("Error occured saving to database: " + e);
        }

        res.send(req.file);
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);

router.get("/getFiles", (req, res) => {
    db.query("SELECT * FROM files", (error, results) => {
        if (error) {
            res.status(500).send("PG DB Error occured: " + error);
        } else {
            res.status(200).json(results.rows);
        }
    });
});

router.get("/downloadFile", (req, res) => {
    var fileName = req.query.fileName;

    if (fileName == null || fileName == "") {
        res.status(400).send(
            "Must provide a file name. Change route to: downloadFile?fileName='someFileName.extension'"
        );
        return;
    }

    try {
        var dir = fs.opendirSync("files");

        var file = dir.readSync();

        while (file.name != fileName) {
            file = dir.readSync();

            if (file == null) {
                res.status(400).send("File not found.");
                return;
            }
        }

        dir.closeSync();

        res.download("files/" + file.name);
    } catch (e) {
        res.status(500).send("Server error occured: " + e);
    }
});

module.exports = router;
