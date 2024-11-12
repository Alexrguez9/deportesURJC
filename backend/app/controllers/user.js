const User = require('../models/User');
const bcrypt = require('bcrypt');
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

// Obtener un usuario por su id
exports.getOne = async (req, res) => {
    try {
        console.log('-----req.params', req.params);
        const { id } = req.params;
        console.log('---id:', id);
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los datos del usuario', message: error.message });
    }
};

// Registrar un nuevo usuario
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            alta: {
                gimnasio: {
                  estado: false, // Valor inicial para gimnasio: no dado de alta
                  fechaInicio: null, // Fecha de inicio inicial: null
                  fechaFin: null, // Fecha de fin inicial: null
                },
                atletismo: {
                  estado: false, // Valor inicial para atletismo: no dado de alta
                  fechaInicio: null, // Fecha de inicio inicial: null
                  fechaFin: null, // Fecha de fin inicial: null
                },
            },
            abono_renovado: false,
            saldo: 0,
            role,
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser); // aquí, incluimos el _id
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar usuario', message: error.message });
    }
};

// Iniciar sesión
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
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
                saldo: user.saldo,
                role: user.role,
                //token
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

// Actualizar un usuario
exports.updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        if (body.password) {
            body.password = await bcrypt.hash(body.password, 10);
        }

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
