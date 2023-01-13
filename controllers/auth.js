import User from "../models/user";
import  jwt  from "jsonwebtoken";

export const register = async (req,res)=>{
   // console.log(req.body);
    const {name,email,password} = req.body;

    //validation
    if(!name) return res.status(400).send('Name is required');
    if(!password || password.length < 6) return res
    .status(400)
    .send('Password is required and should me atleast 6 characters long');

    let userExist = await User.findOne({email}).exec()
    if(userExist) return res.status(400).send('Email is already taken');

    //register
    const user = new User(req.body)
    try {
        await user.save();
        return res.json({ok: true})
    } catch (err) {
        console.log("Create User failed", err)
        return res.status(400).send('Error, Try again')
    }
}

export const login = async (req,res)=>{

    const {email,password} = req.body;

   try {
    let user = await User.findOne({email}).exec();
    if(!user) return res.status(400).send("Incorrect email or password")
    
    //compare password
    user.comparePassword(password,(err,match)=>{
        if(!match || err) return res.status(400).send("Incorrect email or password")

        //GENERATE A TOKEN
       let token = jwt.sign({_id: user._id},process.env.JWT_SECRETE,{expiresIn:'7d'})

       res.status(200).json({
        token,
        user:{
            _id:user._id,
            name:user.name,
            email:user.email,
            createdAt: user.createdAt,
            updatedAt:user.updatedAt,
            stripe_account_id: user.stripe_account_id,
            stripe_seller:user.stripe_seller,
            stripeSession:user.stripeSession
        }
       })
    })
    
   } catch (err) {
    console.log("Login Error",err)
    res.status(400).send("SignIn failed");
   }
}