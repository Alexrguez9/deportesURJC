const mongoose = require('mongoose');

// Esquema de Usuario
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
    },
    // TODO: Encriptar la contraseña con tokens y bcrypt
    password: {
      type: String,
      required: true
    },
    alta: {
      gimnasio: {
        estado: {
          type: Boolean,
          default: false
        },
        fechaInicio: {
          type: Date,
          required: false
        },
        fechaFin: {
          type: Date,
          required: false 
        }
      },
      atletismo: {
        estado: {
          type: Boolean,
          default: false
        },
        fechaInicio: {
          type: Date,
          required: false
        },
        fechaFin: {
          type: Date,
          required: false
        }
      },
     
    },
    subscription: {
      gimnasio: {
        estado: {
          type: Boolean,
          default: false
        },
        fechaInicio: {
          type: Date,
          required: false
        },
        fechaFin: {
          type: Date,
          required: false
        },
      },
      atletismo: {
        estado: {
          type: Boolean,
          default: false
        },
        fechaInicio: {
          type: Date,
          required: false
        },
        fechaFin: {
          type: Date,
          required: false
        }
      },
    },
    balance: {
      type: Number,
      default: 0
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
  },
  {
    versionKey: false,
    timestamps: true // Create automatically the fields createdAt and updatedAt in BBDD
  }
);

const User = mongoose.model('users', UserSchema);

module.exports = User;
