const jwt = require('jsonwebtoken');
const Users = require('../models/profiles');

const requireAuth = (req,res,next) => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token,'It is my secret',(err,decodedToken) => {
            if(err){
                console.log(err.message);
                res.redirect('/login');
            }else{
                console.log(decodedToken);
                //res.send("hellooooo")
                next();
            }
        });
        //res.send(token.body);
    }
}

const checkUser = (req,res,next) =>{
    console.log("CheckUser is called");
    const token = req.cookies.jwt;
    if(token){
        
        jwt.verify(token,'Itismysecret',async (err,decodedToken) => {
            if(err){
                console.log("Error message: "+err.message);
                res.locals.users = null;
                next();
            }else{
                const user = await Users.findById(decodedToken.id);
                res.locals.myusers = user;   
                next();
                
            }
        }); 
    }
    else{
        res.locals.users = null;
        next();
    }
}
module.exports = {requireAuth , checkUser};