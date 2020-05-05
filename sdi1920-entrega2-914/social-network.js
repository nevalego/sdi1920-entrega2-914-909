// Módulos
let express = require('express');
let redsocial = express();

var rest = require('request');
redsocial.set('rest', rest);

redsocial.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});

var jwt = require('jsonwebtoken');
redsocial.set('jwt',jwt);

let fs = require('fs');
let https = require('https');

let expressSession = require('express-session');
let crypto = require('crypto');
redsocial.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

let fileUpload = require('express-fileupload');
redsocial.use(fileUpload());
let mongo = require('mongodb');
let swig = require('swig');

let bodyParser = require('body-parser');
redsocial.use(bodyParser.json());
redsocial.use(bodyParser.urlencoded({ extended: true }));

//Uso de tokens por usuario
var routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
    // obtener el token, vía headers (opcionalmente GET y/o POST).
    var token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {
        // verificar el token
        jwt.verify(token, 'secreto', function(err, infoToken) {
            if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
                res.status(403); // Forbidden
                res.json({
                    acceso : false,
                    error: 'Token invalido o caducado'
                });
                // También podríamos comprobar que intoToken.usuario existe
                return;

            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });

    } else {
        res.status(403); // Forbidden
        res.json({
            acceso : false,
            mensaje: 'No hay Token'
        });
    }
});

//Enlaces que requeriran un token de usuario
//...

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(redsocial,mongo);

// Aplicar routerUsuarioToken
// redsocial.use('/api/usuario', routerUsuarioToken);

// routerUsuarioSession
let routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    console.log("routerUsuarioSession");
    if (req.session.usuario) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : " + req.session.destino);
        res.redirect("/identificarse");
    }
});

// Aplicar routerUsuarioSession
redsocial.use("/usuarios",routerUsuarioSession);

//Variables
redsocial.set('port', 8081);
redsocial.set('db', 'mongodb://administrador:redsocial914909@redsocial-shard-00-00-nukgt.mongodb.net:27017,redsocial-shard-00-01-nukgt.mongodb.net:27017,redsocial-shard-00-02-nukgt.mongodb.net:27017/test?ssl=true&replicaSet=redsocial-shard-0&authSource=admin&retryWrites=true&w=majority');
redsocial.set('clave','abcdefg');
redsocial.set('crypto',crypto);

// Rutas/controladores por lógica
require("./routes/rusuarios.js")(redsocial, swig, gestorBD);

redsocial.use(express.static('public'));

redsocial.get('/', function (req, res) {
    res.redirect('/base');
});


//Mensaje de error
redsocial.use(function (err, req, res, next) {
    console.log("Error producido: "+err);//Mostramos el error en la consola

    if(! res.headersSent){
        res.status(400);
        res.send("Recurso no disponible");
    }
});


//Lanzar servidor
https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, redsocial).listen(redsocial.get('port'), function() {
    console.log("Servidor activo");
});
