const {MongoClient, Admin} = require("mongodb")
const libRandomString = require("randomstring")
const libExpress = require("express")
const cors = require("cors")
const server = libExpress()
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

    else{
        res.json("Please fill all the fields!")
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
server.post("/token", async (req, res)=>{
    console.log("user request")

    if(req.body.email && req.body.password){
        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("USER")
        const result = await collection.find({"email": req.body.email, "password": req.body.password}).toArray()
        
        if(result.length > 0)
        {
            // genetare token
            const generatedToken = libRandomString.generate(6)

            // register token against user
            const user = result[0]
            
            await collection.updateOne(
                { _id: user._id },
                {$set: {token: generatedToken}}
            )

            // return token to user
            res.status(200).json({token: generatedToken})
        }
        else{
            res.status(400).json({message: "Invalid email or password"})
        }
    }

    else{
        res.status(401).json({message: "All fields are required"})
    }

})


// user role
server.get("/user/role", async (req, res) =>{
    console.log("user role request")

    if(req.headers.token){
        
        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("USER")
        const result = await collection.find({"token": req.headers.token}).toArray()

        if(result.length > 0)
        {
            const user = result[0]

            const roles = {
                admin: user.is_admin === true,
                onwer: !!user.owner_of,
                player: !!user.playeing_for
            }

            res.status(200).json(roles)
        }

        else{
            res.status(401).json({message: "Invalid token"})
        }
        
    }
    else{
        res.status(401).json({message: "Unauthorized"})
    }
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