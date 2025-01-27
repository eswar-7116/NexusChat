import express from 'express'

const app = express()

app.use('/', (req, _, next) => {
    console.log(`${req.method} request to ${req.url}`)
    next()
})

app.listen(5000, '0.0.0.0', () => {
    console.log("Server started at http://localhost:5000")
})