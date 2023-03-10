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

const codetunnel_action = (req, res) => {

   const reqUrl = url.parse(req.url).pathname
   const query = url.parse(req.url).query

   if (req.method === "GET") {
      if (!query) {
         res.statusCode = 200;
         res.setHeader('Content-Type', 'text/html');
         return res.end('<h1>Panel Web Code Err0r</h1><br><p>La Pagina Solicada No Existe</p>') //  + JSON.stringify(global.tabla_eco) + '</p>')
      }
      res.statusCode = 200;
      
      switch (req.url.split('?token=')[0]) {
         case '/codetunnel/':
         case '/codetunnel':

            let rps2 = req.url.split('?token=')[1]
            let arr2 = rps2.split('token=')

            if (rps2.length != 16) {res.setHeader('Content-Type', 'text/html'); return res.end('<h1>Panel Web Code Err0r</h1><br><p>La Pagina Solicada No Existe</p>')}
            res.setHeader('Content-Type', 'application/json');
            let config = fs.readFileSync('database/free.mz', 'utf8')
            const _codetunnel = JSON.parse(global._usuario_codetunnel).filter(p => p.token === `${rps2}`)

            if (_codetunnel.length == 0) return res.end(JSON.stringify((`{token:"",nombre:"",config:"${config}"}`)));
            config = fs.readFileSync('database/premium.mz', 'utf8')

            res.end(`{token:"${_codetunnel[0].token}",\nnombre:"${_codetunnel[0].nombre}",\nconfig:"${config}",\ntermino:"${_codetunnel[0].termino}"}`);
            res.end()
            break
         default:

            var rps = req.url
            var arr = rps.split('token=')
               //console.log(arr[arr.length -1])

            if (rps.length < 15) return res.end('invalido')

            const _pendient = JSON.parse(global._usuario_codetunnel).filter(p => p.token === `${arr[arr.length -1]}`)

            if (_pendient.length == 0) return res.end(`{token:"",\nmovil:"",\nnombre:"",\nfecha:""}`);

            res.end(`{token:"${_pendient[0].token}",\nmovil:"${_pendient[0].movil}",\nnombre:"${_pendient[0].nombre}",\nfecha:"${_pendient[0].fecha}"}`);
            res.end()
            break;
      }

   } else if (req.method === "POST") {

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
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
         //console.log(req.url)

         switch (req.url) {

            case "/canciones/":
            case '/canciones':
               const datos = JSON.parse(body)
               if (datos.length == 0) return console.log("No Se Recibieron Datos")

               const customer2 = JSON.parse(_canciones)
               let total = []

               datos.forEach(function(element, index) {
                  if (!validar_titulo(datos[index].titulo, customer2)) {
                     let cancion = {
                        id: datos[index].id,
                        titulo: datos[index].titulo,
                        artista: datos[index].artista,
                        genero: datos[index].genero,
                        letra: datos[index].letra,
                        fecha: parseInt(datos[index].fecha),
                        token: datos[index].token
                     };

                     customer2.push(cancion)
                     total.push(cancion)
                     customer2.sort(function(obj1, obj2) {
                        return obj1.id - obj2.id;
                     })

                     _canciones = JSON.stringify(customer2)
                     fs.writeFileSync('database/canciones.json', JSON.stringify(customer2))
                        //console.log(JSON.stringify(cancion))
                  }
               });

               //res.end(JSON.stringify(total))
               const lista_total = JSON.parse(_canciones).filter(p => p.token != datos[0].token)
               res.end(JSON.stringify(lista_total))
               res.end()
               break;
            case "/adduser/":
            case "/adduser":

               const datos2 = JSON.parse(body)

               if (datos2.length == 0) return console.log("No Se Recibieron Datos")
               const cust3 = JSON.parse(global._usuario_codetunnel)

               if (!validar_token(datos2.token, cust3)) {
                  let usuario = {
                     token: datos2.token,
                     movil: datos2.movil,
                     nombre: datos2.nombre,
                     fecha: datos2.fecha
                  }
                  cust3.push(usuario)
                  cust3.sort(function(obj1, obj2) {
                     return obj1.token - obj2.token;
                  })
                  global._usuario_codetunnel = JSON.stringify(cust3)
                  fs.writeFileSync('database/usuarios.json', JSON.stringify(cust3))
                  res.end("Usuario Agregado Correctamente")
                  res.end()
               } else {
                  res.end("El Usuario Ingresado Ya Existe")
                  res.end()
               }
               break
            case "/deluser":
            case "/deluser/":
               console.log('deluser')
               const datos3 = JSON.parse(body)

               if (datos3.length == 0) return console.log("No Se Recibieron Datos")
               const cust4 = JSON.parse(global._usuario_codetunnel)
               if (validar_token(datos3.token, cust4)) {
                  cust4.splice(obtener_token(`${datos3.token}`, cust4), 1)
                  global._usuario_codetunnel = JSON.stringify(cust4)
                  fs.writeFileSync('database/usuarios.json', JSON.stringify(cust4))
                  res.end("Usuario Eliminado")
                  res.end()
               } else {
                  res.end("El Usuario No Existe")
                  res.end()
               }
               break
            case "/infouser":
            case "/infouser/":
               const datos4 = JSON.parse(body)
               const cust5 = JSON.parse(global._usuario_codetunnel).filter(p => p.movil === datos4.token | p.token === datos4.token)
               cust5.sort(function(obj1, obj2) {
                  return obj1.token - obj2.token;
               })
               let busq1 = `*🔍RESULTADO DE 👉${datos4.token}👈 🔍*\n*📃Total: ${cust5.length}*\n\n`
               for (i = 0; i < cust5.length; i++) {
                  busq1 += `👤➸➸ TOKEN: *${cust5[i].token}*\nMOVIL: *${cust5[i].movil}*\nNOMBRE: *${cust5[i].nombre}*\nFecha De Termino: *${cust5[i].fecha}*\n\n`
               }
               if (cust5.length > 0) {
                  res.end(busq1)
                  res.end()
               } else {
                  res.end(`No Se Encontraron Resultados...`)
                  res.end()
               }
               break

            case "/codetunnel/adduser/":
            case "/codetunnel/adduser":

               const datos5 = JSON.parse(body)

               if (datos5.length == 0) return console.log("No Se Recibieron Datos")
               const cust6 = JSON.parse(global._usuario_codetunnel)

               if (!validar_token(datos5.token, cust6)) {
                  let usuario = {
                     token: datos5.token,
                     movil: datos5.movil,
                     nombre: datos5.nombre,
                     fecha: datos5.fecha
                  }
                  cust6.push(usuario)
                  cust6.sort(function(obj1, obj2) {
                     return obj1.token - obj2.token;
                  })
                  global._usuario_codetunnel = JSON.stringify(cust6)
                  fs.writeFileSync('codetunnel.json', JSON.stringify(cust6))
                  res.end("Usuario Agregado Correctamente")
                  res.end()
               } else {
                  res.end("El Usuario Ingresado Ya Existe")
                  res.end()
               }
               break
            case "/codetunnel/deluser":
            case "/codetunnel/deluser/":

               const datos6 = JSON.parse(body)

               if (datos6.length == 0) return console.log("No Se Recibieron Datos")
               const cust7 = JSON.parse(global._usuario_codetunnel)
               if (validar_token(datos6.token, cust7)) {
                  cust7.splice(obtener_token(`${datos6.token}`, cust7), 1)
                  global._usuario_codetunnel = JSON.stringify(cust7)
                  fs.writeFileSync('database/codetunnel.json', JSON.stringify(cust7))
                  res.end("Usuario Eliminado")
                  res.end()
               } else {
                  res.end("El Usuario No Existe")
                  res.end()
               }
               break
            case "/codetunnel/infouser":
            case "/codetunnel/infouser/":
               const datos7 = JSON.parse(body)
               const cust8 = JSON.parse(global._usuario_codetunnel).filter(p => p.movil === datos7.token | p.token === datos7.token)
               cust8.sort(function(obj1, obj2) {
                  return obj1.token - obj2.token;
               })
               let busq2 = `*🔍RESULTADO DE 👉${datos7.token}👈 🔍*\n*📃Total: ${cust8.length}*\n\n`
               for (i = 0; i < cust8.length; i++) {
                  busq2 += `👤➸➸ TOKEN: *${cust8[i].token}*\nMOVIL: *${cust8[i].movil}*\nNOMBRE: *${cust8[i].nombre}*\n\n`
               }
               if (cust8.length > 0) {
                  res.end(busq2)
                  res.end()
               } else {
                  res.end(`No Se Encontraron Resultados...`)
                  res.end()
               }
               break
            default:
               break;

         }
      })
   }
}

module.exports = {
   codetunnel_action
}