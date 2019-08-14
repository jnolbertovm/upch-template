import main from './main.gulp';

export default {
  bSyncReload: {
    stream: true
  },
  browserSync: {
    proxy: {
      target: ""
    },
    port: 3000,
    open: false,
    notify: true
  },
  babel: {
    babelrc: false,
    presets: [
      "@babel/preset-env"
    ],
    plugins: [
      "@babel/plugin-proposal-object-rest-spread"
    ]
  },
  notify: {
    title: "Se modificó un archivo",
    message: "<%= file.relative %> "
  },
  sourcemaps: {
    loadMaps: true,
    largeFile: true
  },
  rename: {
    suffix: '.min'
  },
  cleanCSS: {
    compatibility: 'ie8'
  },
  less: {
    javascriptEnabled: true,
    paths: []
  },
  sass: {
    outputStyle: 'compressed',
    includePaths: []
  },
  autoprefixer: {
    browsers: ['last 2 versions'],
    supports: 'ie8',
    cascade: false,
    grid: true
  },
  file: {
    src: true
  },
  typescript: {
    noImplicitAny: true,
    noEmitOnError: true,
    removeComments: false,
    target: "ES2016",
    lib: ["dom", "es6", "es2016.array.include"],
    typeRoots: ["node_modules/@types"]
  }
};