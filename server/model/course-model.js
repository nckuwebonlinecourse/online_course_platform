const mongoose=require("mongoose");
const {Schema}=mongoose;
//id title description price teacher students
courseSchema=new Schema( {
    id:{
        type:String,
    } ,
    title:{
        type:String,
        require:true,
        minlength:3,
        maxlength:50
    }, 
    description:{
        type:String,
        require:true,
        // minlength:3,
        // maxlength:1000
    }, 
    price:{  
        type:Number,
        require:true
    }, 
    teacher:{
        type:mongoose.Schema.Types.ObjectId,//relate to user
        ref:"User"//conn to user
    },
    students:{
        type:[String],//string  arr
        default:[],
    }
});

module.exports=mongoose.model("Course",courseSchema);