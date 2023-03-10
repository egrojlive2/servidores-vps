const {
   cargar_datos_eco,
   caducidad,
   padTo2Digits,
   formatear_fecha,
   validar_token,
   es_Admin,
   es_bot,
   es_cliente,
   obtener_token,
   ejecutar_comando,
   supabase_tablas
} = require('./funciones.js')

const eco_bot_action = (req, res) => {

   const reqUrl = url.parse(req.url).pathname
   const query = url.parse(req.url).query


   if (req.method === "GET") {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      return res.end('<h1>Panel Web Code Err0r</h1><br><p>La Pagina Solicada No Existe</p>') //  + JSON.stringify(global.tabla_eco) + '</p>')
   } else if (req.method === "POST") {

      var body = ''

      req.on('data', function(data) {
         body += data
      })

      req.on('error', (err) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
         res.end('<h1>Panel Web Code Err0r</h1><br><p>La Pagina Solicada No Existe</p>')
         res.end()
      })

      req.on('end', function() {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
         let datos = []
         try {
            datos = JSON.parse(body)
         } catch (e) {
            return res.end('Xd No Enviaste Datos')
         }

         let lista_total = [] //JSON.parse(global._usuarios_eco)

         if (datos.length == 0 || !datos.token) return res.end('Error Desconocido')

         let fecha = formatear_fecha(new Date()) //new Date().toLocaleString()

         switch (req.url) {
            case "/ecobot":
            case "/ecobot/":
               lista_total = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.token)
               if (lista_total.length == 0) return res.end("Lo Siento Pero Aun No Estas Registrado En El Sistema Contacta Algun Administrador")
               res.end(JSON.stringify(lista_total))
               res.end()
               break;
            case "/ecobot/adduser":
            case "/ecobot/adduser/":
               if (!es_Admin(datos.cliente) && !es_bot(datos.cliente)) return res.end("Este Comando Solo Es Para Los Administradores Y Revendedores")
               if (datos.length == 0) return res.end("No Se Recibieron Datos")
               lista_total = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.token)
               if (lista_total.length > 0) return res.end("El Usuario Ingresado Ya Existe")
               
               let usuario = {
                  token: datos.token,
                  nombre: datos.nombre,
                  inicio: fecha,
                  termino: fecha,
                  creditos: 0,
                  revendedor: datos.cliente,
                  cuenta: 'cliente'
               }
 
               supabase
                  .from('usuarios_eco')
                  .insert([usuario])
                  .then(async (usuarios) => {
                     if (usuarios.statusText != 'Created') return res.end('Error Al Guardar El Usuario')
                     global.tabla_eco.push(usuarios.data[0])
                     global.tabla_eco.sort(function(obj1, obj2) {
                        return obj1.token - obj2.token;
                     })

                     global._usuarios_eco = JSON.stringify(global.tabla_eco)
                     await cargar_datos_eco()
                     fs.writeFileSync('database/eco_usuarios.json', JSON.stringify(global.tabla_eco))
                     res.end("Usuario Agregado Correctamente")
                     res.end()
                  }).catch(error => {
                     res.end("Ocurrio Un Error Al Guardar Los Datos")
                     res.end()
                  })
               break
            case "/ecobot/deluser":
            case "/ecobot/deluser/":

               if (!es_Admin(datos.cliente) && !es_bot(datos.cliente)) return res.end("Este Comando Solo Es Para Los Administradores")

               if (datos.length == 0) return res.end("No Se Recibieron Datos")
               lista_total = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.token)
               if (lista_total.length < 1) return res.end("El Usuario No Existe En La Base De Datos")
               if (!es_bot(datos.cliente) && lista_total[0].revendedor != datos.cliente) return res.end("*Solo El Admin De Este Usuario Y El Bot Pueden Eliminar Este Usuario*")

               //global.tabla_eco = JSON.parse(global._usuarios_eco)

               global.tabla_eco.splice(obtener_token(`${datos.token}`, global.tabla_eco), 1)
               
               global._usuarios_eco = JSON.stringify(global.tabla_eco)
               cargar_datos_eco()
               fs.writeFileSync('database/eco_usuarios.json', JSON.stringify(global.tabla_eco))
 
               supabase
                  .from('usuarios_eco')
                  .delete()
                  .eq('token', datos.token)
                  .then(usuarios => {
                     //cargar_datos_eco()
                     res.end("Usuario Eliminado De La Base De Datos")
                     res.end()
                  })
               break
            case "/ecobot/infouser":
            case "/ecobot/infouser/":
               if (!es_Admin(datos.cliente) && !es_bot(datos.cliente)) return res.end("Este Comando Solo Es Para Los Administradores")
               if (datos.length == 0) return res.end("No Se Recibieron Datos")
               lista_total = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.token)
               if (lista_total.length < 1) return res.end("El Usuario No Existe En La Base De Datos")

               let busq1 = `*🔍👉📃Datos Del Usuario: 👈🔍*\n\n`
               for (i = 0; i < lista_total.length; i++) {
                  busq1 += `👤➸➸ Nombre: *${lista_total[i].nombre}*\nCreditos: *${lista_total[i].creditos}*\nExpiracion:\n*${lista_total[i].termino.replace('T', ' ')}*\nCuenta Creada:\n*${lista_total[i].inicio.replace('T',' ')}*\nCuenta_Tipo: *${lista_total[i].cuenta}*\n\n`
               }
               res.end(busq1)
               break
            case "/ecobot/saldo":
            case "/ecobot/saldo/":
               if (datos.length == 0) return res.end("No Se Recibieron Datos")
               lista_total = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.token)
               if (lista_total.length < 1) return res.end("El Usuario No Existe En La Base De Datos")
               let d_u = caducidad(fecha, lista_total[0].termino.replace('T', ' '))
               var expiracion = `${d_u[0]}d:${d_u[1]}h:${d_u[2]}m`
               if (d_u[0] < 1 && d_u[1] < 1 && d_u[2] < 1) {
                  expiracion = `Expirado`
               }
               let busq3 = `*🔍👉📃Tus Datos👈🔍*\n\n`
               for (i = 0; i < lista_total.length; i++) {
                  busq3 += `👤➸➸ Nombre: *${lista_total[i].nombre}*\nCreditos: *${lista_total[i].creditos}*\nTiempo Restante:\n*${expiracion}*\nCuenta Creada: \n*${lista_total[i].inicio.replace('T', ' ')}*\nCuenta_Tipo: *${lista_total[i].cuenta}*\n\n`
               }
               res.end(busq3)

               break
            case '/ecobot/expirados':
            case '/ecobot/expirados/':

               if (!es_Admin(datos.cliente) && !es_bot(datos.cliente)) return res.end("Este Comando Solo Es Para Los Administradores")
               if (datos.length == 0) return res.end("No Se Recibieron Datos")
               lista_total = global.tabla_eco.filter(p => {
                  let fecha_termino = new Date(p.termino)
                  if (fecha_termino < new Date() && p.revendedor == datos.cliente) return true
                  return false
               })
               var respuesta = `*✨Tienes ${lista_total.length} Clientes Vencidos✨*\n\n`
               lista_total.forEach(function(element, index) {
                  var token_cli = `${lista_total[index].token}`
                  respuesta += `👉 @${token_cli.replace('@s.whatsapp.net','')}\nAlias: ${lista_total[index].nombre}\nCreditos: ${lista_total[index].creditos}\n\n`
               })
               res.end(respuesta)
               res.end()
               break
            case "/ecobot/telefono":
            case "/ecobot/telefono/":
               async function buscar_telefono() {
                  try {
                     if (datos.length == 0) return res.end("No Se Recibieron Datos")

                     lista_total = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.token)
                     if (lista_total.length < 1) return res.end("El Usuario No Existe En La Base De Datos")
                     let d_u2 = caducidad(fecha, lista_total[0].termino)
                     if (d_u2[0] < 1 && d_u2[1] < 1 && d_u2[2] < 1 && !es_bot(datos.token)) return res.end("No Te Queda Tiempo Para Usar Este Servicio, Si Deseas Adquirir Mas Tiempo Contrata Algun Administrador")

                     let datos_temporales = new_global.tabla_eco_json.filter(p => p.telefono.startsWith(datos.telefono))

                     if (datos_temporales.length > 0) return res.end(`👉telefono: *${datos_temporales[0].telefono}*\nserie: *${datos_temporales[0].nom_modemversion}*\nmodelo: *${datos_temporales[0].nom_modemmodelo}*\ndomicilio: *${datos_temporales[0].direccion}*\nnombre: *${datos_temporales[0].nombre}*\n\n`)

                     res.end(`*✨Lo Siento, No Tenemos Registros De Este Telfono.✨*`)

                  } catch (e) {
                     res.end("Ocurrio Un Error Al Consultar")
                     console.log(e);
                  }



               }
               buscar_telefono()
               break
            case "/ecobot/lada":
            case "/ecobot/lada/":
               async function buscar_lada() {
                  try {
                     if (datos.length == 0) return res.end("No Se Recibieron Datos")

                     let datos_temporales = new_global.tabla_eco_json.filter(p => p.telefono.startsWith(datos.lada))

                     if (datos_temporales.length > 0) return res.end(`👉Existen ${datos_temporales.length} Registros De Esta Lada.`)

                     res.end(`*✨Lo Siento, No Tenemos Registros De Esta Lada.✨*`)

                  } catch (e) {
                     res.end("Ocurrio Un Error Al Consultar")
                     console.log(e);
                  }



               }
               buscar_lada()

               break
            case "/ecobot/eco":
            case "/ecobot/eco/":
               async function servicio_eco_buscar() {
                  if (datos.length == 0) return res.end("No Se Recibieron Datos")
                  lista_total = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.token)
                  if (lista_total.length < 1) return res.end("El Usuario No Existe En La Base De Datos")
                  let d_u2 = caducidad(fecha, lista_total[0].termino)
                  if (d_u2[0] < 1 && d_u2[1] < 1 && d_u2[2] < 1 && !es_bot(datos.token)) return res.end("No Te Queda Tiempo Para Usar Este Servicio, Si Deseas Adquirir Mas Tiempo Contrata Algun Administrador\n\nhttps://wa.me/5213131227308\n\nhttps://wa.me/5218991243052")

                  let datos_temporales = global.new_customer_json.filter(p => p.telefono.startsWith(datos.lada) && p.nom_modemversion.endsWith(datos.serie) && p.nom_modemversion.startsWith(datos.modem))

                  if (datos_temporales.length > 0) {
                     var respuesta = `*✨${datos_temporales.length} Resultados:✨*\n\n`
                     datos_temporales.forEach(function(element, index) {
                        respuesta += `👉telefono: *${datos_temporales[index].telefono}*\nserie: *${datos_temporales[index].nom_modemversion}*\nmodelo: *${datos_temporales[index].nom_modemmodelo}*\ndomicilio: *${datos_temporales[index].direccion}*\nnombre: *${datos_temporales[index].nombre}*\n\n`
                     });
                     return res.end(respuesta)
                  } else {
                     var msj = await ejecutar_comando(`${sql}`)
                     if (msj == 'error') return res.end("Lo Siento Pero No Encontre Resultados")
                        res.end(`*✨Resultados:✨*\n\n${msj}`)
                  }

               }
               servicio_eco_buscar()
               break

            case '/ecobot/admin/':
            case '/ecobot/admin':
               async function add_admin() {

                  if (!es_bot(datos.cliente)) return res.end("Este Comando Solo Lo Puede Ejecutar El Bot")
                  if (datos.opcion == 'promote' && es_Admin(datos.token)) return res.end("*Este Usuario Ya Es Administrador*")
                  if (datos.opcion == 'demote' && es_cliente(datos.token)) return res.end("*Este Usuario No Es Administrador*")

                  lista_total = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.token)

                  var t_cuenta = 'admin'
                  if (datos.opcion == 'demote') t_cuenta = 'cliente'

                  supabase
                     .from('usuarios_eco')
                     .update([{
                        cuenta: t_cuenta
                     }])
                     .eq('token', datos.token)
                     .then(usuarios => {
                        //console.log(usuarios)                 
                        if (usuarios.statusText != 'OK') return res.end('Ocurrio Un Error Al Guardar Los Datos')
                        global.tabla_eco = JSON.parse(global._usuarios_eco)
                        global.tabla_eco.splice(obtener_token(`${datos.token}`, global.tabla_eco), 1)
                        global.tabla_eco.push(usuarios.data[0])
                        global.tabla_eco.sort(function(obj1, obj2) {
                           return obj1.token - obj2.token;
                        })
                        global._usuarios_eco = JSON.stringify(global.tabla_eco)
                        fs.writeFileSync('database/eco_usuarios.json', JSON.stringify(global.tabla_eco))
                        cargar_datos_eco()
                        res.end(`*Listo Ha Cambiado El Tipo De Cuenta*`)
                        res.end()
                     }).catch(error => {
                        console.log(error)
                        res.end("Ocurrio Un Error Al Guardar Los Datos")
                        res.end()
                        return
                     })
               }
               add_admin()
               break
            case '/ecobot/pisa/':
            case '/ecobot/pisa':
               async function add_pisa() {
                  global.registros_json = fs.readFileSync('data.json', 'utf8')
                  global.new_customer_json = JSON.parse(global.registros_json)
                  res.end('Listo')
               }
               add_pisa()

               break
            case "/ecobot/activareco/":
            case "/ecobot/activareco":

               async function actualizar_datos_tiempo() {
                  if (!es_Admin(datos.cliente) && !es_bot(datos.cliente)) return res.end("Este Comando Solo Es Para Los Administradores")
                  if (datos.length == 0) return res.end("No Se Recibieron Datos")
                  lista_total = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.token)

                  if (lista_total.length < 1) return res.end("El Usuario No Existe En La Base De Datos");
                  if (datos?.cantidad < 1 || datos?.cantidad > 10) return res.end("Los Valores Son Incorrectos");

                  var datos_rev = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.cliente);

                  if (datos_rev[0].creditos < parseInt(datos.cantidad * p_dia) && !es_bot(datos.cliente)) return res.end("*Lo Siento Pero No Cuentas Con Creditos Suficientes Para Agregar Tiempo*");

                  var valor_dia = parseInt((1000 * 3600 * 24) * datos.cantidad)
                  let d_u3 = caducidad(fecha, lista_total[0].termino)
                  var dias_agregados = parseInt(new Date(lista_total[0].termino.replace('T', ' ')).getTime() + valor_dia)
                  if (d_u3[0] < 1 && d_u3[1] < 1 && d_u3[2] < 1) {
                     dias_agregados = parseInt(new Date(fecha).getTime() + valor_dia)
                  }

                  var nueva_fecha = formatear_fecha(new Date(dias_agregados))

                  var bot_creditos = 5000
                  if (!es_bot(datos.cliente)) bot_creditos = datos_rev[0].creditos - parseInt(datos.cantidad * p_dia)

                  let {
                     data,
                     error
                  } = await supabase
                     .from('usuarios_eco')
                     .update([{
                        creditos: bot_creditos
                     }])
                     .eq('token', datos.cliente)

                  if (error) return res.end("*Ocurrio Un Error Al Guardar Los Datos*")

                  global.tabla_eco = JSON.parse(global._usuarios_eco)
                  global.tabla_eco.splice(obtener_token(`${datos.cliente}`, global.tabla_eco), 1)
                  global.tabla_eco.push(data[0])
                  global.tabla_eco.sort(function(obj1, obj2) {
                     return obj1.token - obj2.token;
                  })

                  global._usuarios_eco = JSON.stringify(global.tabla_eco)
                  fs.writeFileSync('database/eco_usuarios.json', JSON.stringify(global.tabla_eco))

                  supabase
                     .from('usuarios_eco')
                     .update([{
                        termino: nueva_fecha
                     }])
                     .eq('token', datos.token)
                     .then(usuarios => {
                        //console.log(usuarios)                 
                        if (usuarios.statusText != 'OK') return res.end('Ocurrio Un Error Al Guardar Los Datos')
                        global.tabla_eco = JSON.parse(global._usuarios_eco)
                        global.tabla_eco.splice(obtener_token(`${datos.token}`, global.tabla_eco), 1)
                        global.tabla_eco.push(usuarios.data[0])
                        global.tabla_eco.sort(function(obj1, obj2) {
                           return obj1.token - obj2.token;
                        })
                        global._usuarios_eco = JSON.stringify(global.tabla_eco)
                        fs.writeFileSync('database/eco_usuarios.json', JSON.stringify(global.tabla_eco))
                        res.end(`Listo, Se Ha Agregado Mas Tiempo`)
                        res.end()
                     }).catch(error => {
                        console.log(error)
                        res.end("Ocurrio Un Error Al Guardar Los Datos")
                        res.end()
                        return
                     })


               }
               actualizar_datos_tiempo()
               break
            case "/ecobot/vender/":
            case "/ecobot/vender":

               async function vender_saldo() {

                  if (!es_Admin(datos.cliente) && !es_bot(datos.cliente)) return res.end("Este Comando Solo Es Para Los Administradores Y El Bot")
                  if (datos.length == 0) return res.end("No Se Recibieron Datos")
                  lista_total = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.token)
                  if (lista_total.length < 1) return res.end("El Usuario No Existe En La Base De Datos")
                  if (datos?.cantidad < 1 || datos?.cantidad > 500) return res.end("La Cantidad Maxima Son 500")

                  var valor_creditos = parseInt(lista_total[0].creditos + datos.cantidad)
                  var datos_rev = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.cliente)
                  if (datos_rev[0].creditos < parseInt(datos.cantidad) && !es_bot(datos.cliente)) return res.end("*Lo Siento Pero No Cuentas Con Creditos Suficientes Para Agregar Tiempo*")

                  var bot_creditos = 5000
                  if (!es_bot(datos.cliente)) bot_creditos = parseInt(datos_rev[0].creditos - datos.cantidad)

                  let {
                     data,
                     error
                  } = await supabase
                     .from('usuarios_eco')
                     .update([{
                        creditos: bot_creditos
                     }])
                     .eq('token', datos.cliente)


                  if (error) return res.end("*Ocurrio Un Error Al Guardar Los Datos*")

                  global.tabla_eco = JSON.parse(global._usuarios_eco)
                  global.tabla_eco.splice(obtener_token(`${datos.cliente}`, global.tabla_eco), 1)
                  global.tabla_eco.push(data[0])

                  global.tabla_eco.sort(function(obj1, obj2) {
                     return obj1.token - obj2.token;
                  })

                  global._usuarios_eco = JSON.stringify(global.tabla_eco)
                  fs.writeFileSync('database/eco_usuarios.json', JSON.stringify(global.tabla_eco))
                  fs.appendFileSync("/root/ventas.txt", `${datos.cliente}|${datos.token}|${datos.cantidad}`)

                  await supabase
                     .from('usuarios_eco')
                     .update([{
                        creditos: valor_creditos
                     }])
                     .eq('token', datos.token)
                     .then(usuarios => {

                        if (usuarios.statusText != 'OK') return res.end('Ocurrio Un Error Al Guardar Los Datos')

                        global.tabla_eco = JSON.parse(global._usuarios_eco)
                           //console.log(global.tabla_eco)
                        global.tabla_eco.splice(obtener_token(datos.token, global.tabla_eco), 1)
                        global.tabla_eco.push(usuarios.data[0])

                        global.tabla_eco.sort(function(obj1, obj2) {
                           return obj1.token - obj2.token;
                        })
                        global._usuarios_eco = JSON.stringify(global.tabla_eco)
                        fs.writeFileSync('database/eco_usuarios.json', JSON.stringify(global.tabla_eco))

                        fs.appendFileSync("/root/ventas.txt", `${usuarios.data[0].cliente}|${usuarios.data[0].token}|${datos.cantidad}\n`)
                        res.end(`Listo, Has Vendido ${datos.cantidad} Creditos`)
                        res.end()
                     }).catch(error => {
                        console.log(error)
                        res.end("Ocurrio Un Error Al Guardar Los Datos")
                        res.end()
                     })
               }

               vender_saldo()
               break
            case '/ecobot/actualizar/':
            case '/ecobot/actualizar':
               if (!datos.token) return res.end('Los Datos Son Incorrectos')
               if (!es_bot(datos.token)) return res.end('*Xd Nomas Yo Puedo Ejecutar Este Comando*')

               async function subir_ladas() {

                  if (!fs.existsSync("nuevo.json")) fs.writeFileSync("nuevo.json", "[]")

                  let nuevos_datos = fs.readFileSync('nuevo.json', 'utf8')
                  let temporal = JSON.parse(nuevos_datos)

                  temporal.forEach(function(element, index) {
                     let consulta = new_global.tabla_eco_json.filter(p => p.telefono === temporal[index].telefono)


                     if (consulta.length === 0) {
                        new_global.tabla_eco_json.push(temporal[index])
                        console.log(`Insertando ${index} De ${temporal.length}`)
                        fs.appendFileSync('data.txt', `\n${temporal[index].telefono}:${temporal[index].nom_modemversion}`)
                     } else {
                        var validar = consulta[0]?.nombre

                        if (validar) return
                        console.log(`Actualizando ${index} De ${temporal.length}`)
                        consulta[0].nombre = temporal[index].nombre
                        consulta[0].direccion = temporal[index].direccion
                        consulta[0].division = temporal[index].division
                        consulta[0].area = temporal[index].area
                        consulta[0].distrito = temporal[index].distrito
                        consulta[0].nom_modemmodelo = temporal[index].nom_modemmodelo
                        consulta[0].nom_modemversion = temporal[index].nom_modemversion
                     }

                  });
                  registros_json = JSON.stringify(new_global.tabla_eco_json)
                  fs.writeFileSync('data.json', JSON.stringify(new_global.tabla_eco_json))
                  fs.writeFileSync('nuevo.json', "[]")
                  res.end(`Se Actualizaron ${temporal.length} Registros`)
                  console.clear()
               }
               subir_ladas()

               break
            case '/ecobot/checkban':
            case '/ecobot/checkban/':
               async function checar_ban() {
                  try {
                     lista_total = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.token)
                     if (lista_total.length < 1) return res.end("Tu Cuenta No Esta Registrada")
                     var creditos = parseInt(lista_total[0].creditos)
                     if (creditos < p_consulta_ban) return res.end(`No Cuentas Con Saldo Suficiente, El Precio Es De ${p_consulta_ban} creditos`)
                     if (datos.length < 3) return res.end("Los Valores Son Incorrectos")
                     if (datos.telefono.length != 10) return m.reply(`*El Telefono Debe Contener 10 Digitos xd*`)

                     var url_ban = `http://cctek1/cobranza_consultas/action/CJE0056Telefono.action?telefono=${datos.telefono}`
                     if (datos.comercio == 'TELCEL') url_ban = `http://cctek1/cobranza_consultas/action/CJE0060Telefono.action?telefono=${datos.telefono}`
                        //info ban telcel
                     var respuesta = await axios(url_ban, {

                        "headers": {
                           "accept-language": "es-US,es-419;q=0.9,es;q=0.8",
                           "authorization": "Basic UFJPMjcwMUFVVDpLVE9DUUtQUA==",
                           "content-type": "application/json; charset=utf-8",
                           "x-requested-with": "XMLHttpRequest"
                        },
                        "referrer": "http://cctek1/cobranza_consultas/zntjsp/CJE0056.jsp",
                        "referrerPolicy": "strict-origin-when-cross-origin",
                        "body": null,
                        timeout: 35000,
                        httpsAgent: new https.Agent({
                           keepAlive: true
                        }),
                        "method": "POST",
                        "mode": "cors",
                        "credentials": "include"
                     });

                     if (respuesta.status != 200) return res.end('Ocurrio Un Error, Parece Ser Que El Servicio No Esta Disponible')
                     var datos_ban = respuesta.data
                     console.log(datos_ban)
                     var retorno = ''
                     if (!datos_ban?.datos) return res.end('Por El Momento No Esta Disponible Esta Opcion')
                     var valor_ban = datos_ban.datos?.enBloqueoTAE || datos_ban.datos.enlistanegra || datos_ban?.datos?.valida
                     if (valor_ban == 'fijo') {
                        valor_ban = 'si'
                        retorno = `👉Resultados:\n🈺Telefono: *${datos.telefono}*\nBaneado: *${valor_ban}*`
                     } else {
                        retorno = `👉Resultados:\n🈺Telefono: *${datos.telefono}*\nBaneado: *${valor_ban}*\nFecha_reporte: *${datos_ban.datos.fechaAltaTimeStmp}*\nMotivo: *${datos_ban.datos.motivoAlta}*\n`
                     }
                     //console.log(`${datos_ban.datos.enBloqueoTAE} Esta Ban Por: *${datos_ban.datos.motivoAlta}*`)


                     let {
                        data3,
                        error3
                     } = supabase
                        .from('usuarios_eco')
                        .update([{
                           creditos: parseInt(creditos - p_consulta_ban)
                        }])
                        .eq('token', datos.token)
                        .then(usuarios => {
                           //console.log(usuarios)                 
                           if (usuarios.statusText != 'OK') return res.end('Ocurrio Un Error Al Guardar Los Datos')
                           global.tabla_eco = JSON.parse(global._usuarios_eco)
                           global.tabla_eco.splice(obtener_token(`${datos.token}`, global.tabla_eco), 1)
                           global.tabla_eco.push(usuarios.data[0])
                           global.tabla_eco.sort(function(obj1, obj2) {
                              return obj1.token - obj2.token;
                           })
                           global._usuarios_eco = JSON.stringify(global.tabla_eco)
                           fs.writeFileSync('database/eco_usuarios.json', JSON.stringify(global.tabla_eco))
                           res.end(retorno)
                           res.end()
                        }).catch(error => {
                           console.log(error)
                           res.end("Lo Siento Ocurrio Un Error")
                           res.end()
                        })
                  } catch (e) {
                     res.end('Intentalo Mas Tarde')
                  }

               }
               checar_ban()
               break
            case '/ecobot/wifi/':
            case '/ecobot/wifi':
               async function desbloquear_wifi() {
                  lista_total = JSON.parse(global._usuarios_eco).filter(p => p.token == datos.token)
                  if (lista_total.length < 1) return res.end("Tu Cuenta No Esta Registrada")
                  var creditos = parseInt(lista_total[0].creditos)
                  if (creditos < p_desbloqueo) return res.end(`No Cuentas Con Saldo Suficiente, El Precio Es De ${p_desbloqueo} creditos`)
                  if (datos.length < 4) return res.end("Los Valores Son Incorrectos")
                  if (datos.ssid.length < 3) return m.reply(`*El SSID Debe Contener Al Menos 3 Digitos xd*`)
                  if (datos.serie.length < 10) return m.reply(`*La Serie Debe Contener Al Menos 10 Digitos xd*`)
                  if (datos.password.length < 8) return m.reply(`*La Password Debe Contener Al Menos 8 Digitos xd*`)

                  var new_customer = WIFI_CUSTOMER
            new_customer.context.soporte.NumeroSerie = datos.serie
            new_customer.context.form_content.ssid = datos.ssid
            new_customer.context.form_content.contrasenaSSID = datos.password
            new_customer.context.form_content.confirmContrasenaSSID = datos.password

                  var resultado = await axios.post('https://watson-channelmiddleware.mybluemix.net/web/api/message', new_global.tabla_eco, {
                     headers: {
                        "Content-Type": "application/json",
                        "Origin": "https://telmex.com",
                        "Referer": "https://telmex.com",
                        "Sec-Fetch-Dest": "empty",
                        "Sec-Fetch-Mode": "cors"
                     }
                  }).catch((error) => {
                     return {
                        status: 403
                     }
                  })
                  console.clear()
                  if (resultado.status != 200 && !resultado.data?.context.ws_pending.status) return res.end("No Fue Posible Desbloquear La Red")
                  var status_final = resultado.data?.output?.generic[0]?.text
                  if (status_final) return res.end(`${status_final}`)

                  let {
                     data3,
                     error3
                  } = supabase
                     .from('usuarios_eco')
                     .update([{
                        creditos: parseInt(creditos - p_desbloqueo)
                     }])
                     .eq('token', datos.token)
                     .then(usuarios => {
                        //console.log(usuarios)                 
                        if (usuarios.statusText != 'OK') return res.end('Ocurrio Un Error Al Guardar Los Datos')
                        global.tabla_eco = JSON.parse(global._usuarios_eco)
                        global.tabla_eco.splice(obtener_token(`${datos.token}`, global.tabla_eco), 1)
                        global.tabla_eco.push(usuarios.data[0])
                        global.tabla_eco.sort(function(obj1, obj2) {
                           return obj1.token - obj2.token;
                        })
                        global._usuarios_eco = JSON.stringify(global.tabla_eco)
                        fs.writeFileSync('database/eco_usuarios.json', JSON.stringify(global.tabla_eco))
                        res.end(`Listo, Se Han Modificado Los Datos De La Red:\n\n🈺SSID: ${datos.ssid}\n🔑Contra: ${datos.password}`)
                        res.end()
                     }).catch(error => {
                        console.log(error)
                        res.end("Lo Siento Ocurrio Un Error")
                        res.end()
                     })
               }
               if (datos.length < 4) return res.end("Faltaron Datos De Ingresar")

               desbloquear_wifi()
               break
            case "/codetunnel/adduser/":
            case "/codetunnel/adduser":
            case "/codetunnel/useradd":
            case "/codetunnel/useradd/":

               const datos5 = JSON.parse(body)

               if (datos5.length == 0) return res.end("No Se Recibieron Datos")
               if (datos5.length < 7) return res.end("Necesitas Enviar Todos Los Valores")
               let cust6 = JSON.parse(global._usuarios_eco).filter(p => p.nombre === datos5.nombre)

               if (cust6.length < 1) {

                  //let { data4, error4 } = 
                  supabase
                     .from('usuarios')
                     .insert([{
                        token: datos5.token,
                        movil: datos5.movil,
                        nombre: datos5.nombre,
                        termino: datos5.termino,
                        servidor: datos5.servidor,
                        password: datos5.password,
                        detalles: datos5.detalles,
                        limite: datos5.limite
                     }])
                     .then(usuarios => {
                        if (usuarios.statusText != 'Created') return res.end('error')
                        cust6 = JSON.parse(global._usuarios_eco)
                        cust6.push(usuarios.data[0])
                        cust6.sort(function(obj1, obj2) {
                           return obj1.token - obj2.token;
                        })
                        global._usuarios_eco = JSON.stringify(cust6)
                        fs.writeFileSync('codetunnel.json', JSON.stringify(cust6))
                        res.end(`id: *${usuarios.data[0].id}*\ntoken: *${usuarios.data[0].token}*\nmovil: *${usuarios.data[0].movil}*\nnombre: *${usuarios.data[0].nombre}*\ncreado: *${usuarios.data[0].creacion}*\nmovil: *${usuarios.data[0].termino}*\ndetalles: *${usuarios.data[0].detalles}*\n\nUsuario Agregado Correctamente\n`)
                        res.end()
                     }).catch(error => {
                        res.end('error: ' + error)
                        res.end()
                     })

               } else {

                  let {
                     data5,
                     error5
                  } = supabase
                     .from('usuarios')
                     .update([{
                        movil: datos5.movil,
                        token: datos5.token,
                        termino: datos5.termino,
                        servidor: datos5.servidor,
                        password: datos5.password,
                        detalles: datos5.detalles,
                        limite: datos5.limite
                     }])
                     .eq('nombre', datos5.nombre, )
                     .then(usuarios => {
                        if (usuarios.statusText != 'OK') return res.end('error')
                        cust6 = JSON.parse(global._usuarios_eco)
                        cust6.splice(obtener_token(`${datos5.token}`, cust6), 1)
                        cust6.push(usuarios.data[0])
                        cust6.sort(function(obj1, obj2) {
                           return obj1.token - obj2.token;
                        })
                        global._usuarios_eco = JSON.stringify(cust6)
                        fs.writeFileSync('codetunnel.json', JSON.stringify(cust6))
                        res.end(`id: *${usuarios.data[0].id}*\ntoken: *${usuarios.data[0].token}*\nmovil: *${usuarios.data[0].movil}*\nnombre: *${usuarios.data[0].nombre}*\ncreado: *${usuarios.data[0].creacion}*\nmovil: *${usuarios.data[0].termino}*\ndetalles: *${usuarios.data[0].detalles}*\n\nUsuario Modificado Correctamente\n`)
                        res.end()
                     }).catch(error => {
                        res.end('error: ' + error)
                        res.end()
                     })

               }
               break
            case "/codetunnel/deluser":
            case "/codetunnel/deluser/":
            case "/codetunnel/userdel":
            case "/codetunnel/userdel/":

               const datos6 = JSON.parse(body)

               if (datos6.length == 0) return console.log("No Se Recibieron Datos")
               let cust7 = JSON.parse(global._usuarios_eco).filter(p => p.token === datos6.token)
               if (cust7.length > 0) {
                  cust7 = JSON.parse(global._usuarios_eco)
                  cust7.splice(obtener_token(`${datos6.token}`, cust7), 1)
                  global._usuarios_eco = JSON.stringify(cust7)
                  fs.writeFileSync('codetunnel.json', JSON.stringify(cust7))
                     //res.end("Usuario Eliminado De Supabase")
                  let {
                     data6,
                     error6
                  } = supabase
                     .from('usuarios')
                     .delete()
                     .eq('token', datos6.token)
                     .eq('servidor', servidor)
                     .then(usuarios => {
                        res.end('Usuario Eliminado De Supabase')
                     })
                  res.end()
               } else {
                  res.end("El Usuario No Existe En Supabase")
                  res.end()
               }
               break
            case "/codetunnel/infouser":
            case "/codetunnel/infouser/":
               const datos7 = JSON.parse(body)
               const cust8 = JSON.parse(global._usuarios_eco).filter(p => p.movil === datos7.token | p.token === datos7.token)
               cust8.sort(function(obj1, obj2) {
                  return obj1.token - obj2.token;
               })
               let busq2 = `*🔍RESULTADO DE 👉${datos7.token}👈 🔍*\n*📃Total: ${cust8.length}*\n\n`
               for (i = 0; i < cust8.length; i++) {
                  busq2 += `ID: *${cust8[i].id}*\n👤➸➸ TOKEN: *${cust8[i].token}*\nMOVIL: *${cust8[i].movil}*\nNOMBRE: *${cust8[i].nombre}*\nCREADO: *${cust8[i].creacion}*\nTERMINO: *${cust8[i].termino}*\nDetalles: *${cust8[i].detalles}*\n\n`
               }
               if (cust8.length > 0) {
                  res.end(busq2)
                  res.end()
               } else {
                  res.end(`No Se Encontraron Resultados...`)
                  res.end()
               }
               break
            case '/codetunnel/upload':
            case '/codetunnel/upload/':
               let datos8 = JSON.parse(body)

               if (datos8.length == 0) return res.end(`{data:'error'}`)

               if (datos8.opcion == 'free') {
                  fs.writeFileSync('free.mz', datos8.data)
                  res.end(`{data:'Archivo free.mz Actualizado Correctamente'}`)
               } else {
                  fs.writeFileSync('premium.mz', datos8.data)
                  res.end(`{data:'Archivo premium.mz Actualizado Correctamente'}`)
               }
               res.end()
               break
            
            default:

               break;
         }


      })

   }
}

module.exports = {
   eco_bot_action
}