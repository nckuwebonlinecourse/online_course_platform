const mongoose=require("mongoose");
const {Schema}=mongoose;
const bcrybt=require("bcrypt");
//name email pwd role date
const userSchema=new Schema({
    username:{
        type:String,
        require:true,
        minlength:3,
        maxlength:50
    },
    email:{
        type:String,
        require:true,
        minlength:6,
        maxlength:50
    },
    password:{
        type:String,
        require:true,
    },
    role:{
        type:String,
        enum:["student","teacher"],
        require:true,
    },
    date:{
        type:Date,
        default:Date.now,
    }
});

//methods to determine id 
userSchema.methods.isStudent=function(){
    return this.role=="student";
};
userSchema.methods.isTeacher=function(){
    return this.role=="teacher";
};

//auth (cmp pwd)
userSchema.methods.Auth=async function(pwd,cb){
    let result;
    try{
        result=await bcrybt.compare(pwd,this.password);
        return cb(null,result);
    }
    catch(e){
        return cb(e,result);
    }
}

//store pwd when new or modified usr
userSchema.pre("save",async function(next){
    
    if(this.isNew || this.isModified("password")){
        const hashed=await bcrybt.hash(this.password,10);
        this.password=hashed;
    }
    next();

});
module.exports=mongoose.model("User",userSchema);//doc name,setting 
