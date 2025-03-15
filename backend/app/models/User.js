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
          default: false  // Falso hasta que el usuario se de de alta
        },
        fechaInicio: {
          type: Date,
          required: false  // Opcional o hacer obligatorio
        },
        fechaFin: {
          type: Date,
          required: false  // Opcional o hacer obligatorio
        }
      },
      atletismo: {
        estado: {
          type: Boolean,
          default: false  // Falso hasta que el usuario se de de alta
        },
        fechaInicio: {
          type: Date,
          required: false  // Opcional o hacer obligatorio
        },
        fechaFin: {
          type: Date,
          required: false  // Opcional o hacer obligatorio
        }
      },
     
    },
    abono_renovado: {
      fechaInicio: {
        type: Date,
        required: false  // Opcional o hacer obligatorio
      },
      fechaFin: {
        type: Date,
        required: false  // Opcional o hacer obligatorio
      }
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
    timestamps: true // Crea automáticamente los campos 'createdAt' y 'updatedAt' en BBDD
  }
);

const User = mongoose.model('users', UserSchema);

module.exports = User;
