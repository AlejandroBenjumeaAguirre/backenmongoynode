// Requires

var express = require('express');
var mongose = require('mongoose');
var bodyParser = require('body-parser');

var cors = require('cors');

// Inicializar variables

var app = express();

// CORS
const corsOptions = {
    origin: 'http://localhost:4200', // Aquí va el origen, puede ser un arreglo
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use( cors( corsOptions ) );

// Body parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Importar rutas

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');
var loginRoutes = require('./routes/login');


// Coneccion a la base de datos

mongose.connection.openUri('mongodb://localhost:27017/hospitaldB', (err, res) =>{

    if ( err ) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m','online');
});

// Rutas

app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m','online');
});