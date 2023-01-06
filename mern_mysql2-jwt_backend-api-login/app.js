const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require("jsonwebtoken");
const secret = "jwtSecret";

app.use(cors());

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "mern_mysql2_jwt",
});

app.post("/register", jsonParser, function (req, res, next) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        connection.execute(
            "INSERT INTO users (email, password, fname, lname) VALUES (?,?,?,?)",
            [req.body.email, hash, req.body.fname, req.body.lname],
            function (err, results, fields) {
                if (err) {
                    res.json({ status: "error", message: err });
                    return;
                }
                res.json({ status: "ok" });
            }
        );
    });
});

// have token
app.post("/login", jsonParser, function (req, res, next) {
    connection.execute(
        "SELECT * FROM users WHERE email=?",
        [req.body.email],
        function (err, users, fields) {
            if (err) {
                res.json({ status: "error", message: err });
                return;
            }
            if (users.length == 0) {
                res.json({ status: "error", message: "no user found" });
                return;
            }
            bcrypt.compare(
                req.body.password,
                users[0].password,
                function (err, isLogin) {
                    if (isLogin) {
                        var token = jwt.sign(
                            { email: users[0].email },
                            secret,
                            { expiresIn: "1h" }
                        );
                        res.json({
                            status: "ok",
                            message: "login success",
                            token,
                        });
                    } else {
                        res.json({ status: "error", message: "login failed" });
                    }
                }
            );
        }
    );
});

// น่าจะเป็นฟังชั่น decode token
app.post("/authen", jsonParser, function (req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1]; // .split(' ')[1] = ตัด Bearer ใน token ออก
        const decoded = jwt.verify(token, secret); // น่าจะเป็น ถอด decode token
        res.json({status: 'ok',decoded });
    } catch (err) {
        res.json({status:'error',message:err.message})
    }
});

// // none token
// app.post("/login", jsonParser, function (req, res, next) {
//     connection.execute(
//         'SELECT * FROM users WHERE email=?',
//         [req.body.email],
//         function (err, users, fields) {
//             if (err) {
//                 res.json({ status: "error", message: err });
//                 return;
//             }
//             if (users.length == 0) {
//                 res.json({ status: "error", message: "no user found" });
//                 return;
//             }
//             bcrypt.compare(
//                 req.body.password,
//                 users[0].password,
//                 function (err, isLogin) {
//                     if (isLogin) {
//                         res.json({ status: "ok", message: "login success" });
//                     } else {
//                         res.json({ status: "error", message: "login failed" });
//                     }
//                 }
//             );
//         }
//     );
// });

app.listen(3333, function () {
    console.log("CORS-enabled web server listening on port 3333");
});
