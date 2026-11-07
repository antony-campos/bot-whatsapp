const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
        headless: true
    }
});

const countryCode = '51';
const phoneNumber = ''; // Tu número donde te logueas
const msg = "BOT LOGEADO CON EXITO";

// AQUÍ CAMBIAS EL NÚMERO CADA VEZ QUE QUIERAS
const targetCountryCode = '51';
const targetPhoneNumber = ''; // <--- Pon el nuevo número de 9 dígitos
const targetFullNumber = targetCountryCode + targetPhoneNumber;

// Variable global donde guardaremos el ID real (ya sea @c.us o @lid) al iniciar
let targetChatId = null;

client.initialize();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Apenas arranca, buscamos y guardamos el ID oficial de ese número automáticamente
client.on('ready', async () => {
    console.log('El cliente está listo');

    try {
        const contactIdInfo = await client.getNumberId(targetFullNumber);
        if (contactIdInfo) {
            targetChatId = contactIdInfo._serialized;
            console.log(`✅ ID objetivo configurado automáticamente: ${targetChatId}`);
        } else {
            console.log(`⚠️ Advertencia: El número ${targetFullNumber} no parece tener WhatsApp activo o registrado.`);
            // Plan B por si el getNumberId falla: armamos el estándar de respaldo
            targetChatId = targetFullNumber + '@c.us';
        }
    } catch (error) {
        console.error('Error al obtener el ID del número:', error);
        targetChatId = targetFullNumber + '@c.us';
    }
});

client.on('message', async (message) => {
    // 0. Descartamos estados e historias
    if (message.from === 'status@broadcast') return;

    // 1. Validamos usando el ID dinámico que guardamos al iniciar (o si incluye el número en el LID)
    const esObjetivo = message.from === targetChatId || message.from.includes(targetPhoneNumber);

    if (!esObjetivo) {
        return; // Si no es el nuevo número, lo ignoramos
    }

    // 2. Si es la persona correcta, procesamos y respondemos
    const texto = message.body.toLowerCase().trim();
    console.log(`¡Mensaje aceptado del nuevo objetivo!: "${texto}"`);

    if (texto === 'hola' || texto === 'buenos dias') {
        await message.reply('¡Hola! Escribe "ayuda" para ver las opciones disponibles 🤖');
    } 
    else if (texto === 'ayuda') {
        await message.reply('Opciones disponibles:\n- hola\n- chiste\n- que haces');
    } 
    else if (texto === 'chiste') {
        await message.reply('¿Qué hace una abeja en el gimnasio? ¡Zumba! 🐝');
    } 
    else if (texto.includes('que haces')) {
        await message.reply('Este es un bot que responde automáticamente.');
    } 
    else {
        await message.reply('Hola! Este es un mensaje automático 🤖');
    }
});