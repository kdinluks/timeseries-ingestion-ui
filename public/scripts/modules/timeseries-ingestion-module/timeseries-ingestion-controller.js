define(['angular', './timeseries-ingestion-module'], function (angular, controllers) {
    'use strict';

    // Controller definition
    controllers.controller('TimeseriesIngestionCtrl', ['$scope', '$log', function ($scope, $log) {

        $scope.title = 'Timeseries Ingestion';
        if (!$scope.title) {
            $log('Title not found');
        }
    }]);
});
