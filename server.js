const express = require("express");
const app = express();
const port = 3000;
var cors = require("cors");

var courseDAO = require("./courseDAO.js");
var instructorDAO = require("./instructorDAO.js");
var userDAO = require("./userDAO.js");
var cartDAO = require("./cartDAO.js");
var reviewDAO = require("./reviewDAO.js");
var jwt = require("./jwt.js");


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.get("/all-courses", courseDAO.getAllCourses);
app.get("/course", courseDAO.getCourseById);
app.post("/select-filter", courseDAO.filter);
app.get("/reviews", reviewDAO.getReviews);
app.get("/cart", jwt.authenticateToken, cartDAO.getDataFromCart);
app.get("/order-history", courseDAO.ordersHistory);
app.get("/popular-courses", courseDAO.popularCourses);
app.get("/statistics", courseDAO.statistics);
app.get("/student-list", courseDAO.listOfStudents);
app.get("/all-instructors", instructorDAO.getAllInstructors);
app.get('/get-instructor-by-id', instructorDAO.getInstructorById);
app.get('/get-instructor-courses', instructorDAO.getInstructorCourses);
app.get('/about-instructor', instructorDAO.getAboutInstructor);
app.get('/popular-instructors', instructorDAO.popularInstructors);
app.get("/get-all-users", userDAO.getAllUsers);
app.get("/get-user-data", userDAO.getUserData);
app.get("/get-all-courses", courseDAO.allCoursesAdmin);
app.get("/dashboard", courseDAO.calculation);

app.put("/update-biography", instructorDAO.updateBiography);
app.put("/update-account", userDAO.updateAccount);
app.put("/update-course", courseDAO.updateCourse);
app.put("/update-review", reviewDAO.updateReview);
app.put("/change-password", userDAO.changePassword);

app.post("/token", userDAO.token);
app.post("/sign-in", userDAO.signIn);
app.post("/create-user", userDAO.createUser);
app.post("/create-course", courseDAO.createCourse);
app.post("/add-to-cart", cartDAO.addToCart);
app.post("/buy-course", courseDAO.buyCourse);
app.post("/add-review", reviewDAO.postReview);

app.delete("/delete-from-cart", cartDAO.deleteFromCartById);
app.delete("/clear-cart", cartDAO.clearCart);
app.delete("/delete-course", courseDAO.deleteCourse);
app.delete("/sign-out", userDAO.signOut);
app.delete("/delete-account", userDAO.deleteAccount);
app.delete("/delete-review", reviewDAO.deleteReview);

app.listen(port, () => {
    console.log("Application work on port " + port);
});
