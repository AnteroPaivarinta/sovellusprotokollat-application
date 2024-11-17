import net from 'net';
import fs from 'fs';
import readMails from './functions/readMails.js';
import tls from 'tls';
import nodemailer from 'nodemailer';
import readDirs from './functions/readDirs.js';



const options = {
    key: fs.readFileSync('private-key.pem'),  // Yksityinen avain
    cert: fs.readFileSync('certificate.pem'), // Sertifikaatti
};

// Define the SMTP server port
const PORT = 2525; // Change this to 25 for real servers, 2525 for testing
const inbox = "inbox";
const SEARCH = "SEARCH";
const SELECT = "SELECT";
// List of clients connected to the server


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
    let authUser = null;
    let jsonData = {};
    const ipAddr = socket.remoteAddress;
    const blackList = [];
    if(blackList.includes(ipAddr)){
        socket.write('550 Sender IP is blacklisted\r\n');
        console.log("??????")
       // socket.end();
    }

    socket.write('220 SimpleSMTPServer Ready\r\n');

    socket.on('data', (data) => {
        const message = data.toString().trim().replace(/\r\n|\n|\r/g, '');;

        const messageParts = message.trim().split(" ");
        let cmd = messageParts[1];
        console.log("Received: ", message);

        if (messageParts[0].startsWith('HELO')) {
            socket.write('250 Hello, pleased to meet you\r\n');
        }

        else if (messageParts[0].startsWith('MAIL FROM:')) {
            const sender = message.split(':')[1].trim();
            mailData.from = sender;
            mailData.currentState = "MAIL FROM";
            socket.write('250 OK\r\n');
        }

        else if (messageParts[0].startsWith('RCPT TO:')) {
            const recipient = message.split(':')[1].trim();
            mailData.to.push(recipient);
            mailData.currentState = "RCPT TO";
            socket.write('250 OK\r\n');
        }

        // Handle DATA command
        else if (messageParts[0].startsWith('DATA')) {
            socket.write('354 End data with <CR><LF>.<CR><LF>\r\n');
            mailData.currentState = "DATA";
        }

        // Collect email body data
        else if (mailData.currentState === "DATA") {
            if (message === '.') {
                socket.write('250 OK Message accepted for delivery\r\n');
                mailData.currentState = "COMPLETED";
                jsonData = JSON.stringify(mailData, null, 2);
                for(let i = 0; i < mailData.to.length; i++) {
                    fs.writeFileSync(`Maildir/inbox/${mailData.to[i]}-${Date.now()}.json`, jsonData);
                }
                mailData = { from: null, to: [], data: [], currentState: "INIT" };
            } else {
                // Collect message lines
                mailData.data.push(message);
            }
        }

        else if (messageParts[0].startsWith('USER')) {
            mailData.currentState = "USER";
            user = messageParts[1];
            socket.write('221 OK SENT USER\r\n');
        }


        else if (messageParts[0].startsWith('PASS')) {
            password =  messageParts[1];
            console.log("???", user)
            console.log("???", password+".")
            const data = fs.readFileSync(`./users/${user}.json`, 'utf8');
            const parsedUserData = JSON.parse(data);
            console.log(parsedUserData.password === password, parsedUserData.password.length, password.length);
            if(parsedUserData.user === user && parsedUserData.password === password){
                authUser = {user: user, password: password};
                socket.write('221 OK AUTHENTICATED\r\n');      
            } else {
                socket.write('221 ERROR UNAUTH\r\n');   
            }            
        }

        else if (messageParts[0].startsWith('LIST')) {
            if(authUser.user && authUser.password) {
                readMails(authUser.user, socket);
            }
            socket.write('221 OK\r\n');
        }

        // Handle QUIT command
        else if (messageParts[0].startsWith('QUIT')) {
            socket.write('221 Bye\r\n');
            //socket.end();
        }

        //IMAP
        else if(cmd === "LOGIN"){
            const username = messageParts[2];
            const password = messageParts[3];
            
            const data = fs.readFileSync(`./users/${username}.json`, 'utf8');
            const parsedUserData = JSON.parse(data);

            if(parsedUserData.user == username && parsedUserData.password == password){
                authUser = {user: user, password: password};
                socket.write('221 OK LOGIN COMPLETED\r\n');      
            } else {
                socket.write('221 ERROR FAILED LOGIN\r\n');   
            }   
        }

        else if(cmd === "LIST" && authUser) {

           readDirs(socket);
        }
        else if(cmd ===  SELECT && messageParts[2] === inbox) {
            mailData.currentState = inbox;
        }
        else if(cmd === "FETCH" && messageParts[2] === "1:*" && messageParts[3] === "(BODY[])" ){
            console.log("HALOO", mailData.currentState === inbox)
            if( mailData.currentState === inbox) {
                readMails(authUser.user, socket);
            } else {
                socket.write('221 ERROR\r\n');
            }
        }

        else if(cmd === "LOGOUT") {
            socket.write(`* BYE IMAP4rev1 Server logging out\r\n`);
            //socket.end();
        }
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
const server = tls.createServer(options, handleClient);

server.listen(PORT, () => {
    console.log(`SMTP Server listening on port ${PORT}`);
});
