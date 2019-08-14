"use strict";

import path from 'path';
import {
  unlinkSync,
  existsSync,
  lstatSync,
  readdirSync
} from 'fs';

var extend = (target, source) => {
  if (source) {
    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        target[prop] = (typeof source[prop] === 'object') ? extend({}, source[prop]) : source[prop];
      }
    }
  }
  return target;
};


var ignoreTaskNames = (ignored, taskNames) => {

  let newArr = taskNames;

  for (let i in ignored) {
    let index = newArr.indexOf(ignored[i]);
    if (index !== -1) {
      newArr.splice(index, 1);
    }
  }

  return newArr;

};


/**
 * Convierte todos los backslash en slash muy comunes en las uri de windows
 * 
 * @param {String} _uri Path que será examinado
 */
var backslash2slash = (_uri) => path.normalize(_uri).replace(new RegExp('[\\\\]+', 'gi'), '/');


/**
 * Verifica si el path que se le esta pasando es un directorio.
 * 
 * @param  {String} source Path a ser buscado por la funcion y analizado si es un directorio.
 * @return {Boolean}        true si es un directorio de lo contrario devuelve false.
 */
var isDirectory = (source) => lstatSync(source).isDirectory();


/**
 * Obtiene todos los nombres de los directorios dentro de un directorio pero solo en el primer nivel
 * @param  {String} source Path del directorio.
 * @return {Array}        Devuelve un array con el path completo de los directorios que se encuentran dentro
 */
var getDirectories = (source) =>
  readdirSync(source).map((name) =>
    backslash2slash(path.join(source, name))).filter(isDirectory);


/**
 * Convierte el path, de un archivo PHP, que proviene del directorio 
 * src a su correspondiente ubicación en la carpeta dist
 * 
 * @param {String} pathFile Path formateado con la nueva ruta
 */
var getDestPath = (pathFile) => {

  var baseDir = backslash2slash(path.resolve(__dirname, '../../'));

  pathFile = backslash2slash(pathFile);

  if (pathFile.includes('src/modules')) {
    pathFile = pathFile.replace('modules', 'protected/modules');
  }

  let bases = new RegExp("src\\/+(extensions|components|gii|config|controllers|models|views)", "gi");
  if (bases.test(pathFile)) {
    pathFile = pathFile.replace('src', 'src/protected');
  }

  var regex = new RegExp((baseDir + '\\/src(\\/)*'), 'gi');
  var dir = path.dirname(pathFile.replace(regex, './dist/'));

  return dir;
};


var isAssetFile = (filename) => {

  let script = [".js", ".ts"];
  let styles = [".css", ".less", ".scss"];
  let images = [".jpg", ".jpeg", ".png", ".svg", ".ico"];
  let fonts = [".eot", ".ttf", ".woff", ".woff2", ".otf"];

  let assets = [];

  assets = assets.concat(script, styles, images, fonts);

  let extension = path.extname(filename);

  if (assets.indexOf(extension) > -1) {
    return true;
  } else {
    return false;
  }

};


var getFileNameToPath = (fpath) => {

  fpath = backslash2slash(fpath.toString());

  var filename = fpath.substring(fpath.lastIndexOf('/') + 1);
  return filename.substring(0, filename.lastIndexOf('.'));

};


var normalizeAssetFileName = (filename) => {

  filename = filename.toString();

  let script = [".js", ".ts"];
  let styles = [".css", ".less", ".scss"];
  let images = [".jpg", ".jpeg", ".png", ".svg", ".ico"];
  let fonts = [".eot", ".ttf", ".woff", ".woff2", ".otf"];

  let extension = path.extname(filename);
  let name = getFileNameToPath(filename);

  if (script.indexOf(extension) > -1) {
    return name + ".min.js";
  } else if (styles.indexOf(extension) > -1) {
    return name + ".min.css";
  } else if (images.indexOf(extension) > -1) {

    //Para las imagenes y fuentes se necesita examinar la ruta completa del archivo
    //que se modifico para poder extraerle las subcarpetas que se encuentran dentro
    // de sus carpetas principales(ejemplo: images o fonts)
    let matcher = path.normalize("/images/");
    let pos = filename.lastIndexOf(matcher);

    if (pos > -1) {
      return filename.substring(pos + matcher.length);
    } else {
      return name + extension;
    }

  } else if (fonts.indexOf(extension) > -1) {

    let matcher = path.normalize("/fonts/");
    let pos = filename.lastIndexOf(matcher);

    if (pos > -1) {
      return filename.substring(pos + matcher.length);
    } else {
      return name + extension;
    }
  }

  return filename;
};


var watcherAtRuntime = (cb, callback, dest) => {

  if (cb.event === "unlink") {

    try {

      var fpath = '';

      if (isAssetFile(cb.path)) {
        fpath = path.normalize(dest + '/' + normalizeAssetFileName(cb.path, dest));
      } else {
        fpath = path.normalize(getDestPath(cb.path) + "/" + path.basename(cb.path));
      }

      if (existsSync(fpath)) {
        unlinkSync(fpath);
      } else {
        throw {
          name: 'Not Found',
          message: "No se encontro el archivo: " + fpath
        };
      }

      require('fancy-log')("Archivo Eliminado: " + fpath);
      require('node-notifier').notify({
        title: "Archivo Eliminado: ",
        message: fpath
      });

    } catch (ex) {
      require('fancy-log')("Error: " + ex.name + " | " + ex.message);
      require('node-notifier').notify({
        title: "Error: " + ex.name,
        message: ex.message
      });
    }

  } else {
    callback();
  }
};

export {
  watcherAtRuntime,
  getDestPath,
  getDirectories,
  extend,
  ignoreTaskNames
};