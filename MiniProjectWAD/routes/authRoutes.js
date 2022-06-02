const { Router } = require("express");
const {requireAuth , checkUser} = require("../middleware/authMiddleware");

const router = Router();
const authController = require('../controllers/authController');


router.get("/", authController.home_get)
router.get("/register",authController.signup_get);


router.get("/login",authController.login_get);
router.get('/logout',authController.logout_get);
router.get('/profile',authController.profileHome_get);
router.get('/allcourses',authController.allcourses_get);
router.get('/mycourse',authController.course_get);
router.get('/homepage',authController.homepage_get);

router.post("/login",authController.login_post);
router.post('/register', authController.upload, authController.signup_post); 
router.post('/course',authController.course_post);
router.post('/mycourse',authController.mycourse_post);
router.post('/homepage/addtask', authController.addtask_post);
router.post('/homepage/delete',authController.deletetask);
router.post('/homepage/updatetask',authController.updatetask);
router.post('/profile/update',authController.updateprofile_post)
module.exports = router;