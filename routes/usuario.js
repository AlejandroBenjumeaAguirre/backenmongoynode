var express = require('express');
var bcrypt = require('bcryptjs');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');


// ==========================================
// Obtener todos los usuarios
// ==========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;

    desde = Number(desde);

    Usuario.find({}, 'nombre apellido correo img rol')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }

                Usuario.count({}, (err, conteo)=>{

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al ejecutar el conteo de los usuarios',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });

                });
                



            });
});


// ==========================================
// Actualizar usuario
// ==========================================

app.put('/:id', mdAutenticacion.verificarToken, (req, res) =>{

    var id = req.params.id;

    var body = req.body;

    Usuario.findById( id, (err, usuario ) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con id ' + id + ' no existe',
                    errors: { message: 'No existe usuario con ese ID' }
                });
        }

        usuario.nombre = body.nombre;
        usuario.apellido = body.apellido;
        usuario.correo = body.correo;
        usuario.rol = body.rol;

        usuario.save( (err, usuarioGuardado ) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = 'XXXX';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: req.usuario
            });
        });
    });
});

// ==========================================
// Crear un nuevo usuario
// ==========================================

app.post('/', mdAutenticacion.verificarToken, (req,res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        apellido: body.apellido,
        correo: body.correo,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        rol: body.rol
    });

    usuario.save( (err, usuarioGuardado ) =>{

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

    

});

//===========================================
// Borrar usuario
//===========================================

app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove( id, ( err, usuarioBorrado ) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese id' + id,
                errors: { message: 'El uisuario no existe con ese id'+ id}
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioToken: req.usuario
        });

    });
});



module.exports = app;