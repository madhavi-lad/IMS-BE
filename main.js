const express = require("express")

const server = express()

server.post("/user", (req, res)=>{
    console.log("User Request")
    res.send("User created")
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