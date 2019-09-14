const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); //MUST DO THIS FOR EXPRESS 4 UPDATE

//...............................Required to use Flash Messages
const session = require("express-session");
const flash = require("express-flash");

const app = express();
app.listen(1337, () => console.log("suhhh dude 1337"));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + "/static"));

app.use(bodyParser.urlencoded({extended: false}));

//...............................Required to use Flash Messages
app.use(session({
    secret: "groot",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 5000},
}));
app.use(flash());

const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/messengerDB', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}); //!!localhost/... is name of DataBase

const CommentSchema = new Schema({ //!!Schema in Mongoose is a structure for each Document
    name: {type: String, required: [true, "Comment Must Have a Name"]},
    content: {type: String, required: [true, "Comment Must Have Content"], maxlength: [50, "Comment Cannot Exceed 50 Characters"]},
}, {timestamps: true }); //.....................adds "createdAt" and "updatedAt" properties to QuoteDocument(s)

const PostSchema = new Schema({ //!!Schema in Mongoose is a structure for each Document
    name: {type: String, required: [true, "Post Must Have a Name"]},
    mainContent: {type: String, required: [true, "Post Must Have Content"], maxlength: [50, "Post Cannot Exceed 50 Characters"]},
    subContent: [CommentSchema],
}, {timestamps: true }); //.....................adds "createdAt" and "updatedAt" properties to QuoteDocument(s)

// create an object to that contains methods for mongoose to interface with MongoDB
const CommentModel = mongoose.model('CommentDocument', CommentSchema); //!!Model in Mongoose is a structure for each Collection
const PostModel = mongoose.model('PostDocument', PostSchema);

app.get('/', (req, res) => {
    // PostModel.remove({}, ()=> console.log('empty')); //remove all Data from Collection
    // console.log(req.session.sessionFlash);
    PostModel.find()
        .then(data => res.render("index", {post: data}))
});

app.post('/createPost', (req, res) => {
    const post = new PostModel();
    post.name = req.body.name;
    post.mainContent = req.body.mainContent;
    post.save()
        .then(data => {
            console.log('New Post Created: ', data);
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
            for(let key in err.errors) {
                req.flash("registration", err.errors[key].message);
            }
            res.redirect('/');
        });
});

app.post('/createComment/:id', (req, res) => {
    PostModel.findOneAndUpdate({_id: req.params.id}, {$push: {subContent: new CommentModel (req.body)}}, {runValidators: true})
        .then( () => res.redirect('/'))
        .catch(err => {
            console.log(Object.keys(err.errors.subContent.errors))
            for (let key in err.errors.subContent.errors) {
                req.flash("createComment", err.errors.subContent.errors[key].message);
            }
            res.redirect('/');
        });
});

// app.get('/bison/destroy/:id', function(req, res) {
//     BisonModel.deleteOne({_id: req.params.id})
//         .then(res.redirect('/'))
// });