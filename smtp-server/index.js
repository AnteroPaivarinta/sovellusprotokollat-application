import net from 'net';
import fs from 'fs';

// Define the SMTP server port
const PORT = 2525; // Change this to 25 for real servers, 2525 for testing

// List of clients connected to the server
let clients = [];
// Function to handle client connection
const  handleClient = (socket) => {
    let mailData = {
        from: null,
        to: [],
        data: [],
        currentState: "INIT"
    };
    let user = "";
    let password = "";
    let authUser = {};
    let jsonData = {};
    let parsedUserData = {};

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
                fs.readdir("./inbox", (err, files) => {
                    files.forEach(file => {
                        if(file.includes(authUser.user)) {
                            fs.readFile(`./inbox/${file}`, 'utf8', (err, data) => {
                                if (err) {
                                    console.error('Virhe tiedoston lukemisessa:', err);
                                    return;
                                }
                        
                                socket.write(data);
                            });
                        }
                    });
                })
            }
            socket.write('221 OK\r\n');
        }

        // Handle QUIT command
        else if (message.startsWith('QUIT')) {
            socket.write('221 Bye\r\n');
            socket.end();
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
