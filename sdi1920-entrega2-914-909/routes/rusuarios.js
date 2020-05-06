module.exports = function (app, swig, gestorDB) {

    app.get("/usuarios", function (req, res) {
        let criterio = {
            $and: [
                {email: {$ne: req.session.usuario.email}}
            ]
        };

        gestorDB.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null) {
                res.redirect("/identificarse");
                app.get("logger").error('Error al listar los usuarios');
            } else {
                let respuesta = swig.renderFile('views/busuarios.html', {
                    usuario: req.session.usuario,
                    usuarios: usuarios});
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
                res.redirect("/registrarse?mensaje=Error al registrar usuario");
            } else {
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
            let criterio = {
                email: req.body.email,
                password: seguro
            };

            gestorDB.obtenerUsuarios(criterio, function (usuarios) {
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
};