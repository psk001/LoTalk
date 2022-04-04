const socket = io() // comes from script tag from chat.html
const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

// getting username and room from link
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
})



socket.on('message', message => {
    console.log(message) 
    outputMessage(message)

    // scroll to bottom on sending text
    chatMessages.scrollTop=chatMessages.scrollHeight
})

// EVENT join room

socket.emit('joinRoom', {username, room} )

// get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

// event listener to handle message submit
chatForm.addEventListener('submit', (event) => {
    event.preventDefault()

    const msg = event.target.elements.msg.value
    
    // emits message to server
    socket.emit('chatMessage', msg)

    // clear input box
    event.target.elements.msg.value = ''
    event.target.elements.msg.focus() 

})


// outputs message to chat box

function outputMessage(message) {
    const div =document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `
        <p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">
           ${message.text}
        </p>    
    `
    // console.log(div)
    document.querySelector('.chat-messages').appendChild(div)
}


// add room name to dom
function outputRoomName(room){
    roomName.innerText = room   
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

