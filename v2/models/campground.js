var mongoose=require("mongoose");
var comments=require("./comment");

var campSchema=new mongoose.Schema({
    name:String,
    image:String,
    description:String,
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]
});
 
module.exports = mongoose.model("campground",campSchema);

