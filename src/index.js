const app = require('express')();
const http = require('http').createServer(app);
// const io = require('socket.io')(http, { port: 3000, path: '/ws', origins: '*:*', 
//     handlePreflightRequest: (req, res) => {
//         const headers = {
//             "Access-Control-Allow-Headers": "Content-Type, Authorization",
//             "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
//             "Access-Control-Allow-Credentials": true
//         };
//         res.writeHead(200, headers);
//         res.end();
//     }
// });
const io = require('socket.io')(http, { port: 3000, origins: '*:*'});
io.origins((origin, callback) => {
    callback(null, true);
});
const port = 3000;


const JSONDBHelper = require('./JSONDBHelper');
const JSONDB = new JSONDBHelper('./src/db.json');

const readline = require('readline-sync');
const { get } = require('http');
// const streamingUrl = readline.question('URL of audio stream: ');

const streamingUrl = "http://192.168.178.16:4000/stream/swyh.mp3";
// const streamingUrl = "http://icecast.omroep.nl/funx-bb-mp3";

const setCORSsettings = require('./cors').setCORSsettings;

setCORSsettings(app);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/streaming-info', async (req, res) => {
    let streamingUrl = await JSONDB.getData('streamingUrl');
    console.log(streamingUrl);
    
    let streamLeader = await JSONDB.getData('currentUsers') > 1 ? false : true;

    res.send({
        streamingUrl,
        streamLeader
    });
});

app.post('/readyToPlay', async (req, res) => {
    let currentlyReadyUsers = await JSONDB.getData(DataProperties.readyClients);

    if (!currentlyReadyUsers && currentlyReadyUsers !== 0) currentlyReadyUsers = 0;
    
    currentlyReadyUsers++;

    await JSONDB.upsertProperty(DataProperties.readyClients, currentlyReadyUsers);

    if (currentlyReadyUsers === clientCount()) {
        io.emit('goPlay');
    }

    io.emit('readyUsersChange', currentlyReadyUsers);
    console.log(currentlyReadyUsers);
    
    res.status(204);
});

http.listen(port);

http.on('listening', async () => {
    const succesfull = await JSONDB.initDB();
    
    if (!succesfull) {
        throw new Error('Something went wrong when initializing the JSON DB');
    }

    try {
        await JSONDB.upsertProperty('streamingUrl', streamingUrl);
        await JSONDB.upsertProperty('currentUsers', 0);
        await JSONDB.upsertProperty(DataProperties.readyClients, 0);
    } catch (error) {
        throw new Error(error);
    }
});

io.on('connection', async (socket) => {
    console.log('a user connected');
    try {
        await JSONDB.upsertProperty('currentUsers', clientCount());
    } catch (error) {
        throw new Error(error);
    }
    io.emit('currentUserChange', clientCount());

    socket.on('play', () => {
        io.emit('startPlaying');
    });
});
  
io.on('disconnect', async (socket) => {
    console.log('a user disconnected');
    try {
        await JSONDB.upsertProperty('currentUsers', clientCount());
    } catch (error) {
        throw new Error(error);
    }
    io.emit('currentUserChange', clientCount());
});

function clientCount() {
    return io.sockets.server.engine.clientsCount;
}

const DataProperties = {
    currentUsers: 'currentUsers',
    streamingUrl: 'streamingUrl',
    readyClients: 'readyClients'
}
  
