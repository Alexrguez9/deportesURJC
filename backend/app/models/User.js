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
    estado_alta: {
      gimnasio: {
        type: Boolean,
        default: false  // Falso hasta que el usuario se de de alta
      },
      atletismo: {
        type: Boolean,
        default: false  // Falso hasta que el usuario se de de alta
      }
     
    },
    abono_renovado: {
      fecha_inicio: {
        type: Date,
        required: false  // Opcional o hacer obligatorio
      },
      fecha_fin: {
        type: Date,
        required: false  // Opcional o hacer obligatorio
      }
    }
  },
  {
    versionKey: false,
    timestamps: true // Crea automáticamente los campos 'createdAt' y 'updatedAt' en BBDD
  }
);

const User = mongoose.model('users', UserSchema);

module.exports = User;
