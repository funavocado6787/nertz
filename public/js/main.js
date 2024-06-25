const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userNameDiv = document.getElementById('user-name');
const teamsDiv = document.getElementById('lobby-teams');
const userList = document.getElementById('users');
const chatNameDiv = document.getElementById('chat-name');

// Get username and room from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', {username, room});

// Get room and users
socket.on('roomusers', ({room, users}) => {
    outputRoomName(room);
    outputUserName(username);
    outputUsers(users);
})

// User changes team
function changeTeam(team) {
    socket.emit('changeTeam', team);
}

socket.on('teamChange', changeTeam => {
    const username = changeTeam.user.username;
    const team = changeTeam.team;
    if (team != "Spectators") {
        var teamDiv;
        switch(team) {
            case "Team 1":
                teamDiv = ".lobby-team1"
                break;
            case "Team 2":
                teamDiv = ".lobby-team2"
                break;
            case "Team 3":
                teamDiv = ".lobby-team3"
                break;
            case "Team 4":
                teamDiv = ".lobby-team4"
                break;
        }
        for (var i = 1; i <=2 ; i++) {
            if (teamsDiv.querySelector(teamDiv).children[i].innerHTML == "") {
                Array.from(teamsDiv.querySelectorAll('div')).find(el => el.textContent === username).innerHTML = "";
                console.log(Array.from(userList.querySelectorAll('div')).find(el => el.textContent === ""));
                teamsDiv.querySelector(teamDiv).children[i].innerHTML = username;
                break;
            }
        }
    }
    else {
        console.log("spectators");
    }
})

// Handle messages from server
socket.on('message', message => {
    outputMessage(message);

    // Scroll down to most recent message
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// User submits message to chat
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get message text
    const msg = e.target.elements.msg.value;

    // Send message to server
    socket.emit('chatMessage', msg);

    // Clear message in input box
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus;
});

// Output message to DOM
function outputMessage(message) {
    const chatline = document.createElement('div');
    // chatline.classList.add("chat-line");
    chatline.classList.add("row");
    const user = document.createElement('div');
    // user.classList.add("chat-user");
    user.classList.add("col-sm-3");
    user.classList.add("label");
    user.classList.add("text-end");
    const text = document.createElement('div');
    // text.classList.add("chat-text");
    text.classList.add("col-sm-9");
    user.innerHTML = `${message.username}: `;
    text.innerText = `${message.text}`;
    chatline.appendChild(user);
    chatline.appendChild(text);
    document.querySelector('.chat-messages').appendChild(chatline);
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add user name to DOM
function outputUserName(username) {
    userNameDiv.innerText = username;
    chatNameDiv.innerText = username + ":";
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<div>${user.username}</div>`).join('')}
    `;
}