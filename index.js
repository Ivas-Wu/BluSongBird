const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = 3001 // Changed off port 3000 cause thats where I was running UI

// parse application/json
app.use(bodyParser.json())

// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// Allow requests from http://localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
}));

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.get('/posts', db.getAllPosts)
app.get('/posts/:id', db.getPostByUserId)
app.get('/replies/:id', db.getReplies)
app.get('/replies/:id', db.getRepliesId)

app.post('/posts', db.createPost)
app.post('/replies', db.createReply)

app.put('/posts/:id', db.updatePost)
app.put('/replies/:id', db.updateReply)

app.delete('/posts/:id', db.deletePost)
app.delete('/replies/:id', db.deleteReply)


app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})