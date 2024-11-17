// client.js
import { createConnection } from 'net';


let i = 1;

const client = createConnection(2525, 'localhost', () => {
    console.log('Yhteys palvelimeen avattu.');
    // Lähetetään viesti palvelimelle
    client.write('MAIL FROM:owner');
});

// Vastaa palvelimen lähettämiin viesteihin
client.on('data', (data) => {
    console.log('Palvelin:', data.toString());
    // Suljetaan yhteys viestin vastaanottamisen jälkeen
    //client.end();
    switch (i) {
        case 1:
            client.write('RCPT TO:owner');
            i++
            break;
        case 2:
            client.write('DATA');
            i++
            break;
        case 3:
            client.write('Hello there');
            i++
            break;
        case 4:
            client.write('.');
            i++
            break;
        case 5:
            client.write("USER owner");
            i++
            break;
        case 6:
            client.write("PASS 123");
            i++
            break;
        case 7:
            client.write("LIST");
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
