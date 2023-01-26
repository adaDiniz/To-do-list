const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const _ = require('lodash')

const app = express()

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))

mongoose.set("strictQuery", true)
mongoose.connect("mongodb://localhost:27017/todolistDB")

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemsSchema)

const itemOne = new Item ({
  name: "Welcome to your todolist!"
})
const itemTwo = new Item ({
  name: "Hit the + button to add a new item."
})
const itemThree = new Item ({
  name: "Hit x to delete an item"
})

const defaultItems = [itemOne, itemTwo, itemThree]

const listSchema = {
  name: String, 
  items: [itemsSchema]
}

const List = new mongoose.model("List", listSchema)

let today = new Date()
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  }

let day = today.toLocaleDateString("en-US", options)

app.get('/', function(req, res) {

  Item.find({}, function(err, foundItems) {
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if(!err) {
          console.log("Done!")
        }
      })
      res.redirect("/")
    } else {
      List.find({}, function(err, foundLists) {
        res.render('list', {lists: foundLists, listTitle: "", kindOfDay: day, newListItems: foundItems });
      })
    }  
  })
})

app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName

  List.findOne({name: customListName}, function(err, foundItems) {
    if(!err){ 
      if(foundItems) {
        List.find({}, function(err, foundLists) {  
          if(!err){
            res.render("list", {lists: foundLists, listTitle: foundItems.name, kindOfDay: day, newListItems: foundItems.items})
          }  
        })
      } else {
        console.log(err);
      }
    }
  })
})

app.post("/", function(req, res) {
  let itemName = req.body.newItem 
  let listName = req.body.listName
  
  const newItem = new Item ({
    name: itemName
  })

  if(listName.length === 0) {
    newItem.save()
    res.redirect("/")
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(newItem)
      foundList.save()
      res.redirect("/" + listName)
    })
  }
})

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox
  let listName = req.body.listName
  
  if(listName.length === 0) {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err) {
        console.log("Item deleted")
      }   
      res.redirect("/")
    })
  } else {
      List.findOneAndUpdate(
        {name: listName}, 
        {$pull: {items: {_id: checkedItemId}}},
        function(err, foundList) {
          if(!err) {
            res.redirect("/" + listName)
          }
        }
      )
    }   
})

app.post("/createList", function(req, res) {
  let listName = _.capitalize(req.body.newList)

  List.findOne({name: listName}, function(err, foundItems) {
    if(!err){ 
      if(!foundItems) {
        const list = new List ({
          name: listName,
          items: defaultItems
        })
        
        list.save(function(err){
          if (!err){
            res.redirect("/"+ listName);
          }
        });
      } 
    }
  })
})

app.listen(3000, function() {
  console.log("Server is running on port 3000")
})