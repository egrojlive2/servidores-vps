const cargar_datos_eco = async() => {
	global.tabla_eco = JSON.parse(global._usuarios_eco)
	global.administradores = JSON.parse(global._usuarios_eco).filter(p => p.cuenta == 'admin')
	global.clientes = JSON.parse(global._usuarios_eco).filter(p => p.cuenta == 'cliente')
	global.bot = JSON.parse(global._usuarios_eco).filter(p => p.cuenta == 'bot')
}
const cargar_datos_codetunnel = async() =>{
	fs.writeFileSync('database/codetunnel.json', JSON.stringify(usuarios.data))
	global._tabla_codetunnel = JSON.parse(global._usuario_codetunnel)
}
function caducidad(hoy, termino) {
	var fecha1 = new Date(termino)
	var fecha2 = new Date(hoy)
	var difference = fecha1.getTime() - fecha2.getTime() //Math.abs(fecha1 - fecha2);
	var days = parseInt(difference / (1000 * 60 * 60 * 24))
	var hours = parseInt(difference / (1000 * 60 * 60) % 60)
	var minutes = parseInt(difference / (1000 * 60) % 60)
	return [days, hours, minutes]
}

const padTo2Digits = (num) => {
	return num.toString().padStart(2, '0');
}

const formatear_fecha = (date) => {
	return (
		[
			date.getFullYear(),
			padTo2Digits(date.getMonth() + 1),
			padTo2Digits(date.getDate()),
		].join('-') +
		' ' +
		[
			padTo2Digits(date.getHours()),
			padTo2Digits(date.getMinutes()),
			padTo2Digits(date.getSeconds()),
		].join(':')
	);
}
const validar_token = (nombre, my_json) => {
	let status = false
	Object.keys(my_json).forEach((i) => {
		if (my_json[i].nombre === nombre) {
			status = true
		}
	})
	return status
}

const es_Admin = (whatsapp) => {
	if (administradores.includes(whatsapp)) return true
	return false
}

const es_cliente = (whatsapp) => {
	if (clientes.includes(whatsapp)) return true
	return false
}

const es_bot = (whatsapp) => {
	if (bot.includes(whatsapp)) return true
	return false
}

const obtener_token = (token, my_json) => {
	let position = null
	Object.keys(my_json).forEach((i) => {

		if (my_json[i].token === token) {
			position = i
		}
	})
	if (position !== null) {
		return position
	}
}

const ejecutar_comando = (comando) => {

	return new Promise(resolve => {
		exec(comando, {
			timeout: 120000
		}, (error, stdout, stderr) => {
			if (error) return resolve('error')
			return resolve(`${stdout}`)
		})
	})

}

const validar_titulo = (titulo, my_json) => {
    let status = false
    Object.keys(my_json).forEach((i) => {
        if (my_json[i].titulo === titulo) {
            status = true
        }                                                      })
    return status
}

const supabase_tablas = async(tabla, sql, file) => {
	return new Promise(resolve => {
		supabase
			.from(tabla)
			.select(sql)
			//.eq('servidor',servidor)
			.then(usuarios => {
				if (usuarios.data) {
					//global._usuarios_eco = JSON.stringify(usuarios.data)
					fs.writeFileSync(file, JSON.stringify(usuarios.data))
						//cargar_datos_eco()
					console.log(`Datos Cargados en ${file}`)
					resolve(usuarios.data)
				} else {
					resolve('[]')
				}
			}).catch((error) => {
				resolve('[]')
			})

	})

}

module.exports = {
	cargar_datos_eco,
	cargar_datos_codetunnel,
	supabase_tablas,
	caducidad,
	padTo2Digits,
	formatear_fecha,
	validar_token,
	es_Admin,
	es_bot,
	es_cliente,
	obtener_token,
	ejecutar_comando
}