const mongoose = require("mongoose");
const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 128,
  },
  email: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 128,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 1024,
  },
  phoneNo: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
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
    },
    config.get("jwtPrivateKey")
  );

  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(128).required(),
    email: Joi.string().min(3).max(128).required().email(),
    password: Joi.string().min(4).max(1024).required(),
    phoneNo: Joi.string().min(3).max(20).required(),
  })

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
