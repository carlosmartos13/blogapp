const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
require('../models/usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get( "/registro", (req, res)=>{
    res.render("usuarios/registro")
})//pagina de registro

router.post( "/registro", (req, res)=>{
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({ texto: "Nome inválido"})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({ texto: "e-mail inválido"})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null || req.body.senha.length < 4){
        erros.push({ texto: "senha inválida"})
    }

    if(req.body.senha2 != req.body.senha ){
        erros.push({ texto: "senhas são diferentes, tente novamente"})
    }

    if(erros.length > 0){

        res.render("usuarios/registro", {erros})

    }else{

        Usuario.findOne({email: req.body.email}).then((usuario)=>{
                if(usuario){
                    req.flash("error_msg", "Ja existe uma conta com esse e-mail "  )
                 res.redirect("/usuarios/registro")

                }else{
                    const novoUsuario = new Usuario({
                        nome: req.body.nome,
                        email: req.body.email,
                        senha: req.body.senha
                    })

                    bcrypt.genSalt(10, (erro, salt)=> {
                        bcrypt.hash(novoUsuario.senha, salt, (err, hash)=>{
                            if(err){
                                req.flash("error_msg", "Erro ao emcriptar a senha de usuario" + err)
                            }

                            novoUsuario.senha = hash
                            novoUsuario.save().then(()=>{
                                req.flash("success_msg", "usuario criado com sucesso" )
                                res.redirect("/usuarios/registro")

                            }).catch((err) => {
                                req.flash("error_msg", "Erro ao interno salvar o usuario " + err )
                                res.redirect("/usuarios/registro")
                            })
                        })
                    })


                }

            }).catch((err) => {
            req.flash("error_msg", "Erro ao interno salvar o usuario " + err )
            res.redirect("/")
        })


       
    }
    
})//cadastra o usuario

router.get("/login", (req, res)=>{
    res.render("usuarios/login")
})

router.post("/login", (req, res, next)=> {

    passport.authenticate("local", { 
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)

   
   
})
router.get("/logout", (req, res)=>{
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso")
    res.redirect("/")
})




module.exports = router