/**
 * Created by noamc on 8/31/14.
 */
var binaryServer = require('binaryjs').BinaryServer;
var wav          = require('wav');
var connect      = require('connect');
var serveStatic  = require('serve-static');

/* MP3 CONVERSION */
var path     = require("path");
var fs       = require("fs");
var exec     = require('child_process').exec;

var convertToMP3 = function( file ){

    var child    = exec( '/opt/local/bin/lame -b 192 ' + file );    

    child.stdout.on('data', function(data) {
      console.log('stdout: ' + data);
    });
    child.stderr.on('data', function(data) {
      console.log('stdout: ' + data);
    });
    child.on('close', function( code ) {
        if ( code === 0 ){ 
            console.log("Success!"); 
        } else {
            console.log( code );
        }
    });
    
}

//* MP3 CONVERSION */

connect().use(serveStatic('.')).listen(8080);

var server = binaryServer({port: 9001});

server.on('connection', function(client) {
    console.log("new connection...");
    var fileWriter = null;
    var fileName;

    client.on('stream', function(stream, meta) {
        console.log("Stream Start")
            fileName = "recordings/"+ new Date().getTime()  + ".wav"
            fileWriter = new wav.FileWriter(fileName, {
            channels: 1,
            sampleRate: 44100,
            bitDepth: 16
        });
        stream.pipe(fileWriter);
    });

    client.on('close', function() {
        if ( fileWriter !== null ) fileWriter.end();
        console.log("Connection Closed");
        convertToMP3( fileName );
    });
});
