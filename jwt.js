const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {

    getAccessToken: function (payload) {
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
    },

    getRefreshToken: function (payload) {
        return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);      
    },

    authenticateToken: function (req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) return res.sendStatus(401);
      
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
          console.log(err);
          if (err) return res.sendStatus(403);
          req.user = user;
          next();
        })
    }
}