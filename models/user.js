const mongoose = require("mongoose");
const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024,
  },
  phoneNo: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
  },
  experience: {
    type: Number,
    min: 1,
    max: 30,
  },
  userType: {
    type: String,
    enum: ["buyer", "seller"],
    required: true,
  },
  profilePicture: {
    type: String,
    required: true,
  },
  aboutMe: {
    type: String,
    minlength: 2,
    maxlength: 1024,
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      userType: this.userType,
    },
    config.get("jwtPrivateKey")
  );

  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(8).max(1024).required(),
    // password: Joi.string()
    //   .regex(/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8}$/)
    //   .required()
    //   .messages({
    //     "string.pattern.base": "Password must be atleast 8 characters long and alphanumeic",
    //   }),
    phoneNo: Joi.string().min(3).max(20).required(),
    experience: Joi.number().integer().min(1).max(30),
    userType: Joi.string().valid("buyer", "seller").required(),
    profilePicture: Joi.string().required(),
  };

  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
