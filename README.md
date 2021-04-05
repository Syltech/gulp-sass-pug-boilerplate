# gulp-sass-pug-boilerplate

Boilerplate for starting a fresh new project with Gulp + SASS + PUG

## install

```
yarn install
```

## build

```
gulp
```

## dev

```
gulp watch
```
Starts a server on port 8080 with Hot Modifications Reload

## deploy 

Deploying through FTP (2 environments available)

```
gulp deployTest
```

or

```
gulp deployProd
```

Host, credentials & paths are stored in file ftp-config.yaml, see ftp-config.example.yaml for structure

## files & directories

```
L 📜 ftp-config.yaml //store credentials
📁 assets // will be paste in the dist directory
 L 📁 fonts
 L 📁 img
📁 src
 L 📁 includes // includes for pug, will not create new html files
 L 📁 scss
   L 📁 utils // helpers for scss, will not create new css files
   L 📜 *.scss // will generate new css files in dist/css
 L 📜 config.yaml
 L 📜 *.pug // will generate new HTML files in dist
 L 📜 *.js // will copy uglyfied version in in dist
```
