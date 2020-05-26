const localStrategy = require("passport-local").Strategy
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")

require('../models/usuario')
const Usuario = mongoose.model('usuarios')

module.exports = function (passport) {
    passport.use(new localStrategy({ usernameField: 'email', passwordField: 'senha' }, (email, password, done) => {
        Usuario.findOne({ email: email }).then((user) => {
            if (!user) {
                return done(null, false, { message: 'Esta conta não existe' })
            }

            bcrypt.compare(password, user.senha, (error, equalPassword) => {
                if (equalPassword) {
                    return done(null, user)
                } else {
                    return done(null, false, { message: 'Senha incorreta' })
                }
            })
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, user) => {
            done(err, user)
        })
    })
}