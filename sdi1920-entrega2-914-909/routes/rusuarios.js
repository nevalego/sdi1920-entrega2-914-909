module.exports = function (app, swig, gestorDB) {

    app.get("/usuarios", function (req, res) {
        let criterio = {};
        if( req.query.busqueda != null){
            criterio = {
                $or:[{name : {$regex : ".*"+req.query.busqueda+".*"}},
                    {surname : {$regex : ".*"+req.query.busqueda+".*"}},
                    {email : {$regex : ".*"+req.query.busqueda+".*"}}],

            }
            ;
        }
        else {
            criterio = {};
        }
        let pg = parseInt(req.query.pg);
        if ( req.query.pg == null){
            pg = 1;
        }

        gestorDB.obtenerUsuariosPg(criterio, pg,function (usuarios, total) {
            if (usuarios == null) {
                res.send("Error al listar usuarios");
                app.get("logger").error('Error al listar los usuarios');
            } else {
                let ultimaPg = 1;
                if(total > 5){
                    ultimaPg = total/5;
                }
                if (total % 5 > 0 && total/5 >1){ // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                let paginas = []; // paginas mostrar
                for(let i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/busuarios.html',
                    {
                        usuario: req.session.usuario,
                        usuarios: usuarios,
                        paginas : paginas,
                        actual : pg
                    });
                res.send(respuesta);
                app.get("logger").info('El usuario ha listado los usuarios correctamente');
            }
        });
    });

    app.get('/tienda', function (req, res) {
        let respuesta = swig.renderFile('views/base.html', {});
        res.send(respuesta);
    });

    app.get("/registrarse", function (req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.post('/usuario', function (req, res) {
        let seguro = app.get('crypto').createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        let usuario = {
            email: req.body.email,
            name: req.body.name,
            surname: req.body.surname,
            password: seguro
        }
        gestorDB.insertarUsuario(usuario, function (id) {
            if (id == null) {
                app.get("logger").error('Error al registrar usuario');
                res.redirect("/registrarse?mensaje=Error al registrar usuario");
            } else {
                app.get("logger").error('Nuevo usuario registrado');
                res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
            }
        })
    });

    app.get("/identificarse", function (req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.post("/identificarse", function (req, res) {
        if (req.body.email == '' || req.body.email == undefined) {
            app.get("logger").error('El email no puede estar vacío');
            res.redirect("/identificarse?mensaje=El email no puede estar vacío")
        } else if (req.body.password == undefined || req.body.password == '') {
            app.get("logger").error('La contraseña no puede estar vacía');
            res.redirect("/identificarse?mensaje=La contraseña no puede estar vacía")
        } else {
            let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            let criterio1 = {
                email: req.body.email
            };
            let criterio2 = {
                email: req.body.email,
                password: seguro
            };

            gestorDB.obtenerUsuarios(criterio2, function (usuarios) {
                if (usuarios == undefined || usuarios.length == 0) {
                    req.session.usuario = undefined;
                    res.redirect("/identificarse" +
                        "?mensaje=Email o password incorrecto"+
                        "&tipoMensaje=alert-danger ");
                    app.get("logger").error('Email o password incorrecto');
                } else {
                    req.session.usuario = usuarios[0];
                    app.get("logger").info('El usuario ' + req.session.usuario.email + " se logeo correctamente");
                    delete req.session.usuario.password;
                    res.redirect("/usuarios");
                }
            });
        }
    });

    app.get('/desconectarse', function (req, res) {
        app.get("logger").info('El usuario ' + req.session.usuario.email + " cerró sesión correctamente");
        req.session.usuario = undefined;
        res.redirect("/identificarse");
    });

    app.get('/usuario/amistad/:email', function (req, res) {
        if (req.session.usuario == null) {
            app.get("logger").error('No se encuentra un usuario identificado');
            res.redirect("/identificarse?mensaje=No se encuentra un usuario identificado");
        } else if (req.session.usuario.email == req.params.email) {
            app.get("logger").error('No se puede pedir amistad a uno mismo');
            res.redirect("/usuarios?mensaje=No se puede pedir amistad a uno mismo");
        } else {
            let peticion = {
                emisor: req.session.usuario.email,
                remitente: req.params.email,
                aceptada: false
            }
            let criterio = {
                $or: [{
                    emisor: req.session.usuario.email,
                    remitente: req.params.email
                },
                    {
                        emisor: req.params.email,
                        remitente: req.session.usuario.email
                    }
                ]
            };
            gestorDB.obtenerPeticionesDeAmistad(criterio, function (peticionesExistentes) {
                if (peticionesExistentes.length > 0) {
                    app.get("logger").info('Ya existe una peticion de ese tipo o no es valida');
                    res.redirect("/usuarios?mensaje=Ya existe una peticion de ese tipo o no es valida");
                } else {
                    gestorDB.enviarPeticionDeAmistad(peticion, function (id) {
                        if (id == null) {
                            res.redirect("/usuarios?mensaje=Error al enviar la peticion");
                            app.get("logger").info('Error al enviar la peticion');
                        } else {
                            res.redirect("/usuarios?mensaje=Peticion enviada");
                            app.get("logger").info('Peticion enviada');
                        }
                    });
                }
            });
        }
    });
    app.get("/usuario/amistad", function (req, res) {
        if ( req.session.usuario == null){
            app.get("logger").error('No hay un usuario identificado');
            res.redirect("/identificarse?mensaje=No hay un usuario identificado");
        }
        let criterio = {};

        if( req.query.busqueda != null){
            criterio = {
                emisor : {$regex : ".*"+req.query.busqueda+".*"},
                remitente: req.session.usuario.email,
                aceptada: false

            };
        }
        else{criterio = {
            remitente: req.session.usuario.email,
            aceptada: false
        };}

        gestorDB.obtenerPeticionesDeAmistad(criterio, function (peticiones) {
            if (peticiones == null) {
                app.get("logger").error('Error al listar las peticiones de amistad');
                res.redirect("/usuarios?mensaje=Error al listar las peticiones de amistad");
            } else {
                let emails = [];
                peticiones.forEach(peticion=>emails.push({"email":peticion.emisor}));
                let criterioAmigos ={
                        "$or": emails
                };
                let pg = parseInt(req.query.pg); // Es String !!!
                if ( req.query.pg == null){ // Puede no venir el param
                    pg = 1;
                }
                gestorDB.obtenerUsuariosPg(criterioAmigos,pg, function (usuarios, total) {
                    console.log("Numero de usuarios finales: "+usuarios.length);
                    let ultimaPg = 1;
                    if(total > 5){
                        ultimaPg = total/5;
                    }
                    if (total % 5 > 0 && total/5 >1){ // Sobran decimales
                        ultimaPg = ultimaPg+1;
                    }
                    let paginas = []; // paginas mostrar
                    for(let i = pg-2 ; i <= pg+2 ; i++){
                        if ( i > 0 && i <= ultimaPg){
                            paginas.push(i);
                        }
                    }
                    let respuesta = swig.renderFile('views/bsolicitudesAmistad.html',
                        {
                            usuario: req.session.usuario,
                            usuarios: usuarios,
                            paginas : paginas,
                            actual : pg
                        });
                    res.send(respuesta);
                    app.get("logger").info('El usuario ha listado sus solicitudes de amistad correctamente');
                    });
                }
            });
        });
    app.get("/usuario/amigos", function (req, res) {
        if ( req.session.usuario == null){
            res.redirect("/identificarse");
            app.get("logger").error('No hay un usuario identificado');
        }
        let criterio = {
            $or:[{remitente: req.session.usuario.email},
                {emisor :  req.session.usuario.email}],
            aceptada: true
        };
        let pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }

        gestorDB.obtenerPeticionesDeAmistadPg(criterio, pg,function (peticiones, total) {

            if (peticiones == null) {
                res.redirect("/usuarios");
                app.get("logger").error('Error al listar las peticiones de amistad');
            } else {
                let ultimaPg = 1;
                if(total > 5){
                    ultimaPg = total/5;
                }
                if (total % 5 > 0 && total/5 >1){ // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                let paginas = []; // paginas mostrar
                for(let i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/blistaDeAmigos.html',
                    {
                        usuario: req.session.usuario,
                        email:req.session.usuario.email,
                        peticiones: peticiones,
                        paginas : paginas,
                        actual : pg
                    });
                res.send(respuesta);
                app.get("logger").info('El usuario ha listado sus amigos correctamente');
            }
        });
    });
    app.get("/usuario/amistad/aceptar/:id", function (req, res) {
        if ( req.session.usuario == null){
            app.get("logger").error('No hay un usuario identificado');
            res.redirect("/identificarse");
        }
        let criterio = { "_id" : gestorDB.mongo.ObjectID(req.params.id)};
        let peticion = {
            aceptada : true
        }
        gestorDB.modificarPeticionDeAmistad(criterio, peticion, function(result) {
            let respuesta = swig.renderFile('views/bsolicitudesAmistad.html',
                {
                    usuario: req.session.usuario,
                    peticiones: req.session.peticiones,
                    paginas : req.session.paginas,
                    actual : req.session.pg
                });
            if (result == null) {
                app.get("logger").info('La peticion no ha sido aceptada correctamente');
                res.redirect("/usuario/amistad?mensaje=La peticion no ha sido aceptada correctamente");
            } else {
                app.get("logger").info('La peticion ha sido aceptada correctamente');
                res.redirect("/usuario/amigos?mensaje=La peticion ha sido aceptada correctamente");
            }
        });

    });
};