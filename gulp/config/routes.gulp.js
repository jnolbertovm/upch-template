import main from './main.gulp';

const SRC = global.src;
const DIST = global.dist;

export default {
  assets: {
    scripts: {
      src: SRC + 'scripts/**/*+(.js|.ts)',
      dest: main.destScripts
    },
    styles: {
      src: SRC + 'styles/**/*+(.less|.scss|.css)',
      dest: main.destStyles
    }
  },
  cleans: {
    all: [
      './dist/*(css|js)/**'
    ]
  }
};