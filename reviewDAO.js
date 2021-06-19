var db = require("./connection.js");

module.exports = {

    getReviews: function(req, res) {
        let query = `SELECT u.userId, rw.reviewId, concat(u.firstName, ' ' , u.lastName) as fullName,
        u.image, rw.rating, rw.review, rw.dateTime
       FROM user u JOIN review rw ON u.userId = rw.fkUser AND rw.fkCourse =?`;
        const data = req.query.courseId;
        db.query(query, data, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    postReview: function(req, res) {
        let query = "INSERT INTO review SET ?";
        let data = req.body;
        console.log(data);
        db.query(query, data, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results.insertId);
        })
    },

    updateReview: function(req, res) {
        let query = "UPDATE review SET ? WHERE reviewId = ?";
        let reviewId = req.query.reviewId;
        let data = req.body;
        db.query(query, [data, reviewId], function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    deleteReview: function (req, res) {
        let query = "DELETE FROM review WHERE reviewId = ?";
        let reviewId = req.query.reviewId;
        db.query(query, reviewId , function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    }
}