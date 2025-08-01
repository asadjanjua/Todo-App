const express = require('express')
require('dotenv').config()
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const authRoutes = require('./routes/AuthRoutes')
const todoRoutes = require('./routes/todoRoutes')

app.use(express.json())
app.use(cors())
app.use('/api', authRoutes)
app.use('/api/todos', todoRoutes)

mongoose.connect('mongodb://127.0.0.1:27017/myauth')
.then(() => console.log('connected to mongodb'))
.catch(err => console.error('connection error', err))

app.get('/', (req, res) => {
  res.send('running')
})

app.listen(5000, () => {
  console.log('server is running')
})
