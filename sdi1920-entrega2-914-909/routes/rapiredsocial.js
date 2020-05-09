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
            let criterio = {
                $or:[
                    {remitente: {$ne: res.usuario}},
                    {emisor :  {$ne: res.usuario}}
                    ],
                aceptada: true
            };
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
                    res.send(JSON.stringify(amistades));
                }
            });
        }
    });
    app.post("/api/mensaje/:destino", function (req, res) {
        if (req.token) {
            let criterio = {
                $or: [{
                    emisor: req.session.usuario.email,
                    remitente: req.params.destino
                },
                    {
                        emisor: req.params.destino,
                        remitente: req.session.usuario.email
                    }
                ],
                aceptada: true
            }
            //Se comprueba primero si los usuarios son amigos
            gestorBD.obtenerPeticionesDeAmistad(criterio,function (amistad){
                if (amistad == null || amistad.length == 0) {
                    app.get("logger").error("Los usuarios no son amigos actualmente");
                    res.status(403);
                    res.json({
                        error: "Los usuarios no son amigos actualmente"
                    })
                } else {
                    let mensaje = {
                        emisor: req.session.usuario.email,
                        destino: req.params.destino,
                        texto: req.body.texto,
                        fecha: new Date(),
                        leido: false
                    };

                    gestorBD.insertarMensaje(mensaje, function (id) {
                        if (id == null) {
                            app.get("logger").error("Error al crear mensaje en la API");
                            res.status(500);
                            res.json({
                                error: "Error al crear mensaje en la API"
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
        }
    });

    //Ejercicio AS4 Marcar mensaje como leido
    app.get("api/conversacion",function(req,res){
        if (req.headers['token']) {
            let criterio = {
                $or: [{
                    emisor: req.session.usuario.email,
                    remitente: req.params.destino
                },
                    {
                        emisor: req.params.destino,
                        remitente: req.session.usuario.email
                    }
                ]
            };

            gestorBD.obtenerConversacion(criterio,function (conversaciones){
                if (conversaciones == null) {
                    app.get("logger").error("Se ha producido un error al obtener la conversacion");
                    res.status(500);
                    res.json({
                        error: "Se ha producido un error al obtener la conversacion"
                    })
                } else {
                    app.get("logger").info("Los amigos se listaron correctamente de la API");
                    res.status(200);
                    res.logeado = logeado;
                    res.send(JSON.stringify(conversaciones));
                }
            });
        }
    });
    //Ejercicio AS5 Marcar mensaje como leido
    app.put("/api/mensaje/leido/:id", function (req, res) {
        if (req.token) {
            let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id),
                destino: req.session.usuario.email,
                leido: false
            };
            let mensaje = {
                leido:true
            }
            //Se comprueba primero si los usuarios son amigos
            gestorBD.modificarMensaje(criterio, mensaje, function(id) {
                if (result == null) {
                    app.get("logger").error("Mensaje no existe, o no eres destinatario o ya esta leido");
                    res.status(403);
                    res.json({
                        error : "Mensaje no existe, o no eres destinatario o ya esta leido"
                    })
                } else {
                    app.get("logger").info("El mensaje se marco correctamente como leido");
                    res.status(201);
                    res.json({
                        mensaje: "Mensaje marcado como leido",
                        _id: id
                    });
                }
            });
        }
    });
    app.get("/api/mensajes/:id", function (req, res) {

        // Obtener (emisor o receptor es usuario logeado o amigo)
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerConversacion(criterio, function (conversaciones) {
            if (conversaciones == null || conversaciones.length === 0) {
                app.get("logger").error("Error al obtener conversación de la API");
                res.status(500);
                res.json({
                    error: "Error al obtener conversación de la API"
                })
            } else {
                let conversacion = conversaciones[0];
                let criterio = {
                    conversacion: gestorBD.mongo.ObjectID(conversacion._id)
                };
                gestorBD.obtenerMensajes(criterio, function (mensajes) {
                    if (mensajes == null) {
                        app.get("logger").error("Error al obtener mensajes de la API");
                        res.status(500);
                        res.json({
                            error: "Error al obtener los mensajes de la API"
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