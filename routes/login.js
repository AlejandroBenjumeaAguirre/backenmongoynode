var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;
var CLIENT_ID = require('../config/config').CLIENT_ID;

var app = express();

var Usuario = require('../models/usuario');

// Google
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


//===========================================
// Autenticacion con Google
//===========================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    /* const userid = payload['sub']; */
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return {
        nombre: payload.given_name,
        apellido: payload.family_name,
        correo: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async(req, res) =>{

    var token = req.body.token;

    var googleUser = await verify( token )
                    .catch( err =>{

                        res.status(403).json({
                            ok: false,
                            mensaje: 'Token no valido'
                        });

                    });

    Usuario.findOne( { correo: googleUser.correo }, (err, usuarioBD)=>{
        
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (usuarioBD){

            if ( usuarioBD.google === false ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su atenticación normal'
                });
            }else {
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    menu: obtenerMenu( usuarioBD.rol )
                });
            }
        } else {
            // El usuario no existe hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.apellido = googleUser.apellido;
            usuario.correo = googleUser.correo;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            usuario.password = 'xxx';

            usuario.save( (err, usuarioCreado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al crear el usuario',
                        errors: err
                    });
                }

                var token = jwt.sign({ usuario: usuarioCreado }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioCreado,
                    token: token,
                    id: usuarioCreado._id,
                    menu: obtenerMenu( usuarioCreado.rol)
                });
            });
        }
    });
});
//===========================================
// Autenticacion normal
//===========================================
app.post('/', (req, res ) => {

    var body = req.body;

    Usuario.findOne({ correo: body.correo }, (err, usuarioBD ) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (!usuarioBD){
            return res.status(400).json({
                ok:false,
                mensaje: 'Usuario o contraseña incorrectas',
                errors: err
            });
        }

        if ( !bcrypt.compareSync( body.password, usuarioBD.password)){
            return res.status(400).json({
                ok:false,
                mensaje: 'Usuario o contraseña incorrectas',
                errors: err
            });
        }

        usuarioBD.password = ':)';

        // Crear token

        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD._id,
            menu: obtenerMenu( usuarioBD.rol)
        });

    });
});

function obtenerMenu( ROLE ){

    var menu = [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard'},
            { titulo: 'Graficas', url: '/graficas1'},
            { titulo: 'ProgressBar', url: '/progress'},
            { titulo: 'Promesas', url: '/promesas'},
            { titulo: 'Rxjs', url: '/rxjs'}
          ]
        },
        {
          titulo: 'Opciones del usuario',
          icono: 'mdi mdi-account-circle',
          submenu: [
            /* { titulo: 'Usuarios', icono: 'mdi mdi-account', url: '/usuarios'}, */
            { titulo: 'Medicos', icono: 'mdi mdi-hospital', url: '/medicos'},
            { titulo: 'Hospitales', icono: 'mdi mdi-hospital-building', url: '/hospitales'}
          ]
        }
      ];
    
      if ( ROLE === 'ROL_ADMIN') {
          menu[1].submenu.unshift( { titulo: 'Usuarios', icono: 'mdi mdi-account', url: '/usuarios'} );
      }

    return menu;

}

module.exports = app;