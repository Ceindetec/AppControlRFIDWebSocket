
var TAG_ERROR = "ERROR";

var claveMochila = [335916, 428891, 866985, 2139945, 4385521, 8713045, 17162809, 34033702];

function desencrypt(mensaje) {
	
	var mensajeOriginal = "";
	var auxiliarComprobacion = "";
	var auxiliarBinario = "";
	var mensajeCifrado = "";
	var caracterDecimalAscii = "";
	var mensajeDescifrado = "";

    mensajeOriginal = mensaje.trim();

    if (mensajeOriginal.length) {

        mensajeCifrado = mensajeOriginal.split(" ");

        //Recorre todo el mensaje para validarlo y decodificarlo
        for (i = 0; i < mensajeCifrado.length; i++) {

            //Toma el valor actual del mensaje para verificar la validez del mensaje
            auxiliarComprobacion = parseFloat(mensajeCifrado[i]);

            //Reinicia el valor del auxiliar Binario
            auxiliarBinario = "";

            //Recorre la mochila para la decodificacion del mensaje
            for (j = claveMochila.length - 1; j >= 0; j--) {

                if (auxiliarComprobacion > 0) {

                    if (auxiliarComprobacion >= claveMochila[j]) {

                        auxiliarComprobacion = parseFloat(auxiliarComprobacion) - parseFloat(claveMochila[j]);

                        auxiliarBinario = "1" + auxiliarBinario;


                    } else {

                        auxiliarBinario = "0" + auxiliarBinario;
                    }


                }

            }

            if (auxiliarComprobacion === 0) {

                caracterDecimalAscii = String.fromCharCode(parseInt(auxiliarBinario, 2));

                mensajeDescifrado = caracterDecimalAscii + mensajeDescifrado;


            } else {

                return TAG_ERROR;

                break;

            }

        }

        return mensajeDescifrado;

    }
}

module.exports.desencrypt = desencrypt;