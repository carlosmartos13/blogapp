// Carregando Modulos
const express = require('express')
const handlebars= require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require("path")
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)
const db = require("./config/db")

// Configurações
    //session
    app.use(session({
        secret: "cursodenode",
        resaye: true,
        saveUninitialized: true
    }))

    //passport
    app.use(passport.initialize())
    app.use(passport.session())
    // Middleware
    app.use(flash());
    
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;        
        next()
    })
    //body-parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
    //Handlebars
    app.engine('handlebars', handlebars({ defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    // Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect(db.mongoURI).then(()=>{
        console.log('Conectado ao mongo')
    }).catch((err)=>{
        console.log("Erro ao conectar no banco" + err)
    })
    //public
    app.use(express.static(path.join(__dirname, "public")))

   


// rotas
    app.get('/', (req, res)=> {

        Postagem.find().populate("categoria").lean().sort({ceratedAt: "desc"}).then((postagens)=>{
        res.render('index', {postagens})
        
        
    }).catch((err) => {
        req.flash("error_msg", "Erro interno ao remover a postagem" + err )
        res.redirect("/404")

    })

    })
    app.get('/404', (req, res)=>{
        res.send('erro 404')
    })


    app.get('/postagem/:slug', (req, res) =>{ 
        Postagem.findOne({slug: req.params.slug}).populate("categoria").lean().then((postagem)=>{
           if(postagem){
            res.render("postagem/index", {postagem})

           }else{
            req.flash("error_msg", "a postagem nao existe ou nao é mais publica" )
            res.redirect("/")
           }


           
        }).catch((err) => {
            req.flash("error_msg", "Erro abrir  a postagem" + err )
            res.redirect("/")
    
        })
    })
    app.get('/categorias', (req, res)=>{
      Categoria.find().lean().then((categorias)=>{
            res.render("categorias/index", {categorias})
        }).catch((err) => {
             req.flash("error_msg", "Erro intewrno ao abrir as Categorias" + err )
            res.redirect("/")
    
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).populate("categoria").lean().then((postagens)=>{
                    res.render("categorias/listagem", {postagens, categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Erro intewrno ao abrir as Categorias" + err )
                    res.redirect("/")
                    })

                }else{
                req.flash("error_msg", "Erro interno ao abrir a Categoria"  )
                res.redirect("/")
            }
            
        }).catch((err) => {
            req.flash("error_msg", "Erro intewrno ao abrir as Categorias" + err )
            res.redirect("/")
    
        })
    })



    app.use('/admin', admin)
    app.use('/usuarios', usuarios)
    


// rotas
const port = process.env.port || 8081
app.listen(port, () => {
    console.log('Servidor ligado e Rodando')
})