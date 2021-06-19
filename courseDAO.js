var db = require("./connection.js");
var func = require("./func.js");

module.exports = {

    getAllCourses: function(req, res) {
        let query = `SELECT c.courseId, c.courseName, c.image, c.price, u.firstName, u.lastName, u.userId,
        (SELECT IFNULL(round(avg(rw1.rating), 1), 0) FROM review rw1 WHERE rw1.fkCourse = c.courseId) as rating,
        (SELECT count(*) FROM review rw2 WHERE rw2.fkCourse = c.courseId) as noRating  
        FROM course as c JOIN user u ON u.userId = c.fkUser
        JOIN instructor i ON i.fkUser = u.userId ORDER BY c.courseName ASC`;

        db.query(query, function (err, results) {
            if (err) return res.send(err);

            res.status(200).json(results);
        });
    },
   
    getCourseById: function(req, res) {
        let query = `SELECT concat(u1.firstName, ' ', u1.lastName) as instrFullName, c.courseId, c.courseName, c.description, 
        c.language, c.image, c.price, c.added, c.content, c.fkUser,
        c.courseId IN (SELECT ct.fkCourse FROM cart ct JOIN user u2 ON  u2.userId = ct.fkUser
        WHERE ct.fkCourse = c.courseId AND ct.fkUser = ?) as inCart,
        c.courseId IN (SELECT p.fkCourse FROM purchased p JOIN user u3 ON u3.userId = p.fkUser
        WHERE p.fkCourse = c.courseId AND p.fkUser = ?) as purchased,
        (SELECT avg(rw.rating) FROM review rw WHERE rw.fkCourse = c.courseId) as courseRating,
        (SELECT IFNULL(ct.cartId, 0) FROM cart ct WHERE ct.fkCourse = c.courseId) as cartId,
        (SELECT count(*) FROM review rw2 WHERE rw2.fkCourse = c.courseId) as noRating  
        FROM user u1 JOIN instructor i ON i.fkUser = u1.userId 
        JOIN course c ON c.fkUser = u1.userId WHERE c.courseId = ?`;
        const data = req.query;
        console.log(data);
        db.query(query, [data.userId, data.userId, data.courseId] , function (err, results) {
            if (err) return res.send(err);
            results = func.transform(results);
            res.status(200).json(results);
        });
    },
   
    createCourse: function(req, res) {
        req.body.content = req.body.content.toString();
        let data = req.body;
        let query = `INSERT INTO course SET ?`;

        db.query(query, data, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results.insertId);
        })
    },

    updateCourse: function(req, res) {
        let query = "UPDATE course SET ? WHERE courseId = ?";
        req.body.content = req.body.content.toString();
        const id = req.query.courseId;
        const data = req.body;

        console.log(id);
        console.log(data);
        db.query(query, [data, id], function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    deleteCourse: function(req, res) {
        let query = "DELETE FROM course WHERE courseId = ?";
        let id = req.query.id;
        console.log(id);
        db.query(query, id, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    buyCourse: function(req, res) {
        let query = "INSERT INTO purchased SET ?";
        let data = req.body;
        console.log(data);
        db.query(query, [data], function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    ordersHistory: function(req, res) {
        let query = `SELECT p.dateTime, c.courseName, c.image, c.price FROM purchased p JOIN course c
        ON c.courseId = p.fkCourse WHERE p.fkUser =?`;
        let id = req.query.id;
        console.log(id);
        db.query(query, id, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    popularCourses: function(req, res) {
        let query = `SELECT c.courseId, c.courseName, c.image, c.price, u.firstName, u.lastName, 
        (SELECT round(avg(rw1.rating), 1) FROM review rw1 WHERE rw1.fkCourse = c.courseId) 
        as rating, (SELECT count(*) FROM review rw2 WHERE rw2.fkCourse = c.courseId) as noRating  
        FROM course c JOIN user u ON u.userId = c.fkUser JOIN instructor i ON i.fkUser = u.userId
        ORDER BY rating DESC LIMIT 5`;
        db.query(query, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    statistics: function(req, res) {
        let query = `SELECT count(c.courseId) as noCourses, 
        (SELECT count(p.orderId) FROM purchased p ) as soldCourses,
        (SELECT count(u.userId) FROM user u WHERE role='instructor') as noInstructors FROM course c`;
        db.query(query, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    listOfStudents: function(req, res) {
        let query = `SELECT u.firstName, u.lastName, u.email FROM user u JOIN purchased p
        ON p.fkUser = u.userId WHERE p.fkCourse = ?`;
        let id = req.query.id;
        db.query(query, id, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    filter: function (req, res) {
        let query = `SELECT c.courseId, c.courseName, c.image, c.price, u.firstName, u.lastName, u.userId,
        (SELECT IFNULL(round(avg(rw1.rating), 1), 0) FROM review rw1 WHERE rw1.fkCourse = c.courseId) as rating,
        (SELECT count(*) FROM review rw2 WHERE rw2.fkCourse = c.courseId) as noRating  
        FROM course as c JOIN user u ON u.userId = c.fkUser
        JOIN instructor i ON i.fkUser = u.userId `;
        const id = req.query.id;
        const data = req.body.value;
        console.log(data)
        if(data === 'my-courses') {
            query += "WHERE u.userId = ?"
        };

        if(data === 'other-courses') {
            query += "WHERE u.userId <> ?"
        };

        if(data === 'highest-rated') {
            query += `WHERE  (SELECT round(avg(rw1.rating) > 3, 1) 
            FROM review rw1 WHERE rw1.fkCourse = c.courseId) ORDER BY rating DESC`
        };

        if(data === 'price') {
            query += "ORDER BY c.price ASC" 
        };
        db.query(query, id, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    },

    allCoursesAdmin: function(req, res) {
        let query = `SELECT concat(u1.firstName, ' ', u1.lastName) as instrFullName, c.courseId, c.courseName, c.description, 
        c.language, c.image, c.price, c.added, c.content, 
        (SELECT IFNULL(round(avg(rw.rating), 1), 0) FROM review rw WHERE rw.fkCourse = c.courseId) as courseRating
        FROM user u1 JOIN instructor i ON i.fkUser = u1.userId 
        JOIN course c ON c.fkUser = u1.userId `;
        db.query(query, function (err, results) {
            if (err) return res.send(err);
            results = func.transform(results);
            res.status(200).json(results);
        })
    },

    calculation: function(req, res) {
        let query = `SELECT count(u.userId) as totalUsers,
        (SELECT  count(c.courseId) FROM course c ) as totalCourses,
        (SELECT sum(c1.price) FROM course c1 JOIN purchased p1 ON p1.fkCourse = c1.courseId) as totalEarnings,
        (SELECT count(p2.orderId) FROM purchased p2) as totalOrders FROM user u WHERE u.role <> 'admin'`;
        db.query(query, function (err, results) {
            if (err) return res.send(err);
            res.status(200).json(results);
        })
    }

};