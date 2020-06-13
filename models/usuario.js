
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var rolesValidos = {
    values: ['ROL_ADMIN', 'ROL_USER'],
    message: '{VALUE} no es un rol valido'
};

var Schema = mongoose.Schema;

var usuarioSchema = new Schema({

    nombre: { type: String, required: [true, 'El nombre es requerido']},
    apellido: { type: String, required: [true, 'El apellido es requerido']},
    correo: { type: String, unique: true, required: [true, 'El correo es obligatorio'] },
    password: { type: String, required: [true, 'La contraseña es obligatoria'] },
    img: { type: String, required: false},
    rol: { type: String, required: true, default: 'ROL_USER', enum: rolesValidos }

});

usuarioSchema.plugin( uniqueValidator, { message:'El {PATH} debe de ser unico' });

module.exports = mongoose.model('Usuario', usuarioSchema);