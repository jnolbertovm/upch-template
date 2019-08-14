export default class {

  constructor(gulp, plugins, tasks) {

    this.className = 'clean';

    this.gulp = gulp;
    this.plgs = plugins;
    this.tasks = tasks;

  }

  init(bucket) {

    /**
     * CREA LA PRIMERA TAREA PARA LIMPIAR TODA LA CARPETA DIST
     */
    bucket.tasks.push(() => {
      this.gulp.task(this.className, (cb) =>
        (new this.tasks(this.gulp, this.plgs)).deleteFile(cb, global.routes.cleans.all));
    });

    //aSIGNA COMO PRIMERA TAREA PRINCIPAL
    bucket.namesMainTasks.push(this.className);

    return bucket;

  }

}