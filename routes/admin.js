const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require("../helpers/eAdmin")


router.get('/', eAdmin, (req, res) => {
    res.send('login requerido')
})
router.get('/posts', eAdmin, (req, res) => {
    res.send("Pagina de posts")
})
// CATEGORIAS
router.get('/categorias', eAdmin,(req, res) => {
    Categoria.find().sort({ createdAt: 'desc'}).lean().then((categorias) =>{
        req.flash("success_msg", "categorias encontradas")
        res.render('admin/categorias', {categorias: categorias})
   

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin/categorias")
    })
})
router.get('/categorias/add', eAdmin, (req, res)=>{
    res.render('admin/addcategorias')
})
router.post('/categorias/nova',  eAdmin,(req, res)=>{
 
    var erros = []
if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({ texto: "Nome invalido"})
}
if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto:"Slug inválid"})

}

if(req.body.nome.length <2){
    erros.push({texto: "Nome da categoria é muito pequeno"})
}

if(erros.length > 0){
    res.render("admin/addcategorias", {erros})
} else {
    
    const novaCategoria = { 
        nome: req.body.nome,
        slug: req.body.slug
    }
        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao cadastrar categoria, tente novamente!")
            res.redirect("/admin/categorias")
        })
    
     

}

})

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
   
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategorias", {categoria: categoria})

    }).catch((_err) => {
        req.flash("error_msg", "Erro ao encontrar categoria")
        res.redirect("/admin/categorias")
    })

    
})

router.post("/categorias/edit", eAdmin,(req,res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        categoria.save().then(()=>{
            req.flash("success_msg", "Categoria atualizada com Sucesso")
            res.redirect("/admin/categorias")

        }).catch((_err) => {
        req.flash("error_msg", "Erro ao salvar categoria")
        res.redirect("/admin/categorias")
    })
    }).catch((_err) => {
        req.flash("error_msg", "Erro ao salvar categoria")
        res.redirect("/admin/categorias")
    })
})

router.post('/categorias/deletar', eAdmin,(req, res)=>{
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria Excluida com Sucesso")
            res.redirect("/admin/categorias")
    }).catch((_err) => {
        req.flash("error_msg", "Erro ao excluir categoria")
        res.redirect("/admin/categorias")
    })
})
//POSTS
router.get('/postagens', eAdmin, (req, res) => {
    Postagem.find().populate("categoria").lean().sort({createdAt: "desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar as postagem")
        res.redirect("/admin")
    })    
})
router.get('/postagem/add', eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagem", {categorias})

    }).catch((_err) => {
        req.flash("error_msg", "Erro ao carregar a postagem")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/nova", eAdmin, (req,res)=>{
    var erros = []
    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria"})
    }
    if (erros.length > 0){
        res.render("/admin/postagens", {erros: erros})
    }else{

        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
            
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "postagens criada com Sucesso")
                res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao criar a postagem" + err )
            res.redirect("/admin/postagens")
        })

    }
})

router.get("/postagens/edit/:id", eAdmin, (req, res)=>{

    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{

        Categoria.find().lean().then((categorias)=>{

            res.render("admin/editpostagens", {categorias, postagem})


        }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar as categorias" + err )
        res.redirect("/admin/postagens")
    })


    }).catch((err) => {
        req.flash("error_msg", "Erro ao editar a postagem" + err )
        res.redirect("/admin/postagens")
    })



})

router.post("/postagens/edit", eAdmin, (req, res)=>{

    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        
        postagem.save().then(()=>{
            req.flash("success_msg", "postagens salva com Sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro interno ao atualizar a postagem" + err )
            res.redirect("/admin/postagens")

        })

    }).catch((err) => {
        req.flash("error_msg", "Erro ao atualizar a postagem" + err )
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", eAdmin, (req,res) => {

    Postagem.remove({_id:req.params.id}).then(()=>{
        req.flash("success_msg", "postagens removida com Sucesso")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Erro interno ao remover a postagem" + err )
        res.redirect("/admin/postagens")

    })

})

module.exports = router