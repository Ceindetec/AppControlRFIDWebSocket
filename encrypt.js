

var claveMochila = [335916, 428891, 866985, 2139945, 4385521, 8713045, 17162809, 34033702];

function encrypt(mensaje) {
	
	var mensajeOriginal = "";
	var mensajeEncriptado = "";
	var caracterBinarioCompleto = "";
	var cadenaCeros = "00000000";
	var complementoBinario = "";
	var auxiliarCaracterEncriptado;

    if (mensaje.length) {

        mensajeOriginal = mensaje.trim();

        mensajeEncriptado = "";

        for (i = 0; i < mensajeOriginal.length; i++) {


            complementoBinario = cadenaCeros.substring(0, (8 - (dec2bin(mensajeOriginal.charCodeAt(i)).length)));

            caracterBinarioCompleto = complementoBinario + dec2bin(mensajeOriginal.charCodeAt(i));

            auxiliarCaracterEncriptado = 0;

            for (j = 0; j < caracterBinarioCompleto.length; j++) {

                auxiliarCaracterEncriptado = (caracterBinarioCompleto[j] * claveMochila[j]) + parseFloat(auxiliarCaracterEncriptado);
            }


            mensajeEncriptado = auxiliarCaracterEncriptado + " " + mensajeEncriptado;

        }

        return mensajeEncriptado;

    }

}

function dec2bin(i) {
    return (i < 1) ? "" : dec2bin((i - (i % 2)) / 2) + i % 2;
}

module.exports.encrypt = encrypt;