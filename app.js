const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')


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





app.get('/', function(req, res) {

  let today = new Date()
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  }
  let day = today.toLocaleDateString("en-US", options)

  Item.find({}, function(err, foundItems) {

    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if(err) {
          console.log("Bug", err)
        } else {
          console.log("Done!")
        }
      })
      res.redirect("/")
    } else {
      console.log(foundItems)
      res.render('list', {kindOfDay: day, newListItems: foundItems });
    }  
  })
  
})

app.post("/", function(req, res) {
  let item = req.body.newItem 
  if (item.length > 0){
    items.push(item)
    console.log(item)
    res.redirect("/")
  }
})

app.listen(3000, function() {
  console.log("Server is running on port 3000")
})