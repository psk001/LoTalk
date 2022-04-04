const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = 3000 || process.env.PORT

app.use(express.static(path.join(__dirname, 'public')))

const botName = 'LoTalk Bot'

// run when client joins
io.on('connection', socket => {
    // console.log('new client has joined')

    socket.on('joinRoom', ({username, room}) => {
        
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        // welcomes current user
        socket.emit('message', formatMessage(botName, 'Welcome to LoTalk'))

        // broadcast message when user joins
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `${user.username} has joined`))

        // sending users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })



    // listening to event of getting chat message
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    // runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if(user){
            io.to(user.room).emit('message', formatMessage(botName, ` ${user.username} has left the chat`))
        }

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
        
    })

})

app.get('/', (req, res) => {
    res.render('index.html')
})


server.listen(PORT)