var db = require("./connection.js");

module.exports = {
    
    getDataFromCart: function(req, res) {
        let query = `SELECT ct.cartId, u.firstName, u.lastName, c.courseName, c.courseId, c.image, c.price, ct.addedToCart FROM
        user u JOIN instructor i ON u.userId = i.fkUser JOIN course c ON 
        c.fkUser = u.userId JOIN cart ct ON ct.fkCourse = c.courseId
        WHERE ct.fkUser = ?`
        const id = req.query.id
        db.query(query, id, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    addToCart: function(req, res) {
        const data = req.body;
        console.log(data);
        let query = "INSERT INTO cart SET ?";
        db.query(query, data, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results.insertId);
        })
    },

    clearCart: function(req, res) {
        let query = "DELETE FROM cart ";
        const cartId = req.query.id;
        if(cartId !== "undefined") {
            query += "WHERE cartId = ?";
        };
        console.log(cartId)
        db.query(query, cartId, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },
}