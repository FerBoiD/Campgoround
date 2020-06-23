var express     =require("express"),
    app         =express(),
    bodyParer   =require("body-parser"),
    mongoose    =require("mongoose"),
    campground  =require("./models/campground"),
   // seedDB      =require("./seed"),
    comment     =require("./models/comment")

mongoose.connect("mongodb://localhost:/yelp_camp",{useNewUrlParser:true , useUnifiedTopology: true });
app.use(bodyParer.urlencoded({extended:true}));
app.set("view engine","ejs");
//seedDB();


app.get("/",function(req,res){
    res.render("campground/landing");
});

//       INDEX
//=========================================================================================================
app.get("/campgrounds",function(req,res){
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

app.get("/campgrounds/:id/comments/new",function(req,res){
    campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }else{
            res.render("comment/new",{campground:campground});
        }
    })
})

app.post("/campgrounds/:id/comments",function(req,res){
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

app.listen(3000,function(){
    console.log("Yelp Camp Server has Started !!!");
});