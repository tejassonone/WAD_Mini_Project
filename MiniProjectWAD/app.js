const { request } = require('express');
const express = require('express');
const mongose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');

const app = express();

const Profile = require('./models/profiles');
const { checkUser ,requireAuth } = require('./middleware/authMiddleware');

//middlewares
var port = process.env.PORT || 3000;

app.set('view engine' , 'ejs');
app.use(express.static('statics'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))


//mongodb connection
const dburi = 'mongodb+srv://myuser:myuser123@project1.rn7o3.mongodb.net/Project1?retryWrites=true&w=majority';
mongose.connect(dburi)
    .then((result)=> {
        app.listen(port);
        console.log("Listening");
    })
    .catch((err)=> console.log(err));

//mongose.connect(dburi , {useNewUrlParser : true, useUnifiedTopology : true});

app.get('*', checkUser);
app.use(authRoutes); 