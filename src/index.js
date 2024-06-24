const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const requestRouter = require('./routers/request')


const app = express()
const port = process.env.port || 3000



app.use(express.json())
app.use(userRouter)
app.use(requestRouter)


app.listen(port, ()=>{
    console.log(`server is up on port ${port}`);
})


