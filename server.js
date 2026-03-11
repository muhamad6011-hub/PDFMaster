const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/userdb");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type:String, unique:true },
    password: String,
    isVerified: { type:Boolean, default:false },
    verificationToken: String
});

const User = mongoose.model("User", userSchema);

// Gmail App Password
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"EMAIL_KAMU@gmail.com",
        pass:"APP_PASSWORD"
    }
});

app.post("/register", async (req,res)=>{
    const { name,email,password } = req.body;

    const hashed = await bcrypt.hash(password,10);
    const token = uuidv4();

    const user = new User({
        name,
        email,
        password: hashed,
        verificationToken: token
    });

    await user.save();

    const link = `http://localhost:3000/verify/${token}`;

    await transporter.sendMail({
        from:"EMAIL_KAMU@gmail.com",
        to:email,
        subject:"Verifikasi Email",
        html:`<h2>Konfirmasi Email</h2>
              <p>Klik link berikut untuk verifikasi:</p>
              <a href="${link}">${link}</a>`
    });

    res.json({message:"Cek Gmail Anda untuk verifikasi!"});
});

app.get("/verify/:token", async (req,res)=>{
    const user = await User.findOne({verificationToken:req.params.token});

    if(!user) return res.send("Token tidak valid!");

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.redirect("/login.html");
});

app.post("/login", async (req,res)=>{
    const { email,password } = req.body;

    const user = await User.findOne({email});
    if(!user) return res.json({success:false,message:"User tidak ditemukan"});

    if(!user.isVerified)
        return res.json({success:false,message:"Email belum diverifikasi"});

    const match = await bcrypt.compare(password,user.password);
    if(!match)
        return res.json({success:false,message:"Password salah"});

    res.json({success:true});
});

app.get("/dashboard",(req,res)=>{
    res.send("Selamat Datang di Database User");
});

app.listen(3000,()=>console.log("Server jalan di http://localhost:3000"));