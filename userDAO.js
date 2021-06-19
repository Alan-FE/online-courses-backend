require("dotenv").config();
const jwt = require("jsonwebtoken");
const jwtMethods = require("./jwt.js");
var db = require("./connection.js");

let refreshTokens = [];

module.exports = {

    token: function (req, res) {
        const refreshToken = req.body.refreshToken;
        console.log(refreshToken);
        if(refreshToken == null) return res.sendStatus(401);
        if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
        
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            console.log(user);
            delete user.iat;
            const accessToken = jwtMethods.getAccessToken(user);
            res.json({accessToken: accessToken});
        })
    },

    signIn: function (req, res) {
        const user = req.body;
        let query = `SELECT userId, firstName, lastName, email, image, role, created 
        FROM user WHERE email = ? AND password = ?`;

        db.query(query, [user.email, user.password], function (err, results) {
            if (err) return res.status(500).send(err);
            if(results.length == 0) {
                res.status(401).json({message: "The email address or password is incorrect. Please try again."});
            }
            if(!results.length == 0) {
                const js = JSON.stringify(results[0]);
                const data = JSON.parse(js);
                console.log(data);

                const accessToken = jwtMethods.getAccessToken(data);
                const refreshToken = jwtMethods.getRefreshToken(data);
                refreshTokens.push(refreshToken);
                console.log(refreshTokens);
                res.status(200).json({accessToken: accessToken, refreshToken: refreshToken});
            }
        })
    },

    signOut: function (req, res) {
        refreshTokens = refreshTokens.filter(token => token !== req.body.token);
        res.sendStatus(204);
    },
 
    createUser: function (req, res) {
        let query = "INSERT INTO user SET ?"
        const data= req.body;
        console.log(data);
        db.query(query, [data], function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results.insertId);
        })
    },

    updateAccount: function (req, res) {
        let query = "UPDATE user SET ? WHERE userId = ?";
        const id = req.query.id;
        const data= req.body;
        console.log(data);
        console.log(id);
        db.query(query, [data, id], function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    changePassword: function (req, res) {
        let query = "UPDATE user SET password = ? WHERE userId = ? AND password = ?";
        const id = req.query.id;
        const data= req.body;
        console.log(data);
        console.log(id);
        db.query(query, [data.newPassword, id, data.currentPassword], function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    deleteAccount: function (req, res) {
        let query = "DELETE FROM user WHERE userId = ?";
        const id = req.query.id;
        db.query(query, id , function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    getAllUsers: function(req, res) {
        let query = `SELECT u.userId, u.firstName, u.lastName, u.email, u.image, u.role, u.created FROM user u 
        WHERE u.role <> 'admin'`;
        db.query(query, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    getUserData: function(req, res) {
        let query = "SELECT firstName, lastName, email, image, role, created FROM user WHERE userId = ?";
        const userId = req.query.id;
        db.query(query, userId, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

}
