const { MongoClient, ObjectId, SeverityLevel } = require("mongodb")
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
            res.status(401).json("User already exist!")


        else {
            await collection.insertOne({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone
            })
            res.status(200).json({ message: "User created successfully!" })
        }

        connection.close()
    }
    else {
        res.status(400).json({ message: "Please fill all the fields!" })
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


//dashboard
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

            console.log(roles)

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


//players;s list
server.get("/players", async (req, res) => {
    console.log("Players list request")

    await connection.connect()
    const db = await connection.db("IMS")
    const collection = await db.collection("USER")
    const result = await collection.find({ playing_for: { $exists: true } }).toArray()

    res.json(result)

    connection.close()
})


//team's list
server.get("/teams", async (req, res) => {
    console.log("Teams list request")

    await connection.connect()
    const db = await connection.db("IMS")
    const collection = await db.collection("TEAM")
    const result = await collection.find().toArray()

    res.status(200).json(result)

    connection.close()
})


//player stats
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

//team of owner
server.get("/manageTeam", async (req, res) => {
    console.log("Team stats Request")

    if (req.headers.token) {

        await connection.connect()
        const db = await connection.db("IMS")
        const collection1 = await db.collection("USER")
        const collection2 = await db.collection("TEAM")

        const result1 = await collection1.findOne({ "token": req.headers.token })
        const owner = result1.owner_of

        const result2 = await collection2.findOne({ "team_id": owner })

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

//update team by owner 
server.put("/update", async (req, res) => {
    console.log("Team update Request")

    if (req.headers.team_id) {

        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("TEAM")
        const result = await collection.findOne({ "team_id": req.headers.team_id })
        console.log(result)

        await collection.updateOne(
            { team_id: req.headers.team_id },
            {
                $set: {
                    name: req.body.name,
                    owner: req.body.owner,
                    logo: req.body.logo,
                    color: req.body.color
                }
            })

        res.status(200).json({ message: "updated" })

        connection.close()


    }
    else {
        res.status(400).json("Cannot find your team")
    }

})


// add team by admin
server.post("/addTeam", async (req, res) => {
    console.log("Add Team Request")
    console.log(req.body.team_id)

    if (req.body.team_id && req.body.name && req.body.owner && req.body.state) {

        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("TEAM")

        const result = await collection.find({ "team_id": req.body.team_id }).toArray()
        console.log(result)

        if (result.length > 0) {
            res.status(401).json("Team id already exists!")
        }
        else {
            await collection.insertOne({
                team_id: req.body.team_id,
                name: req.body.name,
                owner: req.body.owner,
                state: req.body.state
            })

            res.status(200).json("Team created sucessfully")
        }

        connection.close()

    }
    else {
        res.status(400).json("All fields are required")
    }

})


//remove player from the team by admin
server.get("/removePlayer", async (req, res) =>{
    console.log("Remove player request")

    if(req.body.team_id && req.body.players){

        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("TEAM")

        const player = await collection.find({"team_id": req.body.team_id, "players": req.body.players }).toArray()
        
        if(player.length > 0){
            await collection.updateOne(
                { team_id: req.body.team_id },
                { $pull: { players: req.body.players } }
            )

            res.status(200).json("Player deleted")

            connection.close()
        }
        else{
            res.status(400).json("Player not found in the team")
        }

    }
    else{
        res.status(400).json("Player not found in the team")
    }
})

// add player by admin
server.post("/addPlayer", async (req, res) => {
    console.log("Add Player Request")

    if (req.body.name && req.body.playing_for) {

        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("TEAM")
        const result = await collection.findOne({ "team_id": req.body.playing_for })
        const player = await collection.find({ "team_id": req.body.playing_for , "players": req.body.name }).toArray()
        console.log(player)

        if (player.length > 0) {
            res.status(401).json("Player already exist in the team")
        }

        else {
            await collection.updateOne(
                { team_id: req.body.playing_for },
                { $push: { players: req.body.name } }
            )

            res.status(200).json("Player added")

            connection.close()
        }

    }

    else {
        res.status(400).jaon("All fields are required")
    }
})

//remove the team from list
server.delete("/deleteTeam", async (req, res) => {
    console.log("Remove team Request")
    console.log(req.body)

    if(req.body.team_id){
        await connection.connect()
        const db = await connection.db("IMS")
        const collection = await db.collection("TEAM")
        const result = await collection.findOne( {"team_id": req.body.team_id , name: req.body.name})
        console.log(result)

        if(result){
            await collection.deleteOne({team_id: req.body.team_id})

            res.status(200).json("Team deleted")

        }
        else{
            res.status(400).json("Team not found!")
        }

        connection.close()
    }

    else{
        res.status(401).json("Team_id missing!")   
    }
})


// view players in team
server.get("/:id/viewPlayers", async (req, res) =>{
    console.log("View players request")
    console.log(req.params.id)

    await connection.connect()
    const db = await connection.db("IMS")
    const collection = await db.collection("USER")
    const result = await collection.find({ "playing_for": req.params.id }).toArray()
    console.log(result)

    if(result.length > 0)
        res.status(200).json(result)

    else
        res.status(400).json("Players not found!")
})

server.listen(8000, () => {
    console.log("Server is listening on port 8000")
})