var importOnce = require('node-sass-import-once');

module.exports = {
  dist: {
    options: {
      importer: importOnce,
      importOnce: {
        index: true,
        bower: true
      }
    },
    files: {
      'public/bower_components/file-upload-cards/css/file-upload.css': 'public/bower_components/file-upload-cards/css/file-upload.scss'
    }
  }
}