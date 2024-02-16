const router=require("express").Router();//() 
const registerValidation = require("../validations").registerValidation;
const loginValidation = require("../validations").loginValidation;
const User=require("../model").user;
const jwt=require("jsonwebtoken");

router.use((req,res,next)=>{
    console.log("on recvieing request from auth");
    next();
});

router.get("/testapi", (req,res)=>{
    return res.send("success conn");
});
// router.post("/register",(req,res)=>{console.log(req.body);});
router.post("/register", async (req, res) => {
    //check post content
    let {error}=registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) return res.status(400).send("此信箱已經被註冊過了。。。");

    let { email, username, password, role } = req.body; //assign
    let newUser=new User({email, username, password, role});

    try {
        let savedUser = await newUser.save();//check data if encrypt
        return res.send({
          msg: "使用者成功儲存。",
          savedUser,
        });
      } catch (e) {
        return res.status(500).send("無法儲存使用者。。。");
      }
});
router.post("/login",async (req, res) => {
  //check post content
  let {error}=loginValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message);
  //check vaild
  const findUser = await User.findOne({ email: req.body.email });
  if (! findUser) return res.status(401).send("使用者不存在");
  //check pwd
  findUser.Auth(req.body.password,(err,isMatch)=>{
    if (err) return res.status(500).send(err);
    
    if (isMatch){
      // make json web token
      const tokenObject = { _id: findUser._id, email: findUser.email };
      const token=jwt.sign(tokenObject,process.env.PASSPORT_SECRET);
      return res.send( {
        msg:"成功登入",
        token:"JWT " + token,
        user:findUser
      });
    }else{
      res.status(401).send("密碼錯誤")
    }
  })
 
});

module.exports=router;
