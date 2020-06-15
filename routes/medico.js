var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');


//===========================================
// Consultar todos los medicos
//===========================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;

    desde = Number(desde);

    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre correo')
    .populate('hospital', 'nombre')
    .exec(
        (err, medicos ) =>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando los Medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) =>{

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al realizar el conteo de los Medicos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });

        });
});

//===========================================
// Actualizar Medico
//===========================================

app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;

    Medico.findById( id, (err, medico) =>{
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }

        if(!medico){
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( (err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error guardando el medico',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                mensaje: 'El medico se guardo satisfactoriamente',
                medico: medicoGuardado,
            });
        });
    });
});

//===========================================
// Crear Medico
//===========================================

app.post('/', mdAutenticacion.verificarToken, (req, res) =>{

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (err, medicoGuardado) => {

        if (err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar el Medico',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Medico creado satisfactoriamente',
            medico: medicoGuardado,
        });
    });

});

//===========================================
// Eliminar Medico
//===========================================

app.delete('/:id', mdAutenticacion.verificarToken, (req, res) =>{

    var id = req.params.id;

    Medico.findByIdAndRemove( id, (err, medicoEliminado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoEliminado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id' + id,
                errors: { message: 'El medico no existe con ese id'+ id}
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoEliminado,
        });

    });

});


module.exports = app;