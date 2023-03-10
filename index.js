require('./variables.js')
const {
   cargar_datos_eco,
   cargar_datos_codetunnel,
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

const {
   eco_bot_action
} = require('./eco.js')

const {
   codetunnel_action
} = require('./codetunnel.js')
const server = http.createServer((req, res) => {
   const reqUrl = url.parse(req.url).pathname

   if (/\/codetunnel/.test(reqUrl)) {
      codetunnel_action(req, res)
   } else if (/\/codeletras/.test(reqUrl)) {
      res.end(reqUrl)
   } else if (/\/ticket/.test(reqUrl)) {
      console.log(reqUrl)
      res.end(reqUrl)
   } else if (/\/ecobot/.test(reqUrl)) {
      eco_bot_action(req, res)
   }else{
      res.end('<h1>Panel Web Code Err0r</h1><br><p>La Pagina Solicada No Existe</p>')
   }
});

server.listen(port, hostname, async() => {
   console.log(`Server running at http://${hostname}:${port}/`);

   global._usuarios_eco = JSON.stringify(await supabase_tablas('usuarios_eco', '*', 'database/eco_usuarios.json'))
   await cargar_datos_eco()
   
   await supabase
      .from('usuarios')
      .select('*')
      .eq('servidor', 'free1')
      .then(async (usuarios) => {
         if (usuarios.data) {
            global._usuario_codetunnel = JSON.stringify(usuarios.data)
            await cargar_datos_codetunnel()
         }
      })

});