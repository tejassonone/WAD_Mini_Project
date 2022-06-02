const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const profileSchema = new Schema({
    fullname:{
        type: String,
        required:true
    },

    username:{
        type : String,
        required : true,
        unique: true,
    },

    email:{
        type : String,
        required : true,
        unique : true,    
    },

    password:{
        type: String,
        required : true,
        minlength : 6,
        unique : true,
    },

    photo:{ 
        type : String,
        required: true,
    }
,
    courses:{
        type: Array,
        default : [
            {
                "id": 0,
                "course_name" : "NodeJS Authentication",
                "course_video" : "https://www.youtube.com/embed/eWGwQ1__73E",
                "complete" : false
            },
            {
                "id" : 1,
                "course_name" : "MongoDB Crash Course",
                "course_video" : "https://www.youtube.com/embed/pWbMrx5rVBE",
                "complete" : false
            },
            {
                "id" : 2,
                "course_name" : "Mongoose",
                "course_video" : "https://www.youtube.com/embed/DZBGEVgL2eE",
                "complete" : false
            }
        ]
    },
    tasks :{
        type:Array,
    }
});


profileSchema.pre('save',async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

profileSchema.statics.login = async function(username,password){
    const user = await this.findOne({username});
    if(user){
        const auth = await bcrypt.compare(password,user.password);
        if(auth){
            return user;
        }
        throw Error("Incorrect Password");
    }
    throw Error("Incorrect email");

}


const Profile = mongoose.model('Profile',profileSchema);

module.exports = Profile;