// Módulos
let express = require('express');
let app = express();

let rest = require('request');
app.set('rest', rest);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});

var jwt = require('jsonwebtoken');
app.set('jwt', jwt);

let fs = require('fs');
let https = require('https');

let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));
let crypto = require('crypto');

//let fileUpload = require('express-fileupload');
//app.use(fileUpload());
let mongo = require('mongodb');
let swig = require('swig');
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// routerUsuarioToken
var routerUsuarioToken = express.Router();
routerUsuarioToken.use(function (req, res, next) {
    // obtener el token, vía headers (opcionalmente GET y/o POST).
    var token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {
        // verificar el token
        jwt.verify(token, 'secreto', function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.tiempo) > 240) {
                res.status(403);
                // Forbidden
                res.json({acceso: false, error: 'Token invalido o caducado'});
                // También podríamos comprobar que intoToken.usuario existe
                return;
            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });
    } else {
        res.status(403);
        // Forbidden
        res.json({acceso: false, mensaje: 'No hay Token'});
    }
});

let gestorDB = require("./modules/gestorDB.js");
gestorDB.init(app, mongo);

// Logger
let log4js = require('log4js');
log4js.configure({
    appenders: {redsocial: {type: 'file', filename: 'logs/redsocial.log' }},
    categories: {default: {appenders: ['redsocial'], level: 'trace'}}
});

let logger = log4js.getLogger('redsocial');

// Aplicar routerUsuarioToken
app.use('/api/usuarios', routerUsuarioToken);


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

//Aplicar routerUsuarioSession
app.use("/usuarios", routerUsuarioSession);
app.use("/tienda", routerUsuarioSession);
app.use("/usuario/amistad/:email", routerUsuarioSession);
app.use("/usuario/amistad", routerUsuarioSession);
app.use("/usuario/amigos", routerUsuarioSession);
app.use("/usuario/amistad/aceptar/:id", routerUsuarioSession);

// Variables
app.set('port', 8081);
//app.set('db', 'mongodb://administrador:redsocial914909@redsocial-shard-00-00-uwber.mongodb.net:27017,redsocial-shard-00-01-uwber.mongodb.net:27017,redsocial-shard-00-02-uwber.mongodb.net:27017/test?ssl=true&replicaSet=redsocial-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('db', 'mongodb://administrador:redsocial914909@redsocial-shard-00-00-nukgt.mongodb.net:27017,redsocial-shard-00-01-nukgt.mongodb.net:27017,redsocial-shard-00-02-nukgt.mongodb.net:27017/test?ssl=true&replicaSet=redsocial-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave', 'abcdefg');
app.set('crypto', crypto);
app.set('logger', logger);

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorDB); // (app, param1, param2, etc.)


app.use(express.static('public'));

app.get('/', function (req, res) {
    res.usuario = req.session.usuario;
    res.redirect('/tienda');
})

app.use(function (err, req, res, next) {
    console.log("Error producido: " + err);
    if (!res.headersSent) {
        res.status(400);
        let respuesta = swig.renderFile('views/error.html',
            {
                mensaje: "Recurso no disponible"
            });
        res.send(respuesta);
    }
})

// lanzar el servidor
https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function () {
    console.log("Servidor activo");
});