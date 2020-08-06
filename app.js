//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const request = require("request");
const important = require('./important');
const https = require("https");
const mongoose = require('mongoose');

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-aleksa:adidas3000@cluster0.itmc6.mongodb.net/blogDB',{useNewUrlParser: true, useUnifiedTopology: true})

const startingContentSchema = new mongoose.Schema({
  title:String,
  content:String
});
const postsSchema = new mongoose.Schema({
  title:String,
  content:String
})

const StartingContentModel = mongoose.model("StartingContent",startingContentSchema);
const postsModel = mongoose.model("Post",postsSchema);

const Home = {
  title: "Home",
  content:"Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing"
}
const About = {
  title: "About",
  content: "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui."

}
const Contact = {
  title: "Contanct Us",
  content:"Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero."
}
const defaultPosts = [Home,About,Contact];




app.get("/", (req, res) => {
  
  StartingContentModel.find({title: 'Home'},(err,result)=>{
    if(result.length === 0){
      StartingContentModel.insertMany(defaultPosts,(err)=>{
        err ? console.log(err) : console.log(`Sjajan si bratoo`)
      })
    }else{
      postsModel.find({},(err,results)=>{
        res.render("Home",{home: result, postContent: results})
      })
    }
  })
});
app.get("/about", (req, res) => {
  StartingContentModel.find({title: 'About'},(err,result)=>{
    res.render("about", { about: result});
  })
});
app.get("/contact", (req, res) => {
  StartingContentModel.find({title: 'Contanct Us'},(err,result)=>{
    res.render("contact", { contanct: result});
  })
});
app.get("/compose", (req, res) => {
  res.render("compose");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/posts/:postID", (req, res) => {
  const requestedID = _.lowerCase(req.params.postID);
  postsModel.find({},(err,results)=>{
    results.forEach(result=>{
      if(_.lowerCase(result._id) === requestedID){
        res.render("post", { postedTitle: result.title, postedBody: result.content });
      }{
        console.log('Opa bato');
      }
    })
  })

});
app.post("/compose", (req, res) => {
  const post = new postsModel({
    title: req.body.postTitle,
    content: req.body.postBody,
  });
  post.save();
  res.redirect("/");
});
app.post("/", (req, res) => {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };
  const listID = important.listId;
  const jsonData = JSON.stringify(data);

  const url = `https://us10.api.mailchimp.com/3.0/lists/${listID}`;
  const options = important.options;
  const request = https.request(url, options, (response) => {
    if (response.statusCode === 200) {
      res.render("success");
    } else {
      res.render("faliure");
    }
    response.on("data", (data) => {
      console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
// <% postContent.map(post => { %>
//   <h2><%=post.title%></h2>  
//   <p><%=post.content.substring(0,100) + "..."%> <a href="/posts/:<%=post.title %>">Read More</a></p>  
//   <% }); %>