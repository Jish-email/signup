import { AsyncHandler } from "../utils/Asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/users.model.js";
import nodemailer from "nodemailer";


const generateTokens = async (user_id) => {

    const user = await User.findById(user_id);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save();

    return { accessToken, refreshToken };
}


const sendMail = async (email, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject,
        text,
    };

    return await transporter.sendMail(mailOptions);
};

const signup = AsyncHandler(async (req, res) => {
    const { Firstname, lastname, email, password } = req.body;

    console.log(Firstname, lastname, email, password);
    

    if (!Firstname || !lastname || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const OTP_EXPIRY_TIME = 50 * 60 * 1000;
    const otpExpiry = Date.now() + OTP_EXPIRY_TIME;

    await sendMail(email, 'Your OTP for Verification', `Your OTP is ${otp}`);

    const newUser = new User({ Firstname, lastname, email, password, otp, otpExpiry });
    await newUser.save();

    res.status(201).json(
        new ApiResponse(201, "User created successfully", { newUser })
    );
});

const verifyOtp = AsyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    console.log(email, otp);
    

    try {
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: 'User not found!' });


        // Check OTP and expiry
        if (user.otp === otp ) {
            return res.status(400).json({ message: 'Invalid or expired OTP!' });       
        }

        user.isVerified = true;
        user.otp = null; // Clear the OTP
        user.otpExpiry = null;
        await user.save();

        res.status(200).json({ message: 'User verified successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP!', error });
    }
});



const loginuser = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Y_id and Password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(400, "Invalid credentials");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: {
            user: loggedInUser,
            accessToken,
            refreshToken,
        },
    });
});


const logoutuser = AsyncHandler(async (req, res) => {
    const user_id = req.user._id;


    await User.findByIdAndUpdate(
        user_id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    return res
        .status(200)
        .json({ message: "User logged out successfully" });
});



const changepassword = AsyncHandler(async (req, res) => {

    const user_id = req.user._id;
    const { oldpassword, newpassword, confirmpassword } = req.body;

    if (!(newpassword === confirmpassword)) {
        throw new ApiError(400, "Password and Confirm Password should be same");
    }
    console.log(oldpassword, newpassword, confirmpassword);

    const user = await User.findById(user_id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Old Password incorrect");
    }

    user.password = newpassword;
    await user.save();

    res.status(200).json(
        new ApiResponse(200, "Password changed successfully")
    );
});




export { signup, loginuser, logoutuser, changepassword, verifyOtp };
