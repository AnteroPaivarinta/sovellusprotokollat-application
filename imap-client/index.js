// client.js
import { createConnection } from 'net';
import * as tls from 'tls';

let i = 1;

const options = {
    host: 'localhost',
    port: 2525, // Käytä oikeaa porttia, jossa palvelin odottaa TLS-yhteyttä
    rejectUnauthorized: false, // Varmistaa, että hyväksytään vain luotetut palvelimet
    // Voit lisätä sertifikaatin tai muun turvallisuuden tarpeen mukaan
};

const client = tls.connect(options, () => {
    console.log('Yhteys palvelimeen avattu TLS-yhteydellä.');
    // Lähetetään viesti palvelimelle
    client.write('MAIL FROM:owner\r\n');
});
// Vastaa palvelimen lähettämiin viesteihin
client.on('data', (data) => {
    console.log('Palvelin:', data.toString());
    // Suljetaan yhteys viestin vastaanottamisen jälkeen
    //client.end();
    switch (i) {
        case 1:
            client.write('A001 LOGIN owner 123');
            i++
            break;
        case 2:
            client.write('A002 SELECT inbox');
            i++
            break;
        case 3:
            client.write('A003 SEARCH ALL');
            i++
            break;
        case 4:
            client.write('A004 FETCH 1:* (BODY[])');
            i++
            break;
        default:
          console.log(`Sorry, we are out of ${i}.`);
    }
});

// Virheiden käsittely
client.on('error', (err) => {
    console.error('Virhe:', err.message);
});

// Yhteyden sulkeminen
client.on('end', () => {
    console.log('Yhteys suljettu.');
});
