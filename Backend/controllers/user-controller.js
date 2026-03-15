const joi = require("joi");
const josonwebtoken = require("jsonwebtoken");
const bycrypt = require("bcryptjs");
const User = require("../models/User");

const registerUser = async (req, res) => {

    try {
        const { username, email, password } = req.body;

        //check if user already exists
        const curUser = await User.findOne({ email });

        if (curUser) {
            return res.status(400).json({
                success: false,
                message: "User Already exists ",
            })
        }

        const newUser = await User.create({
            email,
            username,
            password
        })

        if(!newUser){
            return res.status(400).json({
                success: false,
                message: "Error While registering the user " + e,
            })
        }

        return res.status(200).json({
            success: true,
            message: "User Registered Successfully",
            data: newUser
        })
        
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message:"Internal Server Error Occured! :( ",
        })
    }
}