const {MongoClient} = require("mongodb")
const libexpress = require("express")
const cors = require("cors")
const server = libexpress()
server.use(cors())
server.use(libExpress.json()) //converts into json format

const connection = new MongoClient("mongodb://Madhavi:madhavi05@localhost:27017/IMS?authSource=IMS")

//user signup
server.post("/user", async (req, res)=>{
    //console.log("user request")

    if(req.body.name && req.body.email && req.body.password && req.body.phone){
        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("USER")
        const result = await collection.find({"email": req.body.email}).toArray()

        if(result.length > 0)
            res.json("User already exist!")

        else{
            await collection.insertOne({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone
            })
            res.json("User created successfully!")
        }
    }



    /*
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
    */
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
    console.log("Team Request")
    res.send("Team created")
})

server.post("/player", (req, res)=>{
    console.log("Player Request")
    res.send("Player created")
})

server.listen(8000,()=>{
    console.log("Server is listening on port 8000")
})