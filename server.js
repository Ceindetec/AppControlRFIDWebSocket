var http = require("http");
var ws = require("nodejs-websocket");
var fs = require("fs");
var mysql = require('mysql');
var express = require('express');


var encrypt = require('./encrypt.js');
var desencrypt = require('./desencrypt.js');

require('date-utils');

var app = express();
app.set('port', process.env.PORT || 3000);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


var options = {
  host: 'localhost',
  port: 8080,
  path: '/GestionReportes_0.1/services/GestionReportes?method=runJob'
};

http.get(options, function(resp){
  resp.on('data', function(chunk){
    console.log("data");
  });
}).on("error", function(e){
  console.log("Got error: " + e.message);
});


var connectionmysql;


var existe=false;

var server = ws.createServer(function (connection) {

	console.log("[MASTER] NUEVA CONEXIÓN");
	connection.nickname = null
	console.log("[MASTER] NUMERO DE CONEXIONES " + server.connections.length);
	
	if(connection.headers["user-agent"] != "arduino-WebSocket-Client"){
		connection.nickname = makeid();
		connection.permiso = false;
		}else{
		connection.permiso = true;
	}
	
	
	connection.on("text", function (str1) {
		console.log("[MASTER] MENSAJE RECIBIDO "+str1);
		
		// console.log("[MASTER] MENSAJE RECIBIDO ENCRIPTADO "+encrypt.encrypt("{\"sensor\":\"gps\",\"time\":1351824120,\"data\":[48.756080,2.302038]}"));
		
		// console.log("[MASTER] MENSAJE RECIBIDO DESENCRIPTADO "+desencrypt.desencrypt(str1));
		
		
		str = desencrypt.desencrypt(str1);
		if(str!="ERROR"){
			if(connection.permiso){
				var menjson = JSON.parse(str);
				if(menjson.dispositivo !="PC"){
					if(menjson.accion == "presentacion" && connection.nickname === null){
						server.connections.forEach(function (conectado) {
							if(conectado.nickname == menjson.dispositivo){
								console.log("[MASTER] CERRAR");
								conectado.close();
								console.log("[MASTER] NUMERO DE CONEXIONES " + server.connections.length);
								if(!existe){
									existe=true;
								}
							}
						});
						if(!existe){
							confimysqul();
							actualizar_modulo(menjson.dispositivo);
							existe=false;
						}
						connection.nickname = menjson.dispositivo;
					}
					if(menjson.accion == "acceso"){
						confimysqul();
						registraringreso(connection.nickname, menjson.data);
					}
					if(menjson.accion=="acuse"){
						/*mensaje = "true";
						broadcast(str);*/
					}
					if(menjson.accion=="hora"){
						var data = {};
						data.dispositivo = "PC";
						data.accion = "HRO";
						var hoy = new Date();
						var array = [hoy.getHours(), hoy.getMinutes(), hoy.getSeconds() ,hoy.getDate(), hoy.getMonth()+1, hoy.getFullYear() ];
						data.data = array;
						broadcast(encrypt.encrypt(JSON.stringify(data)), connection.nickname);
					}
					if(menjson.accion=="invitado"){
						confimysqul();
						confirmarinvitado(connection.nickname, menjson.data);
					}
				}
				else{
					var data = {};
					
					if(menjson.accion=="INS" || menjson.accion=="DEL"){
						data.dispositivo = "PC";
						data.accion = menjson.accion;
						data.data = menjson.data.tarjeta;
						broadcast(encrypt.encrypt(JSON.stringify(data)), menjson.data.modulo);
					}
					if(menjson.accion=="UPD"){
						data.dispositivo = "PC";
						data.accion = menjson.accion;
						data.data = menjson.data.data;
						data.total = menjson.data.data.length;
						broadcast(encrypt.encrypt(JSON.stringify(data)), menjson.data.modulo);
					}
				}
				}else{
				if(str.indexOf('accion') !=-1){
					menjson = JSON.parse(str);
					if(menjson.accion == "permiso"){
						connection.permiso = true;
						}else{
						connection.close();
					}
					}else{
					connection.close();
				}
				
			}
			}else{
			connection.close();
		}
		
	})
	
	connection.on("close", function () {
		console.log("[MASTER] "+connection.nickname+" ABANDONO");
	})
	
	connection.on("error", function () {
		console.log("[MASTER] ERROR");
	})
	
})
server.listen(8082)

function broadcast(str, modulo) {
	server.connections.forEach(function (connection) {
		if(connection.nickname == modulo){
			console.log("[MASTER] ENVIE MENSAJE");
			connection.sendText(str);
		}
		
		
	})
}

function confimysqul(){
	connectionmysql = mysql.createConnection({
		multipleStatements: true,
		host: 'ceindetec15',
		user: 'admin',
		password: 'Ceidentec1*.',
		database: 'controlrfid',
		port: 3306
	});
}

function actualizar_modulo(modulo){
	
	connectionmysql.connect(function(error){
		if(error){
			console.log('[MASTER] Conexion incorrecta_correcta.');
			}else{
			console.log('[MASTER] Conexion correcta.');
		}
	});
	var query = connectionmysql.query('CALL todosmodulo(?);', [modulo], function(error, result){
		if(error){
			console.log("[MASTER] error en la consulta 1");
			}else{
			var resultado = result;
			var array = [];
			var dataactu = {};
			if(resultado[0].length > 0){
				dataactu.dispositivo = "PC";
				dataactu.accion = "UPD";
				for(i=0;i<result[0].length;i++){
					array.push(result[0][i].func_tarjeta);
				}
				dataactu.data = array;
				dataactu.total = resultado[0].length;
				broadcast(encrypt.encrypt(JSON.stringify(dataactu)), modulo);
				}else{
				console.log('[MASTER] Registro no encontrado');
			}
		}
	}
	);
	connectionmysql.end(function(error){
		if(error){
			console.log('problemas con mysql');
		}
	});
}

function registraringreso(modulorf, tarjeta){
	
	
	if(tarjeta.length < 8){
		var cuanto = 8-tarjeta.length;
		for(i=0;i<cuanto;i++){
			tarjeta = "0"+tarjeta;
		}
	}
	
	connectionmysql.connect(function(error){
		if(error){
			console.log('[MASTER] Conexion incorrecta con mysql.');
			}else{
			console.log('[MASTER] Conexion correcta con mysql.');
		}
	});
	
	var query0 = connectionmysql.query('CALL insacceso(?,?)', [modulorf, tarjeta], function(error, result){
		if(error){
			console.log("[MASTER] error en la consulta 1 " +error);
			}else{
			console.log('[MASTER] acceso registrado');
		}
	});
	
	connectionmysql.end(function(error){
		if(error){
			console.log('[MASTER] problemas con mysql');
		}
		fecha="";
		hora = "";
	});
	
}

function confirmarinvitado(modulorf, tarjeta){
	
	if(tarjeta.length < 8){
		var cuanto = 8-tarjeta.length;
		for(i=0;i<cuanto;i++){
			tarjeta = "0"+tarjeta;
		}
	}
	
	connectionmysql.connect(function(error){
		if(error){
			console.log('[MASTER] Conexion incorrecta con mysql.');
			}else{
			console.log('[MASTER] Conexion correcta con mysql.');
		}
	});
	
	var query0 = connectionmysql.query('CALL invitado(?,?)', [modulorf, tarjeta], function(error, result){
		if(error){
			console.log("[MASTER] error en la consulta 1 " +error);
			}else{
			if(result[0][0].total==1){
			console.log("entre");
				var data = {}
				data.dispositivo = "PC";
				data.accion = "PER";
				data.data = "";
				broadcast(encrypt.encrypt(JSON.stringify(data)), modulorf);
			}
		}
	});
	
	connectionmysql.end(function(error){
		if(error){
			console.log('[MASTER] problemas con mysql');
		}
		fecha="";
		hora = "";
	});
	
}


function makeid()
{
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	
	for( var i=0; i < 16; i++ )
	text += possible.charAt(Math.floor(Math.random() * possible.length));
	
	return text;
}



