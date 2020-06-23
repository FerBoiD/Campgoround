var express                 =require("express"),
    app                     =express(),
    bodyParer               =require("body-parser"),
    mongoose                =require("mongoose"),
    campground              =require("./models/campground"),
    comment                 =require("./models/comment"),
    passport                =require("passport"),
    LocalStrategy           =require("passport-local"),
    passportLocalMongoose   =require("passport-local-mongoose");
    User                    =require("./models/user")

app.use(require("express-session")({
    secret:"This is some valid code",
    resave:false,
    saveUninitialized:false
}));

mongoose.connect("mongodb://localhost:/yelp_camp",{useNewUrlParser:true , useUnifiedTopology: true });
app.use(bodyParer.urlencoded({extended:true}));
app.set("view engine","ejs");

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//      ROUTES
//=========================================================================================================

app.get("/",function(req,res){
    res.render("campground/landing");
});

//       INDEX
//=========================================================================================================
app.get("/campgrounds",function(req,res){
    console.log(req.user);
    campground.find({},function(err,campgrounds){
       if(err){
           console.log("error");
       }else{
            res.render("campground/campgrounds",{campgrounds:campgrounds});
       }
   })    
});

//   NEW
//======================================================================================================
app.get("/campgrounds/new",function(req,res){
    res.render("campground/new");
});

//    CREATE
//=======================================================================================================
app.post("/campgrounds",function(req,res){
    var name=req.body.name;
    var image=req.body.image;
    var desc=req.body.description;
    var newcampground={name:name, image:image, description:desc};
    // campgrounds.push(newcampground);
    campground.create(newcampground,function(err,campground){
        if(err){
            console.log("Error");
        }else{
            res.redirect("campgrounds");    
        }
    });
});

//     SHOW
//=================================================================================================
app.get("/campgrounds/:id",function(req,res){
    campground.findById(req.params.id).populate("comments").exec(function(err,foundGround){
        if(err){
            console.log(err);
        }else{
            res.render("campground/show",{campground:foundGround});
        }
    });
});

//============================
//    COMMENTS
//============================

app.get("/campgrounds/:id/comments/new",isLoggedin,function(req,res){
    campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }else{
            res.render("comment/new",{campground:campground});
        }
    })
})

app.post("/campgrounds/:id/comments",isLoggedin,function(req,res){
    campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }else{
            comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err);
                }else{
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/"+campground. _id);
                }
            })
        }
    })
})

//   AUTHENTICATION
//=========================================================================================================

//Registration
app.get("/registration",function(req,res){
    res.render("Authentication/register");
})

app.post("/registration",function(req,res){
    User.register(new User({username:req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err)
            return  res.render("Authentication/register");
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/campgrounds");
        })
    })
})

//Login
app.get("/login",function(req,res){
    res.render("Authentication/login");
})

app.post("/login",passport.authenticate("local",{
    successRedirect:"/campgrounds",
    failureRedirect:"/login"
}),function(req,res){
})

//logout
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})

function isLoggedin(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000,function(){
    console.log("Yelp Camp Server has Started !!!");
});