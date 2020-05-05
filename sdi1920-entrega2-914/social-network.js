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

//Enlaces que requeriran routerUsuarioSession
//Ejemplo
//app.use("/mensaje/agregar",routerUsuarioSession);




app.use(express.static('public'));

//Variables
redsocial.set('port', 8081);
redsocial.set('db','mongodb://admin:sdi@tiendamusica-shard-00-00-uwber.mongodb.net:27017,tiendamusica-shard-00-01-uwber.mongodb.net:27017,tiendamusica-shard-00-02-uwber.mongodb.net:27017/test?ssl=true&replicaSet=tiendamusica-shard-0&authSource=admin&retryWrites=true&w=majority');
redsocial.set('clave','abcdefg');
redsocial.set('crypto',crypto);

// Rutas/controladores por lógica
require("./routes/rusuarios.js")(redsocial);


//Mensaje de error
redsocial.use(function (err, req, res, next) {
    console.log("Error producido: "+err);//Mostramos el error en la consola

    if(! res.headersSent){
        res.status(400);
        res.send("Recurso no disponible");
    }
});


// Lanzar el servidor
redsocial.listen(redsocial.get('port'), function () {
    console.log("Servidor activo");
})

//Lanzar servidor 2
/**
https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
    console.log("Servidor activo");
});
 */