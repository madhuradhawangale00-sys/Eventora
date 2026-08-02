const User = require('../models/User');
const OTP = require('../models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { sendOtpEmail } = require('../utils/email');

const generateToken = (id, role) => {
    return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn: '7d'});
}

//register user
exports.registerUser = async (req, res) => {
    try {
        console.time("Total Register");

        console.time("Find User");
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        console.timeEnd("Find User");

        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }

        console.time("Hash Password");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.timeEnd("Hash Password");

        console.time("Create User");
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "user",
            isVerified: false,
        });
        console.timeEnd("Create User");

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        console.time("Save OTP");
        await OTP.create({
            email,
            otp,
            action: "account_verification",
        });
        console.timeEnd("Save OTP");

        console.time("Send Email");
        await sendOtpEmail(email, otp, "account_verification");
        console.timeEnd("Send Email");

        console.timeEnd("Total Register");

        return res.status(201).json({
            message: "User registered successfully",
            email: user.email,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

//Login user
exports.loginUser = async (req, res) => {
    const {email, password} = req.body;

    let user = await User.findOne({email});
    if(!user) {
        return res.status(400).json({error: 'Invalid credentials.Please sign Up'});
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).json({error: 'Invalid credentials'});
    }

    if(!user.isVerified && user.role === 'user'){
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTP.deleteMany({email, action: 'account_verification'}); //remove old otps
        await OTP.create({email, otp, action:'account_verification'});
        await sendOtpEmail(email, otp, 'account_verification');
        return res.status(400).json({
            error: 'Account not verified.A new OTP has been sent to your email.'
        });
    }

    res.json({
        message: 'Login successful',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
    })



   
};

//verify otp
exports.verifyOTP = async (req, res) => {
    const {email, otp} = req.body;
    const otpRecord = await OTP.findOne({email, otp, action: 'account_verification'});

    if(!otpRecord){
        return res.status(400).json({error:'Invalid or expired OTP'});
    }

    const user = await User.findOneAndUpdate({email}, {isVerified: true});
    await OTP.deleteMany({email, action:'account_verification'});//remove used otps
    res.json(
        {
            message: 'Account verified successfully. You can now log in.',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        }
    );
};