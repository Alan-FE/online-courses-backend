var db = require("./connection.js");

module.exports = {
    getAllInstructors: function(req, res) {
        let query = `SELECT i.instructorId, concat(u.firstName, ' ', u.lastName) as instrFullName, u.image, u.role, i.profession,
        (SELECT IFNULL(round(avg(rw1.rating), 1), 0) FROM review rw1 JOIN course c1 ON c1.courseId = rw1.fkCourse 
        WHERE c1.fkUser = u.userId) as instrRating,
        (SELECT count(*) FROM review rw2 JOIN course c2 ON c2.courseId = rw2.fkCourse
        WHERE c2.fkUser = u.userId) as noReviews, 
        (SELECT count(*) FROM purchased p JOIN course c3 ON c3.courseId = p.fkCourse
        WHERE c3.fkUser = u.userId) as noStudents,
        (SELECT count(*) FROM course c4 WHERE c4.fkUser = u.userId) as noCourses
        FROM user u JOIN instructor i ON u.userId = i.fkUser`;
        db.query(query, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    getInstructorById: function(req, res) {
        let query = `SELECT concat(u.firstName, ' ', u.lastName) as instrFullName, u.image,
        u.role, i.profession, i.biography, IFNULL(round(avg(rw.rating), 1), 0) as instrRating, 
        count(rw.review) as noReviews,
        (SELECT count(*) FROM course WHERE course.fkUser = u.userId) as noCourses,
        (SELECT count(p.fkCourse) FROM purchased p JOIN course c ON c.courseId = p.fkCourse 
        WHERE c.fkUser = u.userId) as noStudents
        FROM instructor i JOIN user u ON u.userId = i.fkUser
        JOIN course c ON c.fkUser = u.userId
        JOIN review rw ON rw.fkCourse = c.courseId WHERE i.instructorId = ?`;
        const id = req.query.id;
        db.query(query, id, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    getInstructorCourses: function(req, res) {
        let query = `SELECT c.courseId, c.courseName, c.image, c.price, u.firstName, u.lastName, u.userId,
        (SELECT IFNULL(round(avg(rw1.rating), 1), 0) FROM review rw1 WHERE rw1.fkCourse = c.courseId) as rating,
        (SELECT count(*) FROM review rw2 WHERE rw2.fkCourse = c.courseId) as noRating  
        FROM course as c JOIN user u ON u.userId = c.fkUser
        JOIN instructor i ON i.fkUser = u.userId WHERE i.instructorId = ?`;
        const id = req.query.id;
        
        db.query(query, id, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    getAboutInstructor: function(req, res) {
        let query = "SELECT instructorId, biography, profession FROM instructor WHERE fkUser = ?";
        const id = req.query.id;
        db.query(query, id, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    addBiography: function(req, res) {
        let query = "INSERT INTO instructor SET ?";
        const data = req.body;
        console.log(data)
        db.query(query, data, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    updateBiography: function(req, res) {
        let query = "UPDATE instructor SET profession = ?, biography = ? WHERE fkUser = ?";
        const data = req.body;

        db.query(query, [ data.profession, data.biography, data.fkUser ], function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    popularInstructors: function(req, res) {
        let query = `SELECT concat(u.firstName, ' ' , u.lastName)as instrFullName, u.image, i.instructorId,
        (SELECT IFNULL(round(avg(rw1.rating), 1), 0) FROM review rw1 JOIN course c1 ON c1.courseId = rw1.fkCourse 
        WHERE c1.fkUser = u.userId) as rating, 
        (SELECT count(*) FROM course c1 WHERE c1.fkUser = u.userId) as noCourses FROM course c2 
        JOIN user u ON u.userId = c2.fkUser JOIN instructor i ON i.fkUser = u.userId
        GROUP BY i.instructorId ORDER BY rating DESC LIMIT 4`;

        db.query(query, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    }
};