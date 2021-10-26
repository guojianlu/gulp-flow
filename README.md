# gulp-flow

[![Build Status][travis-image]][travis-url] [![NPM Downloads][downloads-image]][downloads-url] [![NPM Version][version-image]][version-url] [![License][license-image]][license-url] [![Dependency Status][dependency-image]][dependency-url] [![devDependency Status][devdependency-image]][devdependency-url] [![Code Style][style-image]][style-url]

> "A website development package tool based on gulp

## Installation

```shell
$ yarn add gulp-flow --dev

# or npm
$ npm install gulp-flow --save-dev
```

in your package.json `scripts`:

```json
{
  "scripts": {
    "clean": "gulp-flow clean",
    "lint": "gulp-flow lint",
    "serve": "gulp-flow serve",
    "build": "gulp-flow build",
    "start": "gulp-flow start",
    "deploy": "gulp-flow deploy --production"
  }
}
```

## CLI Usage

```shell
$ gulp-flow <task> [options]
```

### e.g.

```shell
# Runs the app in development mode
$ gulp-flow serve --port 8081 --open
# Builds the app for production to the `dist` folder
$ gulp-flow build --production
```

### Available Scripts

#### `yarn lint` or `npm run lint`

Lint the styles & scripts files.

#### `yarn compile` or `npm run compile`

Compile the styles & scripts & pages file.

#### `yarn serve` or `npm run serve`

Runs the app in development mode with a automated server.

##### options

- `open`: Open browser on start, Default: `false`
- `port`: Specify server port, Default: `2080`

#### `yarn build` or `npm run build`

Builds the app for production to the `dist` folder. It minify source in production mode for the best performance.

##### options

- `production`: Production mode flag, Default: `false`
- `prod`: Alias to `production`

#### `yarn start` or `npm run start`

Running projects in production mode.

##### options

- `open`: Open browser on start, Default: `false`
- `port`: Specify server port, Default: `2080`

#### `yarn deploy` or `npm run deploy`

Deploy the `dist` folder to [GitHub Pages](https://pages.github.com).

##### options

- `branch`: The name of the branch you'll be pushing to, Default: `'gh-pages'`

#### `yarn clean` or `npm run clean`

Clean the `dist` & `temp` files.
