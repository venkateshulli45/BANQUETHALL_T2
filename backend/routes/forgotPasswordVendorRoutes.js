import express from "express";
import { resetPassword, sendOTP, verifyOTP } from "../controllers/forgotPasswordControllerVendor.js";


const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.put("/resetPassword", resetPassword)

export default router;
