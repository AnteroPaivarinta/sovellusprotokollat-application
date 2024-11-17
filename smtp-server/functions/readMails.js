import fs from 'fs';

export const readMails = (user, socket) => {
    console.log("USER", user, "SOCKET", socket);
  fs.readdir("./Maildir/inbox", (err, files) => {
    console.log("HALO12342343");
      files.forEach(file => {
        console.log("HALO13");
          if(file.includes(user)) {
            console.log("HALO1");
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