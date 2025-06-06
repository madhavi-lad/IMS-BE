const { MongoClient, ObjectId } = require("mongodb")
const libRandomString = require("randomstring")
const libExpress = require("express")
const cors = require("cors")
const server = libExpress()
server.use(cors())
server.use(libExpress.json()) //converts into json format

const connection = new MongoClient("mongodb://Madhavi:madhavi05@localhost:27017/IMS?authSource=IMS")

//user signup
server.post("/user", async (req, res) => {
    console.log("user signup request")

    if (req.body.name && req.body.email && req.body.password && req.body.phone) {
        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("USER")
        const result = await collection.find({ "email": req.body.email }).toArray()

        if (result.length > 0)
            res.json("User already exist!")


        else {
            await collection.insertOne({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone
            })
            res.json({ message: "User created successfully!" })
        }

        connection.close()
    }
    else {
        res.json({ message: "Please fill all the fields!" })
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
server.post("/token", async (req, res) => {
    console.log("user login request")
    console.log(req.body.email)
    console.log(req.body.password)

    if (req.body.email && req.body.password) {

        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("USER")
        const result = await collection.find({ "email": req.body.email, "password": req.body.password }).toArray()

        if (result.length > 0) {

            const generatedtoken = libRandomString.generate(6)

            const user = result[0]

            await collection.updateOne(
                { _id: user._id },
                { $set: { token: generatedtoken } }
            )


            res.status(200).json({ token: generatedtoken })
        }
        else {
            res.status(400).json({ message: "Invalid email or password" })
        }

        connection.close()
    }
    else {
        res.status(401).json({ message: "All fields are required" })
    }


    /*res.json(
        [   {name: "usr1"},
            {name: "user2"},
            {name: "user3"}
        ]
    )
    */
})

server.get("/user/role", async (req, res) => {

    console.log("user role request")

    if (req.headers.token) {

        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("USER")
        const result = await collection.find({ "token": req.headers.token }).toArray()

        if (result.length > 0) {

            const user = result[0]

            const roles = {
                admin: user.is_admin === true,
                owner: !!user.owner_of,
                player: !!user.playing_for
            }

            res.status(200).json(roles)
        }
        else {
            res.status(400).json({ message: "Invalid token" })
        }

        connection.close()

    }
    else {
        res.status(401).json({ message: "Unauthorized" })
    }

})

server.get("/players", async (req, res) => {
    console.log("Players list request")

    await connection.connect()
    const db = await connection.db("IMS")
    const collection = await db.collection("USER")
    const result = await collection.find({ playing_for: { $exists: true } }).toArray()

    res.json(result)

    connection.close()
})

server.get("/teams", async (req, res) => {
    console.log("Teams list request")

    await connection.connect()
    const db = await connection.db("IMS")
    const collection = await db.collection("TEAM")
    const result = await collection.find().toArray()

    res.status(200).json(result)

    connection.close()
})

server.get("/players/:id/stats", async (req, res) => {
    console.log("Player stats Request")

    if (req.params.id) {
        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("USER")
        const result = await collection.findOne({ "_id": new ObjectId(req.params.id) })
        console.log(result)

        res.status(200).json(result)

        connection.close()
    }

    else {
        res.status(400).json({ message: "Invalid id" })
    }
})

server.get("/manageTeam", async (req, res) => {
    console.log("Team stats Request")

    if (req.headers.token) {

        await connection.connect()
        const db = await connection.db("IMS")
        const collection1 = await db.collection("USER")
        const collection2 = await db.collection("TEAM")

        const result1 = await collection1.find({ "token": req.headers.token}).toArray()
        const owner = result1.owner_of

        const result2 = await collection2.find({ "team_id": owner }).toArray()

        //console.log(result1)
        console.log(result2)

        //if (result1 === result2) {
          //  res.status(200).json(result2)
        //}
        //else {
            //res.status(400).json({ message: "Cannot find your team" })
        //}

        connection.close()
    }
    else{
        res.status(401).json({message: "Invalid token"})
    }

})

server.post("/team", (req, res) => {
    console.log("Team Request")
    res.send("Team created")
})

server.post("/player", (req, res) => {
    console.log("Player Request")
    res.send("Player created")
})

server.listen(8000, () => {
    console.log("Server is listening on port 8000")
})