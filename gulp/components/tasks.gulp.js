/* globals global */

import path from 'path';

import importer from './imports.gulp';

import {
  getDestPath
} from './utils.gulp';


export default class {

  /**
   * 
   * @param {Object} gulp     Intancia de gulp declarado en el gulpfile.
   * @param {Object} plugins  Objeto qe contiene todos los plugins declarados.
   */
  constructor(gulp, plugins) {

    this.gulp = gulp;
    this.plgs = plugins;

  }


  /**
   * Funcion para las tareas que manejan los archivos javascript, 
   * permite codificar en versiones de javascript 5, es6 y es2017 
   * y usa babel para transpilarlo a es2015
   * 
   * @param {Function|Object}   cb    Callback de gulp. En los watch este valor es un objeto vanyl
   * @param {String|Array}      src   Path o patrón que define donde ubicar los archivos
   * @param {String}            dest  Path que define donde serán ubicados los archivos procesados
   */
  javascript(cb, src, dest) {

    var gexec = {};

    let isTask = typeof cb.path === 'undefined';

    let files = this.getFilesNormalized(cb, (!Array.isArray(src) ? [src] : src), isTask);

    for (let i = 0; i < files.length; i++) {

      gexec = this.gulp.src(files[i].imports)
        .pipe(this.plgs.plumber({
          errorHandler: (error) => {
            this.reportError(error);
          }
        }))
        .pipe(this.plgs.gulpif(global.main.mapper, this.plgs.sourcemaps.init(global.params.sourcemaps)))
        .pipe(this.plgs.concat(files[i].name))
        .pipe(this.plgs.babel(global.params.babel))
        .pipe(this.plgs.gulpif(global.main.isProd, this.plgs.uglify()))
        .pipe(this.plgs.rename(global.params.rename))
        .pipe(this.plgs.plumber.stop())
        .pipe(this.gulp.dest(dest))
        .pipe(this.plgs.gulpif(!isTask, this.notify(cb)))
        .pipe(this.plgs.reload(global.params.bSyncReload))
        .pipe(this.plgs.gulpif(global.main.mapper, this.plgs.sourcemaps.write('.')))
        .pipe(this.plgs.gulpif(global.main.mapper, this.gulp.dest(dest)));

    }

    return gexec;

  }


  /**
   * Funcion para las tareas que manejan los archivos typescript, 
   * transpila en es6 y usa babel para transpilarlo a es2015
   * 
   * @param {Function|Object}   cb    Callback de gulp. En los watch este valor es un objeto vanyl
   * @param {String|Array}      src   Path o patrón que define donde ubicar los archivos
   * @param {String}            dest  Path que define donde serán ubicados los archivos procesados
   */
  typescript(cb, src, dest) {

    var gexec = {};

    let isTask = typeof cb.path === 'undefined',
      files = this.getFilesNormalized(cb, (!Array.isArray(src) ? [src] : src), isTask);

    for (let i = 0; i < files.length; i++) {

      let tsProject = this.plgs.ts.createProject(global.params.typescript);
      let rename = Object.assign({}, global.params.rename, {
        extname: '.js'
      });

      gexec = this.gulp.src(files[i].imports)
        .pipe(this.plgs.plumber((error) => {
          this.reportError(error);
        }))
        .pipe(this.plgs.gulpif(global.main.mapper, this.plgs.sourcemaps.init(global.params.sourcemaps)))
        .pipe(tsProject())
        .pipe(this.plgs.concat(files[i].name))
        .pipe(this.plgs.babel(global.params.babel))
        .pipe(this.plgs.rename(rename))
        .pipe(this.plgs.gulpif(global.main.isProd, this.plgs.uglify()))
        .pipe(this.plgs.plumber.stop())
        .pipe(this.gulp.dest(dest))
        .pipe(this.plgs.gulpif(!isTask, this.notify(cb)))
        .pipe(this.plgs.reload(global.params.bSyncReload))
        .pipe(this.plgs.gulpif(global.main.mapper, this.plgs.sourcemaps.write('.')))
        .pipe(this.plgs.gulpif(global.main.mapper, this.gulp.dest(dest)));

    }

    return gexec;

  }


  /**
   * Funcion que maneja el llamado de las diferentes funciones para estilos
   * 
   * @param {Function|Object}   cb    Callback de gulp. En los watch este valor es un objeto vanyl
   * @param {String|Array}      src   Path o patrón que define donde ubicar los archivos
   * @param {String}            dest  Path que define donde serán ubicados los archivos procesados
   * @param {String}            ext   Extension que permite indentificar el tipo de funcion que será llamado 
   */
  styles(cb, src, dest, ext) {

    if (ext === 'scss') {
      return this.scss(cb, src, dest);
    } else if (ext === 'less') {
      return this.less(cb, src, dest);
    } else if (ext === 'css') {
      return this.css(cb, src, dest);
    } else {
      cb();
    }

  }


  /**
   * Funcion para las tareas que manejan los archios less
   * 
   * @param {Function|Object}   cb    Callback de gulp. En los watch este valor es un objeto vanyl
   * @param {String|Array}      src   Path o patrón que define donde ubicar los archivos
   * @param {String}            dest  Path que define donde serán ubicados los archivos procesados
   */
  less(cb, src, dest) {

    var gexec = {};

    let isTask = typeof cb.path === "undefined",
      files = this.getFilesNormalized(cb, (!Array.isArray(src) ? [src] : src), isTask, 'style');

    for (let i = 0; i < files.length; i++) {

      let lessOptions = Object.assign({}, global.params.less, {
        paths: files[i].includes
      });

      gexec = this.gulp.src(files[i].path)
        .pipe(this.plgs.plumber({
          errorHandler: (error) => {
            this.reportError(error);
          }
        }))
        .pipe(this.plgs.gulpif(global.main.mapper, this.plgs.sourcemaps.init(global.params.sourcemaps)))
        .pipe(this.plgs.less(lessOptions))
        .pipe(this.plgs.rename(global.params.rename))
        .pipe(this.plgs.autoprefixer(global.params.autoprefixer))
        .pipe(this.plgs.gulpif(global.main.isProd, this.plgs.cleanCSS(global.params.cleanCSS)))
        .pipe(this.plgs.plumber.stop())
        .pipe(this.gulp.dest(dest))
        .pipe(this.plgs.gulpif(!isTask, this.notify(cb)))
        .pipe(this.plgs.reload(global.params.bSyncReload))
        .pipe(this.plgs.gulpif(global.main.mapper, this.plgs.sourcemaps.write('.')))
        .pipe(this.plgs.gulpif(global.main.mapper, this.gulp.dest(dest)));

    }

    return gexec;

  }


  /**
   * Funcion para las tareas que manejan los archios scss(SASS)
   * 
   * @param {Function|Object}   cb    Callback de gulp. En los watch este valor es un objeto vanyl
   * @param {String|Array}      src   Path o patrón que define donde ubicar los archivos
   * @param {String}            dest  Path que define donde serán ubicados los archivos procesados
   */
  scss(cb, src, dest) {

    var gexec = {};

    let isTask = typeof cb.path === 'undefined',
      files = this.getFilesNormalized(cb, (!Array.isArray(src) ? [src] : src), isTask, 'style');

    for (let i = 0; i < files.length; i++) {

      let sassOptions = Object.assign({}, global.params.sass, {
        includes: files[i].includes
      });

      gexec = this.gulp.src(files[i].path)
        .pipe(this.plgs.plumber({
          errorHandler: (error) => {
            this.reportError(error);
          }
        }))
        .pipe(this.plgs.gulpif(global.main.mapper, this.plgs.sourcemaps.init(global.params.sourcemaps)))
        .pipe(this.plgs.sass(sassOptions))
        .pipe(this.plgs.rename(global.params.rename))
        .pipe(this.plgs.autoprefixer(global.params.autoprefixer))
        .pipe(this.plgs.plumber.stop())
        .pipe(this.gulp.dest(dest))
        .pipe(this.plgs.gulpif(!isTask, this.notify(cb)))
        .pipe(this.plgs.reload(global.params.bSyncReload))
        .pipe(this.plgs.gulpif(global.main.mapper, this.plgs.sourcemaps.write('.')))
        .pipe(this.plgs.gulpif(global.main.mapper, this.gulp.dest(dest)));

    }

    return gexec;

  }


  /**
   * Funcion para las tareas que manejan los archios less
   * 
   * @param {Function|Object}   cb    Callback de gulp. En los watch este valor es un objeto vanyl
   * @param {String|Array}      src   Path o patrón que define donde ubicar los archivos
   * @param {String}            dest  Path que define donde serán ubicados los archivos procesados
   */
  css(cb, src, dest) {

    let isTask = typeof cb.path === undefined;

    return this.gulp.src(src)
      .pipe(this.plgs.plumber({
        errorHandler: (error) => {
          this.reportError(error);
        }
      }))
      .pipe(this.plgs.gulpif(global.main.mapper, this.plgs.sourcemaps.init(global.params.sourcemaps)))
      .pipe(this.plgs.cleanCSS(global.params.cleanCSS))
      .pipe(this.plgs.autoprefixer(global.params.autoprefixer))
      .pipe(this.plgs.rename(global.params.rename))
      .pipe(this.plgs.plumber.stop())
      .pipe(this.gulp.dest(dest))
      .pipe(this.plgs.gulpif(!isTask, this.notify(cb)))
      .pipe(this.plgs.reload(global.params.bSyncReload))
      .pipe(this.plgs.gulpif(global.main.mapper, this.plgs.sourcemaps.write('.')))
      .pipe(this.plgs.gulpif(global.main.mapper, this.gulp.dest(dest)));

  }


  images(cb, src, dest) {
    return this.copyAndPaste(cb, src, dest);
  }


  copyAndPaste(cb, src, dest) {

    let isTask = typeof cb.path === "undefined";

    dest = (isTask) ? dest : getDestPath(cb.path);
    src = (isTask) ? src : cb.path;

    return this.gulp.src(src, {allowEmpty: true})
      .pipe(this.gulp.dest(dest))
      .pipe(this.plgs.gulpif(!isTask, this.notify(cb)))
      .pipe(this.plgs.reload(global.params.bSyncReload));

  }

  createFile(cb, filename, file, dest) {
    return this.plgs.file(filename, file, global.params.file)
      .pipe(this.gulp.dest(dest))
      .pipe(this.plgs.reload(global.params.bSyncReload));
  }


  /**
   * Funcion para las tareas de eliminar directorios y/o archivos
   * 
   * @param {Function} cb Callback de gulp
   * @param {String|Array} src Paths o Patrones de los archivo y/o directorios a eliminar
   */
  deleteFile(cb, src) {
    return this.plgs.del((!Array.isArray(src)) ? [src] : src, cb);
  }


  /**
   * Funcion que structura a todos los archivos exportables(aquellos que tienen el underline(_)) 
   * y exportadores(Aquellos que dentro de su escript llaman a los archivos exportables).
   * Todos los archivos son estructurados de la siguiente manera:
   * {
   *    "handlerScriptFiles": []
   *    "handlerStyleFiles" []
   * }
   * 
   * Dentro de cada handler se almacenan en un array objetos que contienen la siguien informacion:
   * [
   *    {
   *        name: [String] nombre.extension del archivo principal
   *        path: [String] ruta completa del archivo principal,
   *        imports: [Array] Lista con todos los archivos hijos que contienen underscore
   *        includes: [Array] Lisa de directorios en donde se encontraron archivos. Este es exclusivos de los estilos
   *    },
   * ]
   * 
   * @param {Object} cb Objeto vanyl que devuelve el gulp en un watch, en una tarea el valor es undefined
   * @param {Array} files Paths o Patrones que permiten la busqueda de los archivos
   * @param {Boolean} isTask Valor que identificar si es un tarea o un watch
   * @param {String} type Valor que identifica si son archivos de tipo scripts o styles
   */
  getFilesNormalized(cb, files, isTask, type) {

    type = type || 'script';

    var objName = (type === 'script') ? 'handlerScriptFiles' : 'handlerStyleFiles';
    var filesObj = [];

    // Cuando es una tarea los archivos han sido previamente filtrados
    // y solo llegan los archivos sin underline(_)
    if (isTask) {

      for (let i = 0; i < files.length; i++) {

        const importers = (new importer()).run(path.resolve(global.main.baseDir, files[i]));
        const item = {
          name: path.basename(files[i]),
          path: path.resolve(global.main.baseDir, files[i])
        };

        if (type === 'script') {
          item.imports = importers;
        } else {
          item.imports = importers.imports;
          item.includes = importers.includes;
        }

        filesObj.push(item);
        global[objName].push(item);

      }

    } else { // Cuando es un watch no tiene filtro

      // Revisar si el archivo tiene el underline(_)
      if (path.basename(cb.path).indexOf("_") !== 0) {

        //Revisa si el path ya se encuentra regitrado
        let index = global[objName].findIndex(obj => obj.path === cb.path);
        let item = {};

        //Si el valor es menos de 0 es que es un nuevo archivo principal
        //de no serlo crea un nuevo item que será agregado al objeto global
        if (index >= 0) {
          item = global[objName][index];
        } else {
          item = {
            name: path.basename(cb.path),
            path: cb.path
          };
        }

        const importers = (new importer()).run(cb.path);

        if (type === "script") {
          item.imports = importers;
        } else {
          item.imports = importers.imports;
          item.includes = importers.includes;
        }

        //Agregar a la lista de los archivos que serán transpilados
        filesObj.push(item);

        //Sino fue encontrado agregalo a la lista general
        //Para una proxima busqueda de uno de sus archivos modificados
        if (index < 0) {
          global[objName].push(item);
        }

      } else { //Esta seccion revisa todos los archivos importables (_)

        global[objName].forEach(element => {

          //Si el actual archivo se encuentra en este elemento
          //Nota: Recuerda que un mismo archivo con el underline(_)
          //      puede estar asignado a diferentes imports de otros archivos
          if (element.imports.indexOf(cb.path) > -1) {

            let importers = (new importer()).run(element.path);

            let item = {
              name: element.name,
              path: element.path
            };

            //Agregamos los item que serán enviados y actualizamos la lista general
            if (type === "script") {

              item.imports = importers;
              element.imports = importers;

            } else {

              item.imports = importers.imports;
              item.includes = importers.includes;

              element.imports = importers.imports;
              element.includes = importers.includes;

            }

            filesObj.push(item);

          }

        });
      }
    }

    return filesObj;
  }


  notify(cb) {

    let pnoty = Object.assign({}, global.params.notify);

    if (cb.event === 'add') {
      pnoty.title = 'Se agregó un nuevo archivo';
    } else if (cb.event === 'unlink') {
      pnoty.title = 'Se elimino el archivo:';
    } else {
      pnoty.title = 'Se modificó el archivo:';
    }

    return this.plgs.notify(pnoty);

  }


  /**
   * Funcion que permite la notificacion, tanto en ventana como en consola
   * para todos los errores que captura el plugin plumber.
   * 
   * @param {Object} error Objeto que contiene la información del error.
   */
  reportError(error) {

    try {

      let lineNumber = error.lineNumber || error.line || error.startPosition.line || 0;
      let file = error.fileName || error.relativeFilename || error.file || "undefined";
      let textLine = (lineNumber) ? "Linea: " + lineNumber + " -- " : '';
      let plugin = error.plugin || error.name;


      let report = '';
      let color = this.plgs.gColor;

      report += color.bold(color.red('TASK:')) + color.white(' [' + plugin + ']') + '\n';
      report += (file) ? color.bold(color.red('FILE:')) + color.white(' ' + file) + '\n' : '';
      report += (lineNumber) ? color.bold(color.red('LINE:')) + color.white(' ' + lineNumber) + '\n' : '';
      report += color.bold(color.red('PROB:')) + color.white(' ' + error.message) + '\n';

      this.plgs.log(report);

      return this.plgs.notify({
        title: 'Error: [' + plugin + ']',
        message: 'Archivo: ' + path.basename(file) + '\n' + textLine + 'Ver en consola.'
      }).write(error);

    } catch (ex) {

      this.plgs.log(error.message);

      return this.plgs.notify({
        title: "ERROR INDEFINIDO:",
        message: "REVISE LA CONSOLA"
      }).write(error);

    }
  }

}