module.exports = function (app, gestorBD) {
    app.post("/api/autenticar", function(req, res) {
       let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
           .update(req.body.password).digest('hex');

        let criterio = {
            email : req.body.email,
            password : seguro
        }
       gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if ( usuarios == null || usuarios.length == 0){
                res.status(401); // unauthorized
                res.json({
                    autenticado: false,
                    mensaje: "Error al iniciar de seión"
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
    app.get("/api/amigos", function (req, res) {
        if (req.headers['token']) {
            let criterio = {};
            if( req.query.busqueda != null){
                criterio = {
                    aceptada: true,
                    $or: [ {remitente: {$ne: res.usuario}},
                        {emisor: {$ne: res.usuario}}
                    ],
                    $and: [
                        {remitente : {$regex : ".*"+req.query.busqueda+".*"}}
                        ]
                };
            } else {
                criterio = {
                       $or: [
                        {remitente: {$ne: res.usuario}},
                        {emisor: {$ne: res.usuario}}
                    ],
                    aceptada: true
                };
            }
            let logeado = res.usuario;
            gestorBD.obtenerPeticionesDeAmistad(criterio,function (amistades) {
                if (amistades == null) {
                    app.get("logger").error("Se ha producido un error al obtener los amigos de la API");
                    res.status(500);
                    res.json({
                        error: "Se ha producido un error al obtener los amigos de la API"
                    })
                } else {
                    app.get("logger").info("Los amigos se listaron correctamente de la API");
                    res.status(200);
                    res.logeado = logeado;
                    let amigos = [];
                    for(i = 0; i < amistades.length ; i++){
                        // Para cada peticion obtener el usuario distinto al logueado
                        let amigo = amistades[i].remitente;
                        if( amigo === logeado){
                            amigo = amistades[i].emisor;
                        }
                        amigos[i]=amigo;
                    }
                    res.send(JSON.stringify(amigos));
                }
            });
        }
    });
    app.post("/api/mensaje/:destino", function (req, res) {
        if (req.token) {
            let mensaje = {
                emisor: req.session.usuario,
                destino: req.params.destino,
                texto: req.body.texto,
                fecha: req.body.fecha,
                leido: false
            };
            gestorBD.insertarOferta(oferta, function (id) {
                if (id == null) {
                    app.get("logger").error("Error al crear mensaje en la API");
                    res.status(500);
                    res.json({
                        error: "se ha producido un error"
                    })
                } else {
                    app.get("logger").info("El mensaje se creó correctamente en la API");
                    res.status(201);
                    res.json({
                        mensaje: "Mensaje creado",
                        _id: id
                    })
                }
            });
        }
    });
    app.get("/api/mensajes/:id", function (req, res) {
        let criterioMongo = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerConversacion(criterioMongo, function (conversaciones) {
            if (conversaciones == null || conversaciones.length === 0) {
                app.get("logger").error("Error al obtener mensajes de conversación de la API");
                res.status(500);
                res.json({
                    error: "Error al obtener mensajes de conversación de la API"
                })
            } else {
                let conversacion = conversaciones[0];
                let criterio = {
                    conversacion: gestorBD.mongo.ObjectID(conversacion._id)
                };
                gestorBD.obtenerMensajes(criterio, function (mensajes) {
                    if (mensajes == null) {
                        app.get("logger").error("Error al obtener los mensajes de la API");
                        res.status(500);
                        res.json({
                            error: "Error al obtener los mensajes (API)"
                        })
                    } else {
                        app.get("logger").info("Se han obtenido correctamente los mensajes de la API");
                        res.status(200);
                        res.send(JSON.stringify(mensajes));
                    }
                });
            }
        });
    });
}