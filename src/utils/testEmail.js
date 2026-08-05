import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
});


transporter.sendMail({
    from:process.env.EMAIL_USER,
    to:"your-second-email@gmail.com",
    subject:"Testing ConvoSphere",
    text:"SMTP working"
})
.then(()=>{
    console.log("Mail sent");
})
.catch((err)=>{
    console.log(err);
});