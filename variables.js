global.axios = require('axios')
global.https = require('node:https')
global.url = require("url");
global.uuid = require('uuid');
global.http = require('http');
global.fs = require('fs');
global.exec = {
   exec
} = require('child_process');

global.ngrok_iori = ''
global.p_consulta_ban = 15
global.p_desbloqueo = 35
global.p_dia = 250
global.administradores = []
global.clientes = []
global.bot = []

let { createClient } = require('@supabase/supabase-js')

global.SUPABASE_URL = 'https://amxdplkllskoizsppaey.supabase.co'
global.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteGRwbGtsbHNrb2l6c3BwYWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjA0MjE3ODMsImV4cCI6MTk3NTk5Nzc4M30.csONiNj9ZtCdJH6S1r_gWQa-roStDukBWIaHrgjKcys'
global.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

global.servidor = 'eco'
global.hostname = '0.0.0.0';
global.port = 3000;

if(!fs.existsSync("database/ventas.txt")) fs.writeFileSync("database/ventas.txt", "")
if(!fs.existsSync("database/eco_usuarios.json")) fs.writeFileSync("database/eco_usuarios.json", "[]")
if(!fs.existsSync("database/eco_admin.json")) fs.writeFileSync("database/eco_admin.json", "[]")
if(!fs.existsSync("database/eco_historial.json")) fs.writeFileSync("database/eco_historial.json", "[]")
if(!fs.existsSync("database/data.json")) fs.writeFileSync("database/data.json", "[]")

global._usuarios_eco = fs.readFileSync('database/eco_usuarios.json', 'utf8')
global._admin_eco = fs.readFileSync('database/eco_admin.json', 'utf8')
global._historial_eco = fs.readFileSync('database/eco_historial.json', 'utf8')
global.registros_json = fs.readFileSync('database/data.json', 'utf8')
global.WIFI_TXT = fs.readFileSync('database/wifi.txt', 'utf8')

global.WIFI_CUSTOMER = JSON.parse(WIFI_TXT)
global.tabla_eco = JSON.parse(_usuarios_eco)
global.new_customer_json = JSON.parse(registros_json)


if(!fs.existsSync("database/canciones.json")) fs.writeFileSync("database/canciones.json", "[]")
//if(!fs.existsSync("usuarios.json")) fs.writeFileSync("usuarios.json", "[]")
if(!fs.existsSync("database/codetunnel.json")) fs.writeFileSync("database/codetunnel.json", "[]")
if(!fs.existsSync("database/free.mz")) fs.writeFileSync("database/free.mz", "")
if(!fs.existsSync("database/premium.mz")) fs.writeFileSync("database/premium.mz", "")


global._canciones = fs.readFileSync('database/canciones.json', 'utf8')
global._usuario_codetunnel = fs.readFileSync('database/codetunnel.json', 'utf8')

global._tabla_codetunnel = JSON.parse(global._usuario_codetunnel)
//global.tabla_canciones = 
global.api_create_uuid = () => {
	return `${uuid.v4()}`
}