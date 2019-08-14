const BASE_DIR = require('path').resolve(__dirname, '../../');
const SRC = './src/';
const DIST = './dist/';

const STATIC_DIR = DIST;

global.div = '||';
global.src = SRC;
global.dist = DIST;

export default {
  isProd: false,
  linter: true, //INSPECCIONA LA CORRECTA SINTAXIS DEL CODIGO A TODOS LOS SCRIPTS Y STYLES
  valid: true, //INSPECCIONA ERRORES EN EL CODIGO DE LOS ARCHIVOS SCRIPTS Y STYLES
  mapper: true, //CREA A TODOS LOS ARCHIVOS DE TIPO STYLE EL *.map,
  baseDir: BASE_DIR,
  staticDir: STATIC_DIR,
  destStyles: (STATIC_DIR + 'css'),
  destScripts: (STATIC_DIR + 'js'),
  extensions: {
    script: [".js", ".ts"],
    style: [".css", ".less", ".scss"]
  }
};