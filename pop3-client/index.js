import * as tls from 'tls';

let i = 1;

// TLS-yhteyden asetukset
const options = {
    host: 'localhost',
    port: 2525, // Käytä oikeaa porttia, jossa palvelin odottaa TLS-yhteyttä
    rejectUnauthorized: false, // Varmistaa, että hyväksytään vain luotetut palvelimet
    // Voit lisätä sertifikaatin tai muun turvallisuuden tarpeen mukaan
};

const client = tls.connect(options, () => {
    console.log('Yhteys palvelimeen avattu TLS-yhteydellä.');

    // Lähetetään ensimmäinen komento (MAIL FROM)
    client.write('MAIL FROM:owner\r\n');
});

// Vastaa palvelimen lähettämiin viesteihin
client.on('data', (data) => {
    console.log('Palvelin:', data.toString());

    // Lähetetään seuraavat komennot oikeassa järjestyksessä
    switch (i) {
        case 1:
            // Lähetetään USER-komento
            client.write("USER owner\r\n");
            i++;
            break;
        case 2:
            // Lähetetään PASS-komento
            client.write("PASS 123\r\n");
            i++;
            break;
        case 3:
            // Lähetetään LIST-komento
            client.write("LIST\r\n");
            i++;
            break;
        default:
            console.log(`Kaikki komennot on suoritettu.`);
            client.end();  // Suljetaan yhteys, kun kaikki komennot on suoritettu
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
