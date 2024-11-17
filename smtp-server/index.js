import net from 'net';
import fs from 'fs';
import readMails from './functions/readMails.js';
// Define the SMTP server port
const PORT = 2525; // Change this to 25 for real servers, 2525 for testing
const inbox = "inbox";
const SEARCH = "SEARCH";
const SELECT = "SELECT";
// List of clients connected to the server
let clients = [];


// Function to handle client connection
const  handleClient = (socket) => {
    let mailData = {
        from: null,
        to: [],
        data: [],
        currentState: "INIT",
        protocol: "",
    };
    let user = "";
    let password = "";
    let authUser = {};
    let jsonData = {};
    let parsedUserData = {};

    let loggedIn = false;

    socket.write('220 SimpleSMTPServer Ready\r\n');

    socket.on('data', (data) => {
        const message = data.toString().trim();
        console.log("Received: ", message);

        // Respond to the HELO command
        if (message.startsWith('HELO')) {
            socket.write('250 Hello, pleased to meet you\r\n');
        }

        // Handle MAIL FROM command
        else if (message.startsWith('MAIL FROM:')) {
            const sender = message.split(':')[1].trim();
            mailData.from = sender;
            mailData.currentState = "MAIL FROM";
            socket.write('250 OK\r\n');
        }

        // Handle RCPT TO command
        else if (message.startsWith('RCPT TO:')) {
            const recipient = message.split(':')[1].trim();
            mailData.to.push(recipient);
            mailData.currentState = "RCPT TO";
            socket.write('250 OK\r\n');
        }

        // Handle DATA command
        else if (message.startsWith('DATA')) {
            socket.write('354 End data with <CR><LF>.<CR><LF>\r\n');
            mailData.currentState = "DATA";
        }

        // Collect email body data
        else if (mailData.currentState === "DATA") {
            if (message === '.') {
                // End of DATA, process the email
                socket.write('250 OK Message accepted for delivery\r\n');
                mailData.currentState = "COMPLETED";
                jsonData = JSON.stringify(mailData, null, 2);
                // Save message to a file (can be adjusted as needed)
                for(let i = 0; i < mailData.to.length; i++) {
                    fs.writeFileSync(`inbox/${mailData.to[i]}-${Date.now()}.json`, jsonData);
                }
                // Clear data for next email
                mailData = { from: null, to: [], data: [], currentState: "INIT" };
            } else {
                // Collect message lines
                mailData.data.push(message);
            }
        }

        else if (message.startsWith('USER')) {
            mailData.currentState = "USER";
            user = message.split(" ")[1];
            socket.write('221 OK\r\n');
        }

        else if (message.startsWith('PASS')) {
            password =  message.split(" ")[1];
            const data = fs.readFileSync(`./users/${user}.json`, 'utf8');
            const parsedUserData = JSON.parse(data);
            if(parsedUserData.user == user && parsedUserData.password == password){
                authUser = {user: user, password: password};
                socket.write('221 OK\r\n');      
            } else {
                socket.write('221 ERROR\r\n');   
            }            
        }

        else if (message.startsWith('LIST')) {
            if(authUser.user && authUser.password) {
                readMails(authUser.user);
            }
            socket.write('221 OK\r\n');
        }

        // Handle QUIT command
        else if (message.startsWith('QUIT')) {
            socket.write('221 Bye\r\n');
            socket.end();
        }

        else if(message.startsWith("A001")){
            const cmd = message[1].toUpperCase();
            if(cmd == "LOGIN") {
                const username = message[2];
                const password = message[3];
                const data = fs.readFileSync(`./users/${username}.json`, 'utf8');
                const parsedUserData = JSON.parse(data);
                if(parsedUserData.user == user && parsedUserData.password == password){
                    authUser = {user: user, password: password};
                    socket.write('221 OK\r\n');      
                } else {
                    socket.write('221 ERROR\r\n');   
                }   
            }
        }

        else if(message.startsWith("A002")) {
            const cmd = message[1].toUpperCase();
            if(cmd === "LIST") {
                const username = message[2];
                const password = message[3];
                const data = fs.readFileSync(`./users/${username}.json`, 'utf8');
                const parsedUserData = JSON.parse(data);
                if(parsedUserData.user === user && parsedUserData.password === password){
                    authUser = {user: user, password: password};
                    socket.write('221 OK\r\n');      
                } else {
                    socket.write('221 ERROR\r\n');   
                }   
            }

            else if(cmd === SELECT && message[2].toUpperCase() === inbox) {
                 mailData.currentState = "inbox";
            }
            else if(cmd == SEARCH && mailData.currentState === inbox){
                const messageData = message[2].toUpperCase();
                if(messageData === "ALL") {
                    readMails(authUser.user);
                } 
            }
        }

        else if(message.startsWith("A003")) {
            const cmd = message[1].toUpperCase();
            if(cmd == "LOGOUT") {
                socket.write(`* BYE IMAP4rev1 Server logging out\r\n`);
                socket.end();
            }
        }
        // Unrecognized command
        else {
            socket.write('500 Unrecognized command\r\n');
        }
    });

    // Handle socket close
    socket.on('close', () => {
        console.log('Client disconnected.');
    });

    // Handle socket error
    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
};

// Create the server and listen on the specified port
const server = net.createServer(handleClient);

server.listen(PORT, () => {
    console.log(`SMTP Server listening on port ${PORT}`);
});
