const User = require('../models/User');
const bcrypt = require('bcrypt');
const { cleanExpiredSubscriptions } = require('../utils/subscription');
// const jwt = require('jsonwebtoken');

// Obtain all users
exports.getData = async (req, res) => {
    try {
        let users = await User.find();

        const updatedUsers = await Promise.all(users.map(async (user) => {
            const updated = cleanExpiredSubscriptions(user);
            return updated.save();
        }));

        res.json(updatedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos de los usuarios', message: error.message });
    }
};

// Obtain one user by id
exports.getOne = async (req, res) => {
    try {
        const { id } = req.params;
        let user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        user = cleanExpiredSubscriptions(user);
        await user.save();

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos del usuario', message: error.message });
    }
};

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, registration, balance } = req.body;
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
            registration: {
                gym: {
                  isActive: registration?.gym.isActive || null,
                  initDate: registration?.gym.initDate || null,
                  endDate: registration?.gym.endDate || null,
                },
                athletics: {
                  isActive: registration?.athletics.isActive || null,
                  initDate: registration?.athletics.initDate || null,
                  endDate: registration?.athletics.endDate || null,
                },
            },
            subscription: {
                gym: {
                  isActive: registration?.gym.isActive || null,
                  initDate: registration?.gym.initDate || null,
                  endDate: registration?.gym.endDate || null,
                },
                athletics: {
                  isActive: registration?.athletics.isActive || null,
                  initDate: registration?.athletics.initDate || null,
                  endDate: registration?.athletics.endDate || null,
                },
            },
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
        let user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        user = cleanExpiredSubscriptions(user);
        await user.save();

        // TODO: const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                subscription: user.subscription,
                registration: user.registration,
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
            return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ ok: false, message: "Contraseña actual incorrecta" });
        }

        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, 10);
        }

        if (name) {
            user.name = name;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            ok: true,
            message: "Perfil actualizado correctamente",
            user: updatedUser
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "Error al actualizar el perfil", error: error.message });
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

