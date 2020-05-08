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
    app.get("/api/amigos/", function (req, res) {
        if (req.body.token) {
            let criterio = {
                $or:[{remitente: req.session.usuario.email},
                    {emisor :  req.session.usuario.email}],
                aceptada: true
            };
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
                    res.send(JSON.stringify(amistades));
                }
            });
        }
    });
    app.post("/api/mensaje/:destino", function (req, res) {
        if (req.token) {
            let mensaje = {
                emisor: req.session.usuario,
                destino:gestorBD.mongo.ObjectID(req.params.destino_id),
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