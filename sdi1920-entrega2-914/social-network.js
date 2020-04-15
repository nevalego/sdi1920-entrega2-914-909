// Módulos
let express = require('express');
let redsocial = express();

redsocial.set('port', 8081);

// Rutas/controladores por lógica
require("./routes/rusuarios.js")(redsocial);


// Lanzar el servidor
redsocial.listen(redsocial.get('port'), function () {
    console.log("Servidor activo");
})