const libExpress = require("express")
const cors = require("cors")
const server = libExpress()
server.use(cors())

server.post("/user", (req, res)=>{
    console.log("user request")
    res.send("user is created")
})

server.get("/user", (req, res)=>{
    console.log("user request")
    res.json(
        [   {name: "usr1"},
            {name: "user2"},
            {name: "user3"}
        ]
    )
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