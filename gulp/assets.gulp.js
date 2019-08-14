/* globals global */
import fs from 'fs';
import path from 'path';

import {
  watcherAtRuntime
} from './components/utils.gulp';


export default class {

  constructor(gulp, plugins, tasks) {

    this.className = 'assets';
    this.gulp = gulp;
    this.plgs = plugins;
    this.tasks = tasks;

  }

  init(bucket) {

    var assets = global.routes.assets;
    var subtasks = [];
    let scriptTaskName = `${this.className}${global.div}scripts`,
      styleTaskName = `${this.className}${global.div}styles`;

    if (this.scripts(bucket, assets.scripts, scriptTaskName)) subtasks.push(scriptTaskName);
    if (this.styles(bucket, assets.styles, styleTaskName)) subtasks.push(styleTaskName);

    if (subtasks.length) {
      bucket.tasks.push(() => {
        this.gulp.task(this.className, this.gulp.series(subtasks));
      });

      bucket.namesMainTasks.push(this.className);
    }

    return bucket;

  }


  scripts(bucket, route, taskName) {

    let tasks_arr = [];

    //Busca todos los archivos de una ruta y luego filtra en base a que existan
    let filesJS = this.plgs.glob.sync(route.src).filter((value) =>
      fs.existsSync(value) && path.extname(value) === '.js' && path.basename(value).indexOf("_") !== 0
    );
    let filesTS = this.plgs.glob.sync(route.src).filter((value) =>
      fs.existsSync(value) && path.extname(value) === '.ts' && path.basename(value).indexOf("_") !== 0
    );

    if (filesJS.length) {
      let tskname = `${taskName}${global.div}js`;
      bucket.tasks.push(this.scriptsTask(tskname, filesJS, route.dest));
      tasks_arr.push(tskname);
    }

    if (filesTS.length) {
      let tskname = `${taskName}${global.div}ts`;
      bucket.tasks.push(this.scriptsTask(tskname, filesTS, route.dest, 'ts'));
      tasks_arr.push(tskname);
    }

    bucket.watchs.push(this.scriptsWatch(route.src, route.dest));

    if (tasks_arr.length) {

      bucket.tasks.push(() => {
        this.gulp.task(taskName, this.gulp.series(tasks_arr));
      });

      return bucket;
    }

    return false;

  }


  styles(bucket, route, taskName) {

    let tasks_arr = [];

    //Busca todos los archivos de una ruta y luego filtra en base a que existan
    let filesLESS = this.plgs.glob.sync(route.src).filter((value) =>
      fs.existsSync(value) && path.extname(value) === '.less' && path.basename(value).indexOf("_") !== 0);

    let filesSCSS = this.plgs.glob.sync(route.src).filter((value) =>
      fs.existsSync(value) && path.extname(value) === '.scss' && path.basename(value).indexOf("_") !== 0);

    let filesCSS = this.plgs.glob.sync(route.src).filter((value) =>
      fs.existsSync(value) && path.extname(value) === '.css' && path.basename(value).indexOf("_") !== 0);

    if (filesLESS.length) {
      let tskname = `${taskName}${global.div}less`;
      bucket.tasks.push(this.stylesTask(tskname, filesLESS, route.dest));
      tasks_arr.push(tskname);
    }

    if (filesSCSS.length) {
      let tskname = `${taskName}${global.div}scss`;
      bucket.tasks.push(this.stylesTask(tskname, filesSCSS, route.dest, 'scss'));
      tasks_arr.push(tskname);
    }

    if (filesCSS.length) {
      let tskname = `${taskName}${global.div}css`;
      bucket.tasks.push(this.stylesTask(tskname, filesCSS, route.dest, 'css'));
      tasks_arr.push(tskname);
    }

    bucket.watchs.push(this.stylesWatch(route.src, route.dest));

    if (tasks_arr.length) {

      bucket.tasks.push(() => {
        this.gulp.task(taskName, this.gulp.series(tasks_arr));
      });

      return bucket;

    }

    return false;

  }


  scriptsTask(taskname, files, dest, type) {

    return () => {
      type = type || 'js';

      this.gulp.task(taskname, (cb) => {
        let tsk = new this.tasks(this.gulp, this.plgs);
        return (type == 'js') ? tsk.javascript(cb, files, dest) : tsk.typescript(cb, files, dest);
      });
    };

  }


  scriptsWatch(pattern, dest) {

    return () => {

      this.plgs.watch(pattern, (cb) => {

        return watcherAtRuntime(cb, () => {

          let tsk = new this.tasks(this.gulp, this.plgs);

          return (path.extname(cb.path) == '.js') ? tsk.javascript(cb, cb.path, dest) : tsk.typescript(cb, cb.path, dest);

        }, dest);

      });

    };

  }


  stylesTask(taskname, files, dest, type) {

    return () => {

      type = type || 'less';

      this.gulp.task(taskname, (cb) => {
        return (new this.tasks(this.gulp, this.plgs)).styles(cb, files, dest, type);
      });

    };

  }


  stylesWatch(pattern, dest) {

    return () => {

      this.plgs.watch(pattern, (cb) => {
        return watcherAtRuntime(cb, () => {
          let type = path.extname(cb.path).replace('.', '');
          return (new this.tasks(this.gulp, this.plgs)).styles(cb, cb.path, dest, type);
        }, dest);
      });

    };

  }

}