var auth = require('../helpers/auth');
var proxy = require('../helpers/proxy');

var config = {
  /**
   * --------- ADD YOUR UAA CONFIGURATION HERE ---------
   *
   * This uaa helper object simulates NGINX uaa integration using Grunt allowing secure cloudfoundry service integration in local development without deploying your application to cloudfoundry.
   * Please update the following uaa configuration for your solution
   */
  uaa: {
    clientId: 'predixSeedClient',
    serverUrl: 'https://21c3b184-e9ce-4665-894f-a3d417915fdd.predix-uaa.run.aws-usw02-pr.ice.predix.io',
    defaultClientRoute: '/about',
    base64ClientCredential: 'cHJlZGl4U2VlZENsaWVudDp1WWlUWWFhcFZRbGFlUHo5YmM3SnVzd1hyMnNVdDR2OWJLVG91S3FxdXJRPQ=='
  },
  /**
   * --------- ADD YOUR SECURE ROUTES HERE ------------
   *
   * Please update the following object add your secure routes
   *
   * Note: Keep the /api in front of your services here to tell the proxy to add authorization headers.
   */
  proxy: {
    // Predix Views
    '/api/view-service(.*)': {
      url: 'https://predix-views.run.aws-usw02-pr.ice.predix.io/api$1',
      instanceId: '6755e143-afee-4e96-8402-23f440753b2e'
    },
    // Predix Asset        
    '/api/asset/(.*)': {
      url: 'https://predix-asset.run.aws-usw02-pr.ice.predix.io/$1',
      instanceId: 'e7547cc1-50eb-46d7-b16e-553308930008'
    },
    // Predix Timeseries
    '/api/timeseries(.*)': {
      url: 'https://time-series-store-predix.run.aws-usw02-pr.ice.predix.io/v1/datapoints$1',
      instanceId: '429a21e7-8bdc-4606-ac6d-8f7b879efe50'
    },
    // Timeseries Ingestion
    '/api/upload(.*)': {
        url: 'https://timeseries-ingestion-service.run.aws-usw02-pr.ice.predix.io/upload$1',
        instanceId: ''
    }
  }
};

module.exports = {
  server: {
    options: {
      port: 9000,
      base: 'public',
      open: true,
      hostname: 'localhost',
      middleware: function (connect, options) {
        var middlewares = [];

        //add predix services proxy middlewares
        middlewares = middlewares.concat(proxy.init(config.proxy));

        //add predix uaa authentication middlewaress
        middlewares = middlewares.concat(auth.init(config.uaa));

        if (!Array.isArray(options.base)) {
          options.base = [options.base];
        }

        var directory = options.directory || options.base[options.base.length - 1];
        options.base.forEach(function (base) {
          // Serve static files.
          middlewares.push(connect.static(base));
        });

        // Make directory browse-able.
        middlewares.push(connect.directory(directory));

        return middlewares;
      }
    }
  }
};
