import fs from 'fs';
import path from 'path';

export const readDirs = (socket) => {
    const maildirPath = "./Maildir";
    const arr = []
    fs.readdir(maildirPath, (err, files) => {
        if (err) {
            console.error('Virhe hakemiston lukemisessa:', err);
            return;
        }

        files.forEach((file, index) => {
            const fullPath = path.join(maildirPath, file);

            fs.stat(fullPath, (err, stats) => {
                if (err) {
                    console.error(`Virhe tarkistettaessa kohdetta ${file}:`, err);
                    return;
                }

                if (stats.isDirectory()) {
                    socket.write(index+ 1500);
                    arr.push(file);
                }
            });
        });
    });
    return arr;
};

export default readDirs;
