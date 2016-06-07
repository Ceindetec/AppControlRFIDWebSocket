var http = require("http");
var ws = require("nodejs-websocket");
var fs = require("fs");
var mysql = require('mysql');

http.createServer(function (req, res) {
	//fs.createReadStream("index.html").pipe(res)
}).listen(8080);


/*var connection = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'node_mysql',
   port: 3306
});*/

var remitenten="";

var server = ws.createServer(function (connection) {
	connection.nickname = null
	connection.on("text", function (str) {
		if (connection.nickname === null) {
			connection.nickname = str
			remitenten = connection.nickname; 
			broadcast(str+" entered")
		} else{
			remitenten = connection.nickname; 
			broadcast("["+connection.nickname+"] "+str)
		}
	})
	connection.on("close", function () {
		broadcast(connection.nickname+" left")
	})
})
server.listen(8081)

function broadcast(str) {
	server.connections.forEach(function (connection) {
		if(connection.nickname != remitenten)
			connection.sendText(str)
	})
}


/*
connection.connect(function(error){
   if(error){
      throw error;
   }else{
      console.log('Conexion correcta.');
   }
});
var query = connection.query('SELECT nombre, apellido, biografia FROM personaje WHERE personaje_id = ?', [1], function(error, result){
      if(error){
         throw error;
      }else{
         var resultado = result;
         if(resultado.length > 0){
            console.log(resultado[0].nombre + ' ' + resultado[0].apellido + ' / ' + resultado[0].biografia);
         }else{
            console.log('Registro no encontrado');
         }
      }
   }
);
connection.end();
*/