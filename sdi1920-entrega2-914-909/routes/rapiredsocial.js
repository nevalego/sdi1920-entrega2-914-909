module.exports = function (app, gestorBD) {
    app.post("/api/autenticar", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        let criterio = {
            email: req.body.email,
            password: seguro
        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); // unauthorized
                res.json({
                    autenticado: false,
                    mensaje: "Error al iniciar de seión"
                })
            } else {
                var token = app.get('jwt').sign(
                    {
                        usuario: usuarios[0],
                        tiempo: Date.now() / 1000
                    },
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                })
            }
        });
    });
    // S2 Mostrar amigos
    app.get("/api/amigos", function (req, res) {
        if (req.headers['token']) {
            let buscado = "";
            let busqueda = false;
            if (req.query.searchText != null) {
                busqueda = true;
                buscado = req.query.searchText;
            }
            let criterio = {
                $or: [
                    {remitente: res.usuario.email},
                    {emisor: res.usuario.email}],
                aceptada: true
            };
            let logeado = res.usuario;
            gestorBD.obtenerPeticionesDeAmistad(criterio, function (peticiones) {
                if (peticiones == null) {
                    app.get("logger").error("Se ha producido un error al obtener las peticiones de la API");
                    res.status(500);
                    res.json({
                        error: "Se ha producido un error al obtener las peticiones de la API"
                    })
                } else {
                    let emails = [];
                    peticiones.forEach(peticion => emails.push({"email": peticion.emisor}));
                    peticiones.forEach(peticion => emails.push({"email": peticion.remitente}));
                    let criterioAmigos = {};
                    if (busqueda) {
                        criterioAmigos = {
                            "$or": emails,
                            email: {$ne: logeado.email},
                            name: buscado
                        };
                    } else {
                        criterioAmigos = {
                            "$or": emails,
                            email: {$ne: logeado.email}
                        };
                        gestorBD.obtenerUsuarios(criterioAmigos, function (usuarios) {
                            if (usuarios == null || usuarios.length == 0) {
                                app.get("logger").error("Se ha producido un error al obtener los usuarios amigos de la API");
                                res.status(500);
                                res.json({
                                    error: "Se ha producido un error al obtener los usuarios amigos de la API"
                                })
                            } else {
                                app.get("logger").info("Los amigos se listaron correctamente de la API");
                                res.status(200);
                                res.logeado = logeado;
                                res.send(JSON.stringify({
                                    usuario: logeado,
                                    usuarios: usuarios
                                }));
                            }
                        });
                    }
                }
            });
        } else {
            res.status(500);
            res.json({
                error: "No hay usuario identificado"
            })
        }
    });
    // S4 Mostrar mensajes de una conversación
    app.get("/api/conversacion/:id", function (req, res) {
        if (req.headers['token']) {
            // Primero obtener usuario por _id -> amigo.email -> obtener mensajes
            let criterioAmigo = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
            let logeado = res.usuario;
            gestorBD.obtenerUsuarios(criterioAmigo, function (usuarios) {
                if (usuarios == null) {
                    app.get("logger").error("Se ha producido un error al obtener al amigo de la API");
                    res.status(500);
                    res.json({
                        error: "Se ha producido un error al obtener al amigo de la API"
                    })
                } else {
                    let amigo = usuarios[0].email;
                    let criterio = {
                        $or: [
                            {
                                $and: [
                                    {destino: res.usuario.email},
                                    {emisor: amigo}
                                ]
                            },
                            {
                                $and: [
                                    {destino: amigo},
                                    {emisor: res.usuario.email}
                                ]
                            }
                        ]
                    };
                    gestorBD.obtenerMensajes(criterio, function (mensajes) {
                        if (mensajes == null) {
                            app.get("logger").error("Se ha producido un error al obtener los mensajes de la API");
                            res.status(500);
                            res.json({
                                error: "Se ha producido un error al obtener los mensajes de la API"
                            })
                        } else {
                            app.get("logger").info("Los mensajes se listaron correctamente de la API");
                            res.status(200);
                            res.logeado = logeado;
                            res.send(JSON.stringify(mensajes));
                        }
                    });
                }
            });
        }
    });

    // S3 Crear mensaje
    app.post("/api/mensaje/:id", function (req, res) {
        if (req.headers['token']) {
            let criterioAmigo = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
            gestorBD.obtenerUsuarios(criterioAmigo, function (usuarios) {
                if (usuarios == null) {
                    app.get("logger").error("Se ha producido un error al obtener al amigo de la API");
                    res.status(500);
                    res.json({
                        error: "Se ha producido un error al obtener al amigo de la API"
                    })
                } else {
                    let mensaje = {
                        emisor: req.body.autor,
                        destino: usuarios[0].email,
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
                                mensaje: "Mensaje creado en la API",
                                _id: id
                            })
                        }
                    });
                }
            });
        }
    });

    //Ejercicio AS5 Marcar mensaje como leido
    app.put("/api/mensaje/leido/:id", function (req, res) {
        if (req.token) {
            let criterio = {
                "_id": gestorBD.mongo.ObjectID(req.params.id),
                destino: req.session.usuario.email,
                leido: false
            };
            let mensaje = {
                leido: true
            }
            //Se comprueba primero si los usuarios son amigos
            gestorBD.modificarMensaje(criterio, mensaje, function (id) {
                if (result == null) {
                    app.get("logger").error("Mensaje no existe, o no eres destinatario o ya esta leido");
                    res.status(403);
                    res.json({
                        error: "Mensaje no existe, o no eres destinatario o ya esta leido"
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

    //SOLO PARA USO DE TESTS
    //METODO DE BORRADO DE COLECCIONES
    app.get("/api/eliminarColeccion", function (req, res) {
        let coleccion = req.query.coleccion;
        gestorBD.resetBD(coleccion, function (resultado) {
            if (resultado) {
                app.get("logger").info('Coleccion borrada exitosamente');
                res.send("Coleccion borrada exitosamente");

            } else {
                app.get("logger").error('No se ha podido borrar la coleccion');
                res.send("No se ha podido borrar la coleccion");
            }
        })
    });
}