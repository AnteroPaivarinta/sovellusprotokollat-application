export const readMails = (user) => {
  fs.readdir("./inbox", (err, files) => {
      files.forEach(file => {
          if(file.includes(user)) {
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

export default readMails;