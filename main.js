const {MongoClient} = require("mongodb")
const libExpress = require("express")
const cors = require("cors")
const server = libExpress()
server.use(cors())

const connection = new MongoClient("mongodb://Madhavi:madhavi05@localhost:27017/IMS?authSource=IMS")

//user signup
server.post("/user", (req, res)=>{
    console.log("user request")

    if(req.body.name && req.body.email && req.body.password && req.body.phone){
    connection.connect().
    then(() => connection.db("IMS")).
    then((db) => db.collection("USER")).
    then((collection) => collection.insertOne({
        name: req.body.name,
        email: req.body.email,
        passwoed: req.body.password,
        phone: req.body.phone
    })).
    then(() => res.json({message: "User created successfully"})).
    catch((error) => res.json({message: "Error creating user ", error}))
    }
})

//user login
server.get("/token", (req, res)=>{
    console.log("user request")

    connection.connect().
    then(() => connection.db("IMS")). 
    then((db) => db.collection("USER")). 
    then((collection) => collection.find().toArray()). 
    then((result) => console.log(result)). 
    catch((error) => console.log("Database Connection error. ", error))


    /*res.json(
        [   {name: "usr1"},
            {name: "user2"},
            {name: "user3"}
        ]
    )
    */
})

server.post("/team", (req, res)=>{
    console.log("team request")
    res.send("Team is created")
})

server.post("/player", (req, res)=>{
    console.log("player request")
    res.send("Player is created")
})

server.listen(8000, ()=> {
    console.log("Server is running on port 8000")
})

//    C:\dev\IMS-BE