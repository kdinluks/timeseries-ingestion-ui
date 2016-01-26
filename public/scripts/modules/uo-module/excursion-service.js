define(['angular', './uo-module'], function(angular, module) {
    'use strict';

    /**
     * Excursion Service is a service that integrates with the Excursions API
     */
    module.factory('ExcursionService', ['$q', '$http', 'PredixAssetService', function($q, $http, AssetSvc) {
        /**
         * Api base url
         */
        var baseUrl = '/api/';
        
        /**
         * fetch all excursions 
         */
        var getAllExcursions = function(){
            var deferred = $q.defer();
            var apiUrl = baseUrl + 'excursions';

            $http.get(apiUrl)
                .success(function(data) {
                    transformInboxData(data).then(function(newData) {
                        deferred.resolve(newData);
                    }, function() {
                        deferred.reject('Error adding details to excursions');
                    });
                })
                .error(function() {
                    deferred.reject('Error fetching excursions');
                });

            return deferred.promise;
        };
        
        /**
         * fetch excursion by id
         */
        var getExcursionById = function(id){
            var deferred = $q.defer();
            var apiUrl = baseUrl + 'excursions/' + id;

            $http.get(apiUrl)
                .success(function(data) {
                    AssetSvc.fetchMeterInfoById(data.tag).then(function(meterData) {
                        data.name = meterData.name + ' (' + data.type + ') ' + '- ' + meterData.description;
                        data.path = 'Sample > Hierarchy > For > Test';
                        data.tag = meterData.meterId;
                        data.uom = meterData.uom;
                        
                        var d = new Date(data.end);
                        
                        var day = (d.getUTCDate() < 10) ? '0' + d.getUTCDate() : d.getUTCDate();
                        var month = (d.getUTCMonth() + 1 < 10) ? '0' + (d.getUTCMonth() + 1) : (d.getUTCMonth() + 1);
                        var year = d.getUTCFullYear();
                        var date =  month + '/' + day + '/' + year;
                        
                        var hours = (d.getUTCHours() < 10) ? '0' + d.getUTCHours() : ((d.getUTCHours() <= 12) ? d.getUTCHours() : ((d.getUTCHours() - 12 < 10) ? '0' + (d.getUTCHours() - 12) : d.getUTCHours() - 12));
                        var minutes = (d.getUTCMinutes() < 10) ? '0' + d.getUTCMinutes() : d.getUTCMinutes();
                        var seconds = (d.getUTCSeconds() < 10) ? '0' + d.getUTCSeconds() : d.getUTCSeconds();
                        var hour = hours + ':' + minutes + ':' + seconds + (d.getUTCHours() <= 12 ? ' AM' : ' PM');
                        
                        data.date = date + ' ' + hour + ' UTC';
                        
                        AssetSvc.fetchAssetTree(meterData.meterId).then(function(assetTree) {
                            data.path = assetTree;
                            deferred.resolve(transformDetailedData(data));
                        }, function() {
                            deferred.reject('Error fetching asset');
                        });
                    }, function() {
                        deferred.reject('Error fetching meter');
                    });
                })
                .error(function() {
                    deferred.reject('Error fetching excursions');
                });

            return deferred.promise;
        };
        
        /**
         * tranform epoch date into readable date for inbox excursions info
         */
        var transformInboxData = function(entities) {
            var deferred = $q.defer();
            var newEntities = [];
            $q.all(entities.map(function(entity){
                var qmap = $q.defer();
                var d = new Date(entity.end);
                
                var day = (d.getUTCDate() < 10) ? '0' + d.getUTCDate() : d.getUTCDate();
                var month = (d.getUTCMonth() + 1 < 10) ? '0' + (d.getUTCMonth() + 1) : (d.getUTCMonth() + 1);
                var year = d.getUTCFullYear();
                var date =  month + '/' + day + '/' + year;
                
                var hours = (d.getUTCHours() < 10) ? '0' + d.getUTCHours() : ((d.getUTCHours() <= 12) ? d.getUTCHours() : ((d.getUTCHours() - 12 < 10) ? '0' + (d.getUTCHours() - 12) : d.getUTCHours() - 12));
                var minutes = (d.getUTCMinutes() < 10) ? '0' + d.getUTCMinutes() : d.getUTCMinutes();
                var seconds = (d.getUTCSeconds() < 10) ? '0' + d.getUTCSeconds() : d.getUTCSeconds();
                var hour = hours + ':' + minutes + ':' + seconds + (d.getUTCHours() <= 12 ? ' AM' : ' PM');
                
                // TODO: change excursion services to persist source system tag name
                var name = entity.tag.split('_')[2].split('.')[0] + ' (' + entity.type + ')';
                
                newEntities.push({
                    id: entity.id,
                    hour: hour,
                    date: date,
                    type: entity.type,
                    name: name,
                    epoch: entity.end
                });
                
                qmap.resolve();
                return qmap;
            }))
            .then(function() {
                deferred.resolve(newEntities);
            }, function() {
                deferred.reject('Error transforming data');
            });
            return deferred.promise;
        };
        
        /**
         * tranform epoch date into readable date for detailed excusion info
         */
        var transformDetailedData = function(entity) {
            entity.duration = Math.round(entity.duration / (1000 * 60)); // transform from ms to min
            return entity;
        };
        
        return {
            getAllExcursions: getAllExcursions,
            getExcursionById: getExcursionById
        };
	}]);
});