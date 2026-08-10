import dotenv from "dotenv";
import dns from "dns";
dns.setDefaultResultOrder('ipv4first');
dotenv.config();

import { sendEmail } from "./sendEmail.js";

async function runTest() {
    try {
        console.log("Starting SMTP test...");
        await sendEmail({
            to: "babuvikas246@gmail.com",
            subject: "SMTP Test from Backend",
            html: "<h1>It works!</h1>"
        });
        console.log("Mail sent successfully!");
    } catch (err) {
        console.error("Test failed:", err);
    }
}

runTest();