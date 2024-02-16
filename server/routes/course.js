const router=require("express").Router();
const course=require("../model").course;
const courseValidation = require("../validations").courseValidation;

router.use((req,res,next)=>{
    console.log("course 正接受一個req");
    next();
})
// display all courses
router.get("/",async (req,res)=>{
  try{ 
    let findCourse=await course.find({})
    .populate("teacher",["username","email"])
    .exec();
    //new is for construct
    return res.send(findCourse); 
  }catch(e){
    return res.status(500).send(e); 
  }
});

//info block
//teacher / student's courses
router.get("/teacher/:_teacher_id",async (req,res)=>{
  try{
    let { _teacher_id } = req.params; 
    let findCourse=await course.find({teacher:_teacher_id})
    .populate("teacher",["username","email"])
    .exec();
    return res.send(findCourse); 

  }catch(e){
    return res.status(500).send(e); 
  }
});

router.get("/student/:_student_id",async (req,res)=>{
  try{
    let { _student_id } = req.params; 
    let findCourse=await course.find({students:_student_id})
    .populate("teacher",["username","email"])
    .exec();
    return res.send(findCourse); 
  }catch(e){
    return res.status(500).send(e); 
  }
});

//course block
router.get("/find_by_title/:_course_title",async (req,res)=>{
  try{
    let { _course_title } = req.params; 
    let findCourse=await course.find({title:_course_title})
    .populate("teacher",["username","email"])
    .exec();
    return res.send(findCourse); 
  }catch(e){
    return res.status(500).send(e); 
  }
});

router.get("/find_by_id/:_course_id",async (req,res)=>{
  try{
    let { _course_id } = req.params; 
    let findCourse=await course.find({_id:_course_id})
    .populate("teacher",["username","email"])
    .exec();
    return res.send(findCourse); 
  }catch(e){
    return res.status(500).send(e); 
  }
});

//teacher block
//root:add
router.post("/",async (req,res)=>{
  let { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isStudent()) {
    return res
      .status(400)
      .send("只有講師才能發佈新課程。若你已經是講師，請透過講師帳號登入。");
  }

  let {title,description,price}=req.body;
  try{
    let newCourse = new course({
        title,
        description,
        price,
        teacher: req.user._id,
      });
      
    let saved= await newCourse.save();
    res.send({
        msg:"成功保存",
        saved
      });
  }catch(e){
    console.error("Error saving course:", e);
    res.status(500).send("課保存失敗：" + e.message);
  }
}
)
router.post("/enroll/:_course_title",async (req,res)=>{
  try{
    let { _course_title } = req.params; 
    let findCourse=await course.findOne({title:_course_title}).exec();
    findCourse.students.push(req.user._id);//push user name (by jwt) in it
    await findCourse.save();
    return res.send("註冊完成"); 
  }catch(e){
    return res.status(500).send(e); 
  }
});
router.patch("/edit/:_course_title",async (req,res)=>{
  //auth id
  if (!req.user.isTeacher()) {
    return res
      .status(403)
      .send("只有講師才能更新課程。若你已經是講師，請透過講師帳號登入。");
  }
  //ensure course exist
  let {_course_title}=req.params;
  let find=await course.findOne({title:_course_title});
  // console.log(find);
  if(!find){
    return res
      .status(404)
      .send("沒有這門課喔");
  }
  
  //update
  try{
    //check teacher match course
    if(find.teacher.equals(req.user._id)){
      let update=await course.findOneAndUpdate(
      {title:_course_title},
      req.body,
      {
        new:true,//return new update
        runValidators: true,
      });
      // console.log(update);
      return res.send({
        message: "課程已經被更新成功",
        update,
      });
    }else{
      return res
      .status(403)
      .send("你不是這個課的老師喔");
    }
  }
  catch(e){
      res.status(500).send(e);
  }
  });
router.delete("/delete/:_course_title", async (req, res) => {
  if (!req.user.isTeacher()) {
    return res
      .status(403)
      .send("只有講師才能更新課程。若你已經是講師，請透過講師帳號登入。");
  }
  //ensure course exist
  let {_course_title}=req.params;
  let find=await course.findOne({title:_course_title});
  
  if(!find){
    return res
      .status(404)
      .send("沒有這門課喔");
  }
  
  //update
  try{
    //check teacher match course
    if(find.teacher.equals(req.user._id)){
      let update=await course.deleteOne({title:_course_title}).exec();
      return res.send({
        message: "課程已經被刪除成功",
        update,
      });
    }else{
      return res
      .status(403)
      .send("你不是這個課的老師喔");
    }
  }
  catch(e){
      res.status(500).send(e);
  }
});
module.exports=router;
