const User = require('../models/user');
//const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// Obtener data de users
exports.getData = async (req, res) => {
    try {
        const userData = await User.find();
        res.json(userData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos de los usuarios', message: error.message });
    }
};

// Registrar un nuevo usuario
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password,
            estado_alta: false,
            abono_renovado: false
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar usuario', message: error.message });
    }
};

// Iniciar sesión
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // const isMatch = await bcrypt.compare(password, user.password);
        const isMatch = password === user.password;

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        //const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({
            message: 'Inicio de sesión exitoso',
            user: {
                name: user.name,
                email: user.email,
                estado_alta: user.estado_alta,
                abono_renovado: user.abono_renovado,
                //token
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión', message: error.message });
    }
};

// Cerrar sesión
exports.logout = async (req, res) => {
    try {
        req.session.destroy();
        res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cerrar sesión', message: error.message });
    }
};

// Editar un usuario
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        if (body.password) {
            // body.password = await bcrypt.hash(body.password, 10);
        }

        const updatedUser = await User.updateOne({ _id: id }, { $set: body });

        if (updatedUser.matchedCount === 0) {
            res.status(404).json({ message: 'No se encontró el usuario para actualizar' });
        } else {
            res.json({ message: 'Usuario actualizado exitosamente', updatedUser });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar datos', message: error.message });
    }
};

// Eliminar un usuario
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
