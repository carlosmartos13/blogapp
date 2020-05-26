if(process.env.NODE_ENV == "production"){
    module.exports = { mongURI: "mongodb+srv://blogappnode:blogappnode@cluster0-mbsji.mongodb.net/test?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}

}