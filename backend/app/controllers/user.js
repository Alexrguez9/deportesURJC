const User = require('../models/User');
const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// Obtain all users
exports.getData = async (req, res) => {
    try {
        const userData = await User.find();
        res.json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos de los usuarios', message: error.message });
    }
};

// Obtain one user by id
exports.getOne = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos del usuario', message: error.message });
    }
};

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, alta, balance } = req.body;
        // Verificar si el correo ya está registrado
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'El correo ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            alta: {
                gimnasio: {
                  estado: alta?.gimnasio.estado || null,
                  fechaInicio: alta?.gimnasio.fechaInicio || null,
                  fechaFin: alta?.gimnasio.fechaFin || null,
                },
                atletismo: {
                  estado: alta?.atletismo.estado || null,
                  fechaInicio: alta?.atletismo.fechaInicio || null,
                  fechaFin: alta?.atletismo.fechaFin || null,
                },
            },
            abono_renovado: false,
            balance: balance || 0,
            role: role || 'user',
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar usuario', message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // TODO: const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                estado_alta: user.estado_alta,
                abono_renovado: user.abono_renovado,
                alta: user.alta,
                balance: user.balance,
                role: user.role,
                //token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión', message: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        req.session.destroy();
        res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cerrar sesión', message: error.message });
    }
};

// Update an user
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        const updatedUser = await User.findOneAndUpdate({ _id: id }, { $set: body }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'No se encontró el usuario para actualizar' });
        }
        res.json(updatedUser);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos', message: error.message });
    }
};

exports.updatePasswordAndName = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword, name } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar la contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña actual incorrecta" });
        }

        // Actualizar la contraseña si se proporciona una nueva
        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, 10);
        }
        // Actualizar el nombre si se proporciona
        if (name) {
            user.name = name;
        }
        const updatedUser = await user.save();
        res.json({ message: "Perfil actualizado correctamente", updatedUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el perfil", message: error.message });
    }
};

// Delete an user
exports.deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.deleteOne({ _id: id });

        if (deletedUser.deletedCount === 0) {
            res.status(404).json({ message: 'No se encontró el usuario para eliminar' });
        } else {
            res.json({ message: 'Usuario eliminado exitosamente', deletedUser });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar datos', message: error.message });
    }
};

require("dotenv").config(); // Import dotenv to use environment variables

// Function to verify if email is equal to ADMIN_EMAIL from .env
exports.checkIfAdmin = (req, res) => {
    try {
        const { email } = req.body;
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!email) {
            return res.status(400).json({ error: "Email es requerido" });
        }

        if (!adminEmail) {
            return res.status(500).json({ error: "ADMIN_EMAIL no está configurado en el servidor" });
        }

        const isAdmin = email === adminEmail;

        return res.json({ isAdmin });
    } catch (error) {
        console.error("❌ Error en checkIfAdmin:", error);
        return res.status(500).json({ error: "Error en la verificación de admin", message: error.message });
    }
};

