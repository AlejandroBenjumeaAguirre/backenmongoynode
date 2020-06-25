var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


//===========================================
// Busqueda especifica
//===========================================

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var coleccion = req.params.tabla;
    var regexp = new RegExp( busqueda, 'i');

    var promesa;

    switch( coleccion ){
        case 'usuario':
            promesa = buscarUsuario(busqueda, regexp);
            break;
        case 'medico':
            promesa = buscarMedico(busqueda, regexp);
            break;
        case 'hospital':
            promesa = buscarHospital(busqueda, regexp);
            break;
        default: 
            return res.status(400).json({
                ok: false,
                mensaje: 'La coleccion que esta tratando de buscar no existe',
                error: { message: 'La coleccion que esta intentando buscar no existe'}
            });
    }

    promesa.then(data =>{
        res.status(200).json({
            ok:true,
            [coleccion]: data
        });
    });

});

//===========================================
// Busqueda general
//===========================================

app.get('/todo/:busqueda', (req, res, next) =>{

    var busqueda = req.params.busqueda;
    var regexp = new RegExp( busqueda, 'i');

    Promise.all( [
        buscarHospital( busqueda, regexp ), 
        buscarMedico( busqueda, regexp ),
        buscarUsuario( busqueda, regexp)
    ])
    .then( respuestas =>{

        res.status(200).json({
            ok:true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });

    });

});

function buscarHospital( busqueda, regexp){

    return new Promise( (resolve, reject) =>{

        Hospital.find({ nombre: regexp}, 'nombre img')
            .populate( 'usuario', 'nombre apellido correo')
            .exec( (err, hospitales)=>{

            if (err) {
                reject('Error al cargar los hospitales'+err);
            } else {
                resolve(hospitales);
            }
    
        });
    });

}

function buscarMedico( busqueda, regexp){

    return new Promise( (resolve, reject) =>{

        Medico.find({ nombre: regexp}, 'nombre img')
            .populate( 'hospital', 'nombre')
            .populate( 'usuario', 'nombre apellido correo')
            .exec( (err, medicos)=>{

            if (err) {
                reject('Error al cargar los medicos'+err);
            } else {
                resolve(medicos);
            }
    
        });
    });

}

function buscarUsuario( busqueda, regexp){

    return new Promise( (resolve, reject) =>{

        Usuario.find({}, 'nombre apellido correo rol img')
            .or( [{ 'nombre': regexp }, {'apellido': regexp}, {'correo': regexp }] )
            .exec( (err, usuarios) =>{
                if (err) {
                    reject('Error al cargar los usuarios'+err);
                } else {
                    resolve(usuarios);
                }
            });
    });

}



module.exports = app;