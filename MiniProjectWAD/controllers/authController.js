const multer = require('multer');
const path = require('path');
const user = require('../models/profiles')
const jwt = require('jsonwebtoken');
const { nextTick } = require('process');
const authUser = require('../middleware/authMiddleware');

var myarray_course = {
    name : "",
    video : "",
    id : -1,
    complete : false,
} 

// handle errors
const handleErr = (err) => {
    let errors = {username : '', email: '', password: '' };
  
    // duplicate email error
    if (err.code === 11000) {
        if(err.message.includes('username')){
            errors.username = 'username already taken';
        }
        if(err.message.includes('email')){
            errors.email = 'that email is already registered';
        } 
        return errors;
    }
  
    // validation errors
    if (err.message.includes('user validation failed')) {
      Object.values(err.errors).forEach(({ properties }) => {
        errors[properties.path] = properties.message;
      });
    }
    return errors;
}

var Storage = multer.diskStorage({
    destination : "./statics/profilephotos/",
    filename:(req,file,cb)=>{
        cb(null,file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
})

//upload image
module.exports.upload = multer({
    storage:Storage,
}).single('file');

const maxAge = 24* 60*60;

const createToken = (id) => {
    return jwt.sign({ id: id },'Itismysecret' , {
        expiresIn: maxAge
    });
}

//get index page
module.exports.home_get = (req,res) =>{
    res.render('index.ejs');
}

//get login page
module.exports.login_get = (req,res) =>{
    const error_msg = "";
    res.render('login.ejs',{error_msg});
}

//get signup page
module.exports.signup_get = (req,res) =>{
    const email_error ="" ;
    const user_error = "" ;
    const pass_error = ""
    res.render('register.ejs', {email_error,user_error,pass_error});
}

//get logout page
module.exports.logout_get = (req,res)=>{
    //replace jwt cookie with blank cookie and expiry very soon
    res.cookie('jwt', '', {maxAge:1});
    res.redirect('/');
}

//display profile
module.exports.profileHome_get = (req,res,next)=>{
    res.render('profile.ejs');
}

//display all the avaiilable courses
module.exports.allcourses_get = (req,res,next)=>{
    res.render('allcourses.ejs');
}

//display information of a particular course
module.exports.course_get = (req,res)=>{
    res.render('mycourse.ejs',{course : myarray_course});
}

//display homepage for crud tasks
module.exports.homepage_get = (req,res)=>{
    res.render('homepage.ejs');
}


//-------------------POST REQUESTS-----------------------------------

//login
module.exports.login_post = async (req,res) =>{
    const username = req.body.username;
    const password = req.body.password;
 
    try{
        const User = await user.login(username,password);
        const token =jwt.sign({ id: User.id },'Itismysecret' , {expiresIn: maxAge});
        res.cookie('jwt', token ,{httpOnly : true ,maxAge: maxAge*1000});
        console.log("User logged in");
        res.redirect('/profile');
    }
    catch(err){
        res.status(400);
        console.log(err.message);
        const error_msg = err.message;
        res.render('login.ejs',{error_msg});
    }
}

//signup
module.exports.signup_post = async(req,res) =>{
    const userInfo = {
        fullname: req.body.fullname,
        username : req.body.username,
        email : req.body.email,
        password : req.body.password,
        photo: req.file.filename,
    };

    try{
     const newUser = await user.create(userInfo);
     console.log("User Created");
     res.redirect("/login");
    }
    catch(err){
        const errors = handleErr(err);
        email_error = errors.email;
        pass_error = errors.password;
        user_error = errors.username;
        res.render('register.ejs', {email_error,user_error,pass_error});
    }
};

//get info about a particular post
module.exports.course_post = (req,res,next)=>{
    const courseName = req.body.name;
    var courseid = req.body.itsid;
    courseid = parseInt(courseid,10);

    user.findOne({'courses': {$elemMatch: {id : courseid}}},function(err,User){
        if(err){
            console.log(err);
            next();
        }
        else{
            myarray_course = {
                name :  User.courses[courseid].course_name,
                video :  User.courses[courseid].course_video,
                id : courseid,
                complete : User.courses[courseid].complete,
            }
            res.redirect('/mycourse')
            next();
           
        }
    })     
}

//Complete course when clicked as complete
module.exports.mycourse_post = (req,res)=>{
    var id = req.body.id;
    id = parseInt(id,10);
    const userid = req.body.userid;
    user.findOneAndUpdate(
        { _id : userid,
            courses:{$elemMatch: {id:id}},
        },
        {$set: {'courses.$.complete' : true}},
        (err)=>{
            console.log("Not updating: " + err);
        }    
    )
    res.redirect('/allcourses');    
} 

//Add tasks
module.exports.addtask_post = async(req,res,next)=>{

    const title = req.body.title;
    const userid = req.body.userid;
    const User = await user.findById(userid);
    const mytask ={
        "name": title,
        "id": title,
    }
    user.findOneAndUpdate(
        { _id: userid }, 
        { $push: { tasks: mytask } },
       function (error, success) {
            if (error) {
                console.log(error);
            } else {
            console.log(success);
        }
    });
    res.redirect('/homepage');
}

//delete that task
module.exports.deletetask = (req,res)=>{
    const userid = req.body.userid;
    const taskid = req.body.taskid;
    user.findOneAndUpdate(
        { _id: userid,},
        { $pull: { tasks : {id:taskid}}},
        (err)=>{
            console.log(err);
        }
    );
    res.redirect('/homepage');
    
}

//update the task
module.exports.updatetask = (req,res)=>{
    console.log(req.body);
    const userid = req.body.userid;
    const id = req.body.taskid;
    const newname = req.body.updated;
    console.log(userid,id,newname);
    finaltask = {
        'name' : newname,
        'id' : newname
    }

    user.findOneAndUpdate(
        { _id : userid,
            tasks :{$elemMatch:{id :id}},
        },
        {$set: 
            {'tasks.$': finaltask},
        },
        (err)=>{
            console.log("Not updating: " + err);
        }    
    )
    res.redirect('/homepage');
}

//Update Profile INfo
module.exports.updateprofile_post = (req,res)=>{
    const newName = req.body.myname;
    const newuserName = req.body.myusername;
    const newEmail = req.body.myemail;
    const userid = req.body.userid;

    console.log(req.body);

    user.findByIdAndUpdate(
        { _id : userid},
        {$set: 
            {  'fullname' : newName,
                'username': newuserName,
                'email' : newEmail, 
            },
        },
        (err)=>{
            console.log("Not updating: " + err);
        }    
    )
    res.redirect('/profiles');

}



        

