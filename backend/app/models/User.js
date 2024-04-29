//model-user.js
const mongoose = require('mongoose');

// Creamos Schema de moongose
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

const User = mongoose.model('users', UserSchema);

module.exports = User;
