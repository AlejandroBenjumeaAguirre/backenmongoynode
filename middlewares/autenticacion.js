var jwt = require('jsonwebtoken');


var SEED = require('../config/config').SEED;



//===========================================
// verificar token
//===========================================

exports.verificarToken = function( req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded ) =>{

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto'+ token,
                errors: err
            });
        }

        req.usuario = decoded.usuario;
        
        next();

    });

};

//===========================================
// Verifica ADMIN
//===========================================

exports.verificarADMIN_ROL = function( req, res, next) {

    var usuario = req.usuario;

    if ( usuario.rol === 'ROL_ADMIN' ){
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: { message: 'No es administrador, no puede realizar esta peticion. '}
        });
    }

};

//===========================================
// Verifica ADMIN o mismo usuario
//===========================================

exports.verificarADMIN_ROL_o_mismousuario = function( req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if ( usuario.rol === 'ROL_ADMIN' || usuario._id === id ){
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto',
            errors: { message: 'No es administrador, no puede realizar esta peticion. '}
        });
    }

};