module.exports = function (app, gestorBD) {
    app.post("/api/autenticar/", function(req, res) {
       let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
           .update(req.body.password).digest('hex');

       let criterio = {
           email : req.body.email,
           name : req.body.name,
           surname : req.body.surname,
           password : seguro
       }

       gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if ( usuarios == null || usuarios.length == 0){
                res.status(401); // unauthorized
                res.json({
                    autenticado: false
                })
                }else {
                var token = app.get('jwt').sign(
                    {usuario: criterio.email ,
                    tiempo: Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado : true,
                    token: token
                })
            }
       });
    });
    app.get("/api/usuarios/", function (req, res) {
        let criterio = {};
        gestorBD.obtenerUsuarios(criterio,function (usuarios) {
            if (usuarios == null) {
                app.get("logger").error("Se ha producido un error al obtener los usuarios de la API");
                res.status(500);
                res.json({
                    error: "Se ha producido un error al obtener los usuarios de la API"
                })
            } else {
                app.get("logger").info("Los usuarios se listaron correctamente de la API");
                res.status(200);
                res.send(JSON.stringify(usuarios));
            }
        });
    });
}