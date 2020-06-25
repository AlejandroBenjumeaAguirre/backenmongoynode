var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();


var Hospital = require('../models/hospital');

//===========================================
// Consultar los hospitales
//===========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;

    desde = Number(desde);

    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre correo')
        .exec(
            (err, hospitales ) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando los hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al realizar el conteo de los hospitales',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            });
});

//===========================================
// Todos los hospitales
//===========================================

app.get('/todos', (req, res, next) => {

    Hospital.find({})
            .exec(
                (err, hospitales ) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando los hospitales',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok:true,
                        hospitales: hospitales
                    });

                });

});

//===========================================
// Buscar hospital por id
//===========================================

app.get('/:id', (req, res) =>{

    var id = req.params.id;

    Hospital.findById(id)
        .populate( 'usuario', 'nombre img correo')
        .exec( (err, hospital) => {

            if(err){
                return res.status(500).json({
                    ok: false,
                    mesnaje: 'Fallo busqueda por id',
                    errors: err
                });
            }

            if (!hospital){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con id ' + id + 'No existe',
                    errors: { message: 'No existe un hospital con ese ID'}
                });
            }

            res.status(200).json({
                ok:true,
                hospital: hospital,
            });
        });
});

//===========================================
// Actualizar Hospital
//===========================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;

    Hospital.findById( id, (err, hospital) =>{
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: err
            });
        }

        if(!hospital){
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con id ' + id + ' no existe',
                errors: { message: 'No existe hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error guardando el Hospital',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                mensaje: 'El hospital se guardo satisfactoriamente',
                hospital: hospitalGuardado,
            });
        });
    });
});

//===========================================
// Crear Hospitales
//===========================================

app.post('/', mdAutenticacion.verificarToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({

        nombre: body.nombre,
        usuario: req.usuario._id

    });

    hospital.save( (err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error guardando el Hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'El hospital se guardo satisfactoriamente',
            hospital: hospitalGuardado,
        });


    });
});

//===========================================
// Eliminar Hospital
//===========================================

app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove( id, (err, hospitalEliminado) =>{
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalEliminado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con ese id' + id,
                errors: { message: 'El hospital no existe con ese id'+ id}
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalEliminado,
        });
    });

});

module.exports = app;