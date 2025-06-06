const { MongoClient, Admin, Collection, ObjectId } = require("mongodb")
const libRandomString = require("randomstring")
const libExpress = require("express")
const cors = require("cors")
const server = libExpress()
server.use(cors())
server.use(libExpress.json()) //converts into json format

const connection = new MongoClient("mongodb://Madhavi:madhavi05@localhost:27017/IMS?authSource=IMS")

//user signup
server.post("/user", async (req, res) => {
    //console.log("user request")

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
            res.json("User created successfully!")
        }

        connection.close()
    }

    else {
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
server.post("/token", async (req, res) => {
    console.log("user request")

    if (req.body.email && req.body.password) {
        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("USER")
        const result = await collection.find({ "email": req.body.email, "password": req.body.password }).toArray()

        if (result.length > 0) {
            // genetare token
            const generatedToken = libRandomString.generate(6)

            // register token against user
            const user = result[0]

            await collection.updateOne(
                { _id: user._id },
                { $set: { token: generatedToken } }
            )

            // return token to user
            res.status(200).json({ token: generatedToken })
        }
        else {
            res.status(400).json({ message: "Invalid email or password" })
        }

        connection.close()
    }

    else {
        res.status(401).json({ message: "All fields are required" })
    }

})


// user role
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
            res.status(401).json({ message: "Invalid token" })
        }

        connection.close()

    }
    else {
        res.status(401).json({ message: "Unauthorized" })
    }
})


server.get("/players", async (req, res) => {

    await connection.connect()
    const db = await connection.db("IMS")
    const collection = await db.collection("USER")
    const result = await collection.find({ playing_for: { $exists: true } }).toArray()

    res.status(200).json(result)

    connection.close()
})

server.get("/teams", async (req, res) => {

    await connection.connect()
    const db = await connection.db("IMS")
    const collection = await db.collection("TEAM")
    const result = await collection.find().toArray()

    res.status(200).json(result)

    connection.close()
})

server.get("/players/:id/stats", async (req, res) => {

    console.log("stats req")

    if (req.params.id) {
        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("USER")
        const result = await collection.findOne({ "_id": new ObjectId(req.params.id) })

        res.status(200).json(result)

        connection.close()
    }

    else {
        res.status(400).json({ message: "Bad Request" })
    }

})

server.get("/manageTeam", async (req, res) => {
    console.log("Team stats Request")

    if (req.headers.token) {

        await connection.connect()
        const db = await connection.db("IMS")
        const collection1 = await db.collection("USER")
        const collection2 = await db.collection("TEAM")

        const result1 = await collection1.find({ "token": req.headers.token }).toArray()
        const user = result1[0]
        console.log(user.owner_of)

        const result2 = await collection2.findOne({ "team_id": user.owner_of })


        if (result2) {
            res.status(200).json(result2)
        }
        else {
            res.status(400).json({ message: "Cannot find your team" })
        }

        connection.close()
    }
    else {
        res.status(401).json({ message: "Invalid token" })
    }

})


server.post("/createTeam", async (req, res) => {
    console.log("create team request")

    if (req.body.name && req.body.owner && req.body.team_id && req.body.color && req.body.logo) {
        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("TEAM")
        const result = await collection.find({ "team_id": req.body.team_id }).toArray()

        if (result.length > 0)
            res.json("Team already exist!")

        else {
            await collection.insertOne({
                name: req.body.name,
                owner: req.body.owner,
                team_id: req.body.team_id,
                color: req.body.color,
                logo: req.body.logo

            })
            res.json("Team created successfully!")
        }

        connection.close()
    }

    else {
        res.json("Please fill all the fields!")
    }

})

server.post("/createPlayer", async (req, res) => {
    console.log("player request")

    if (req.body.name && req.body.email && req.body.password && req.body.phone && req.body.playing_for && req.body.profile) {
        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("USER")
        const result = await collection.find({ "email": req.body.email }).toArray()

        if (result.length > 0)
            res.json("Player already exist!")

        else {
            await collection.insertOne({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone,
                playing_for: req.body.playing_for,
                profile: req.body.profile
                
            })
            res.json("Player created successfully!")
        }

        connection.close()
    }

    else {
        res.json("Please fill all the fields!")
    }

})

server.listen(8000, () => {
    console.log("Server is running on port 8000")
})

//    C:\dev\IMS-BE