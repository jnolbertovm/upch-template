import fs from "fs";
import path from "path";

/**
 * LA CLASE IMPORTER REVISA LOS COMENTARIOS @koala|@import
 * 
 * PARA LOS ARCHIVOS SCRIPTS, DEVUELVE UN ARRAY CON TODOS LOS SCRIPTS EN EL ORDEN DE IMPORTACION
 * PARA LOS ARCHIVOS DE TIPO STYLES, VUELVE UN OBJETO
 *  - includePaths => UN ARRAY CON TODOS LOS PATHS DE DE CARPETAS DONDE SE HA REVISADO LOS ARCHIVOS
 *  - importedFiles => UN ARRAY CON TODOS LOS STYLES EN EL ORDEN DE IMPORTACIÓN
 */

export default class importer {

  constructor() {
    this.file = {};
    this.includePaths = [];
    this.importedFiles = [];
    this.deepImports = [];
  }

  run(filePath) {

    var pathCollections = [];

    this.includePaths = [];
    this.importedFiles = [];
    this.deepImports = [];

    try {
      if (!fs.existsSync(filePath))
        throw "El archivo no existe";

      let ext = path.extname(filePath);

      switch (ext) {
        case '.less':
        case '.scss':
        case '.sass':
          this.file = {
            includes: [],
            imports: []
          };
          this.getCombinedFileStyles(filePath, ext);
          pathCollections = this.file;
          break;
        case '.js':
        case '.ts':
          this.file = {};
          pathCollections = this.getCombinedFileScripts(filePath, ext);
          break;
      }

      return pathCollections;

    } catch (Exception) {
      console.log(Exception + ': ' + filePath);
      return pathCollections;
    }

  }

  getImportScripts(srcFile, ext) {

    var reg = /@(?:koala|import)-(prepend|append)\s+(.*)/g,
      regFile = /["']([^.]+?|.+?(js|ts))["']/g,
      result, type, files,

      //get fullpath of imports
      dirnames = [path.dirname(srcFile)].concat(this.includePaths),
      fullPathImports = {
        prepend: [],
        append: []
      },
      fullimportPath,
      isExists,
      code = fs.readFileSync(srcFile, 'utf8');

    while ((result = reg.exec(code)) !== null) {

      type = result[1];
      files = result[2].split(',');

      for (let i = 0; i < files.length; i++) {

        // Volver el cursor de la expresión regular a 0
        regFile.lastIndex = 0;

        // Extrae en un array el path que se encuentra
        // entre comillas usando una expresión regular
        let file_arr = regFile.exec(files[0].trim());

        // En caso de no cumplir finaliza todo el proceso
        if (!file_arr) return;

        if (path.extname(file_arr[1]) !== ext) {
          file_arr[1] += ext;
        }

        isExists = false;

        for (let i = 0; i < dirnames.length; i++) {
          fullimportPath = path.resolve(dirnames[i], file_arr[1]);
          if (fs.existsSync(fullimportPath)) {
            fullPathImports[type].push(fullimportPath);
            isExists = true;
            break;
          }
        }

        // import file not found, throw error
        if (!isExists) {
          let error = [file_arr[1], srcFile, dirnames].join(' - ');
          throw "import file not found: " + error;
        }
      }
    }

    return fullPathImports;

  }

  getCombinedFileScripts(filePath, ext) {

    if (this.importedFiles.indexOf(filePath) !== -1) {
      return [];
    }

    var prepend = [],
      append = [],
      files = this.getImportScripts(filePath, ext);

    this.importedFiles.push(filePath);
    this.deepImports.push(files);

    for (let i = 0; i < files.prepend.length; i++) {
      if (this.importedFiles.indexOf(files.prepend[i]) === -1) {
        prepend.push.apply(prepend, this.getCombinedFileScripts(files.prepend[i], ext));
      }
    }

    for (let i = 0; i < files.append.length; i++) {
      if (this.importedFiles.indexOf(files.append[i]) === -1) {
        append.push.apply(append, this.getCombinedFileScripts(files.append[i], ext));
      }
    }

    return prepend.concat(filePath, append);
  }

  getImportStyles(srcFile, ext) {

    let reg = /@(?:import)\s+(.*);/g,
      regFile = /["']([^.]+?|.+?)["']/g,
      result, files,

      //get fullpath of imports
      dirnames = [path.dirname(path.resolve(srcFile))].concat(this.includePaths),
      fullPathImports = [],
      fullimportPath,
      isExists,
      code = fs.readFileSync(srcFile, 'utf8');

    while ((result = reg.exec(code)) !== null) {

      files = result[1].split(',');

      for (let i = 0; i < files.length; i++) {

        let result;

        regFile.lastIndex = 0;
        result = regFile.exec(files[i]);

        if (!result) return;
        //console.log(path.extname(result[1]), ext);
        if (path.extname(result[1]) != ext) result[1] += ext;

        isExists = false;

        for (let i = 0; i < dirnames.length; i++) {
          fullimportPath = path.resolve(dirnames[i], result[1]);

          if (fs.existsSync(fullimportPath)) {
            fullPathImports.push(fullimportPath);
            isExists = true;
          } else {
            let bname = path.basename(result[1]);
            result[1] = result[1].replace(bname, "_" + bname);
            fullimportPath = path.resolve(dirnames[i], result[1]);

            if (fs.existsSync(fullimportPath)) {
              fullPathImports.push(fullimportPath);
              isExists = true;
            }
          }
        }

        // import file not found, throw error
        if (!isExists) {
          let error = [result[1], srcFile, dirnames].join(' - ');
          throw 'import file not found: ' + error;
        }
      }
    }

    if (this.file.includes.indexOf(dirnames[0]) < 0) {
      this.file.includes.push(dirnames[0]);
    }

    return fullPathImports;

  }

  getCombinedFileStyles(filePath, ext) {

    if (this.importedFiles.indexOf(filePath) !== -1) return [];

    let imports = [],
      files = this.getImportStyles(filePath, ext);

    this.importedFiles.push(filePath);
    if(files){
      for (let i = 0; i < files.length; i++) {
        if (this.importedFiles.indexOf(files[i]) === -1) {
          imports.push.apply(imports, this.getCombinedFileStyles(files[i], ext));
        }
      }
    }

    this.file.imports = imports.concat(path.resolve(filePath));

    return this.file.imports;
  }

}