/* globals global */
"use strict";

import events from "events";

events.EventEmitter.prototype._maxListeners = 150;


import gulp from "gulp";


import {
  ignoreTaskNames
} from "./gulp/components/utils.gulp";


/**
 * PARAMETROS PRINCIPALES QUE MANEJAN LAS TAREAS
 */
import main from "./gulp/config/main.gulp";
global.main = Object.assign({}, main, {
  isProd: false,
  mapper: false
});


/**
 * PARAMETROS QUE MANEJAN LOS PLUGINS
 */
import parametters from "./gulp/config/params.gulp";
var params = Object.assign({}, parametters, {
  browserSync: {
    open: false,
    port: 2500,
    proxy: {
      target: "http://localhost/theme-upch/dist"
    }
  }
});

global.params = params;


/**
 * Variables globales que contienen los objetos con las descripciones
 * de cada archivo principal(aquellos que no tienen el underscore [_]).
 * Se almacenan para ser recorridos en el watch y asi determinar que 
 * archivo importable(aquellos que tienen el prefijo underscore), se encuentran
 * registrados en imports y asi ejecutar la tarea correspondiente. Ejem:
 * [
    {
      name: [String] nombre.extension del archivo principal
      path: [String] ruta completa del archivo principal,
      imports: [Array] Lista con todos los archivos hijos que contienen underscore
    }
 * ]
 */
global.handlerScriptFiles = [];
global.handlerStyleFiles = [];


//oBJECTO PARA LAS FUNCIONES QUE CONTIENEN
//TODOS LAS TAREAS, WATCHER Y NOMBRES DE TAREAS PRINCIPALES
var bucket = {
  namesMainTasks: [],
  tasks: [],
  watchs: []
};


/**
 * OBJETO QUE MANEJA LAS RUTAS PARA TODOS LOS ARCHIVOS DENTRO DE 
 * LA CARPETA SRC Y OTRAS RUTAS DE ARCHIVOS PRINCIPALES.
 * (LA MAYORIA DE ARCHIVOS TOMAN COMO NOMBRES SUS CLAVES PRINCIPALES)
 */
import routes from "./gulp/config/routes.gulp";
global.routes = routes;


//OBJETO QUE CONTIENE TODOS LOS PLUGINS
import plugins from "./gulp/config/plugins.gulp";


//CLASE QUE CONTIENE TODAS LAS TAREAS
import tasks from "./gulp/components/tasks.gulp";




//CLASES QUE SE ENCARGAN DE ESTRUCTURAR TODA LA APLICACIÓN
//USANDO TODOS LOS ARCHIVOS ANTERIORES
import assets from "./gulp/assets.gulp";
import clean from "./gulp/clean.gulp";


/**
 * iNICIA LOS METODOS DE CLASES QUE SE ENCARGAN DE RECOLECTAR TODAS LAS FUNCIONES
 * QUE CONTIENEN LAS TAREAS(bucket.tasks) Y LOS WATCHER(bucket.watchs).
 * ASI TAMBIEN LOS NOMBRES DE LAS TAREAS PRINCIPALES(bucket.namesMainTasks) 
 * QUE SERAN PUESTOS EN EL DEFAULT
 */
(new clean(gulp, plugins, tasks)).init(bucket);
(new assets(gulp, plugins, tasks)).init(bucket);


/**
 * PENULTIMA TAREA PRINCIPAL A SER LISTADA Y QUE SE ENCARGARÁ DEL 
 * REFRESCADO DEL NAVEGADOR
 */
bucket.tasks.push(() => {
  gulp.task("browser-sync", (cb) => {
    plugins.bsync(params.browserSync);
    cb();
  });
});

bucket.namesMainTasks.push("browser-sync");

/**
 * ULTIMA TAREA QUE EJECUTA LAS FUNCIONES QUE CONTIENEN LOS WATCHS
 */
bucket.tasks.push(() => {

  gulp.task("watch", (cb) => {

    for (let fn in bucket.watchs) {
      if (bucket.watchs.hasOwnProperty(fn)) {
        bucket.watchs[fn]();
      }
    }
    
    cb();

  });

});

bucket.namesMainTasks.push("watch");


/**
 * EJECUTANDO TODAS LAS FUNCIONES QUE CONTIENE
 * LAS TAREAS EN EL ORDEN QUE FUERON AGREGADOS
 */
for (let fn in bucket.tasks) {
  if (bucket.tasks.hasOwnProperty(fn)) {
    bucket.tasks[fn]();
  }
}

gulp.task("default", gulp.series(bucket.namesMainTasks));


//TAREA INVIDUAL QUE CONSTRUYE EL APLICATIVO
// PERO QUE NO TIENE NI LOS WATCHS NI EL BROWSER-SYNC
gulp.task("refresh", gulp.series(ignoreTaskNames(["watch", "browser-sync"], bucket.namesMainTasks)));