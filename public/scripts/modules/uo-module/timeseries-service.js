define(['angular', './uo-module'], function(angular, module) {
    'use strict';

    /**
     * Excursion Service is a service that integrates with the Excursions API
     */
    module.factory('TimeseriesService', ['$q', '$http', function($q, $http) {
        /**
         * Api base url
         */
        var baseUrl = '/api/';
        
        /**
         * fetch timeseries by tag, start, end
         */
        var fetchTimeseries = function(tag, start, end){
            var deferred = $q.defer();
            var apiUrl = baseUrl + 'timeseries';
            var query = buildQuery([tag], start, end);
            
            $http.post(apiUrl, query)
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function() {
                    deferred.reject('Error fetching timeseries');
                });

            return deferred.promise;
        };
        
        /**
         * fetch collection of timeresies by collection of meters,
         * start and end dates
        **/
        var fetchMultipleTimeseries = function(meters, start, end) {
            var deferred = $q.defer();
            var apiUrl = baseUrl + 'timeseries';
            var tags = [];
            for (var i=0; i < meters.length; i++) {
                tags.push(meters[i].meterId);
            }
            var query = buildQuery(tags, start, end);
            
            $http.post(apiUrl, query)
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function() {
                    deferred.reject('Error fetching timeseries');
                });

            return deferred.promise;
        };
        
        /**
         * Generates time series query
         */
        var buildQuery = function(tags, start, end) {
            var query = {
                'cache_time': 0,
                'metrics': [],
                'tags': [],
                'start': start - (2 * (end - start)), // 2x the duration
                'end': end + (end - start) // 1x the duration
            };
            if (tags !== '' && tags !== null) {
                for (var i=0; i < tags.length; i++) {
                    query.tags.push({
                        'name': tags[i]
                        // 'limit': 1000,
                        // 'aggregations': [
                        //         {
                        //             'type': 'interpolate',
                        //             'sampling': {
                        //                     'datapoints': 1000
                        //                 }
                        //             }
                        //         ]
                    });
                }
                return query;
            }
        };
        
        return {
            fetchTimeseries: fetchTimeseries,
            fetchMultipleTimeseries: fetchMultipleTimeseries
        };
	}]);
});