const path = require('path')
const gulp = require('gulp')
const gulpLoadPlugins = require('gulp-load-plugins')
const minimist = require('minimist')
const del = require('del')
const Comb = require('csscomb')
const standard = require('standard')
const browserSync = require('browser-sync')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

const config = require('./config')
const data = require('./data')

const $ = gulpLoadPlugins()
const bs = browserSync.create()
const argv = minimist(process.argv.slice(2))
const isProd = process.env.NODE_ENV
  ? process.env.NODE_ENV === 'production'
  : argv.production || argv.prod || false

const clean = () => {
  return del([config.temp, config.dest])
}

const lint = done => {
  const comb = new Comb(require('./.csscomb.json'))
  comb.processPath(config.src)
  const cwd = path.join(__dirname, config.src)
  standard.lintFiles(config.paths.scripts, { cwd, fix: true }, done)
}

const style = () => {
  return gulp
    .src(config.paths.styles, {
      cwd: config.src,
      base: config.src,
      sourcemaps: !isProd
    })
    .pipe($.plumber({ errorHandler: $.sass.logError }))
    .pipe(
      $.sass.sync({
        outputStyle: 'expanded',
        precision: 10,
        includePaths: ['.']
      })
    )
    .pipe($.postcss([autoprefixer()]))
    .pipe(gulp.dest(config.temp, { sourcemaps: '.' }))
    .pipe(bs.reload({ stream: true }))
}

const script = () => {
  return gulp
    .src(config.paths.scripts, {
      cwd: config.src,
      base: config.src,
      sourcemaps: !isProd
    })
    .pipe($.plumber())
    .pipe($.babel({ presets: ['@babel/preset-env'] }))
    .pipe(gulp.dest(config.temp, { sourcemaps: '.' }))
    .pipe(bs.reload({ stream: true }))
}

const page = () => {
  return gulp
    .src(config.paths.pages, {
      cwd: config.src,
      base: config.src,
      ignore: ['{layouts,partials}/**']
    })
    .pipe($.plumber())
    .pipe(
      $.swig({ defaults: { cache: false, locals: data(`${config.src}/data`) } })
    )
    .pipe(gulp.dest(config.temp))
  // use bs-html-injector instead
  // .pipe(bs.reload({ stream: true }))
}

const useref = () => {
  // https://beautifier.io
  const beautifyOpts = { indent_size: 2, max_preserve_newlines: 1 }
  // https://github.com/mishoo/UglifyJS2#minify-options
  const uglifyOpts = { compress: { drop_console: true } }
  // https://cssnano.co/guides/
  const postcssOpts = [cssnano({ safe: true, autoprefixer: false })]
  // https://github.com/kangax/html-minifier#options-quick-reference
  const htmlminOpts = {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    processConditionalComments: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true
  }

  return gulp
    .src(config.paths.pages, { cwd: config.temp, base: config.temp })
    .pipe($.plumber())
    .pipe($.useref({ searchPath: ['.', '..'] }))
    .pipe(
      $.if(
        /\.js$/,
        $.if(isProd, $.uglify(uglifyOpts), $.beautify.js(beautifyOpts))
      )
    )
    .pipe(
      $.if(
        /\.css$/,
        $.if(isProd, $.postcss(postcssOpts), $.beautify.css(beautifyOpts))
      )
    )
    .pipe(
      $.if(
        /\.html$/,
        $.if(isProd, $.htmlmin(htmlminOpts), $.beautify.html(beautifyOpts))
      )
    )
    .pipe(gulp.dest(config.dest))
}

const image = () => {
  return gulp
    .src(config.paths.images, {
      cwd: config.src,
      base: config.src,
      since: gulp.lastRun(image)
    })
    .pipe($.plumber())
    .pipe($.if(isProd, $.imagemin()))
    .pipe(gulp.dest(config.dest))
}

const font = () => {
  return gulp
    .src(config.paths.fonts, { cwd: config.src, base: config.src })
    .pipe($.plumber())
    .pipe($.if(isProd, $.imagemin()))
    .pipe(gulp.dest(config.dest))
}

const extra = () => {
  return gulp
    .src('**', { cwd: config.public, base: config.public, dot: true })
    .pipe(gulp.dest(config.dest))
}

const measure = () => {
  return gulp
    .src('**', { cwd: config.dest })
    .pipe($.plumber())
    .pipe(
      $.size({
        title: `${isProd ? 'Prodcuction' : 'Development'} mode build`,
        gzip: true
      })
    )
}

const upload = () => {
  return gulp
    .src('**', { cwd: config.dest })
    .pipe($.plumber())
    .pipe(
      $.ghPages({
        cacheDir: `${config.temp}/publish`,
        branch: argv.branch === undefined ? 'gh-pages' : argv.branch
      })
    )
}

const devServer = () => {
  gulp.watch(config.paths.styles, { cwd: config.src }, style)
  gulp.watch(config.paths.scripts, { cwd: config.src }, script)
  gulp.watch(config.paths.pages, { cwd: config.src }, page)
  gulp.watch(
    [config.paths.images, config.paths.fonts],
    { cwd: config.src },
    bs.reload
  )
  gulp.watch('**', { cwd: config.public }, bs.reload)

  bs.init({
    notify: false,
    port: argv.port === undefined ? 8080 : argv.port,
    open: argv.open === undefined ? false : argv.open,
    plugins: [`bs-html-injector?files[]=${config.temp}/*.html`],
    server: {
      baseDir: [config.temp, config.src, config.public],
      routes: { '/node_modules': 'node_modules' }
    }
  })
}

const distServer = () => {
  bs.init({
    notify: false,
    port: argv.port === undefined ? 8080 : argv.port,
    open: argv.open === undefined ? false : argv.open,
    server: config.dest
  })
}

const compile = gulp.parallel(style, script, page)

const serve = gulp.series(compile, devServer)

const build = gulp.series(
  clean,
  gulp.parallel(gulp.series(compile, useref), image, font, extra),
  measure
)

const start = gulp.series(build, distServer)

const deploy = gulp.series(build, upload)

module.exports = {
  clean,
  lint,
  style,
  script,
  page,
  useref,
  image,
  font,
  extra,
  measure,
  upload,
  devServer,
  distServer,
  compile,
  serve,
  build,
  start,
  deploy
}
