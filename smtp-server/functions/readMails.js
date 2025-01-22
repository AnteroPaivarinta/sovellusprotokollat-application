import fs from 'fs';

export const readMails = (user, socket) => {
    console.log("USER", user, "SOCKET", socket);
  fs.readdir("./Maildir/inbox", (err, files) => {
      files.forEach(file => {
          if(file.includes(user)) {
              fs.readFile(`./Maildir/inbox/${file}`, 'utf8', (err, data) => {
                  if (err) {
                      console.error('Virhe tiedoston lukemisessa:', err);
                      return;
                  }
                  console.log("HALO");
                  socket.write(data);
              });
          }
      });
  })
}

export default readMails;