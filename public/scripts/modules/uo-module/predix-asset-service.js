define(['angular', './uo-module'], function(angular, module) {
    'use strict';

    /**
     * PredixAssetService is a sample service that integrates with Predix Asset Server API
     */
    module.factory('PredixAssetService', ['$q', '$http', function($q, $http) {
        /**
         * Predix Asset server base url
         */
        var baseUrl = '/api/';

        /**
         * transform the asset entity into an object format consumable by px-context-browser item
         */
        var transformChildren = function(entity) { // transform your entity to context browser entity format
            return {
                name: entity.name, // Displayed name in the context browser
                id: entity.name, // Unique ID (could be a URI for example)
                parentId: entity.name, // Parent ID. Used to place the children under the corresponding parent in the browser.
                classification: entity.classification, // Classification used for fetching the views is the classification used to create the asset.
                isOpenable: entity.isOpenable // Only show what is openable
            };
        };

        /**
         * fetch the asset children by parentId
         */
        var getEntityChildren = function(parentId, options) {
            var deferred = $q.defer();
            var childrenUrl = baseUrl + 'asset/asset';
            var childEntities = {
                meta: {parentId: ''},
                data: []
            };
            
            if (options === 'customer') {
                childrenUrl += '?filter=name=' + parentId;
            }
            else {
                childrenUrl += '?filter=name=' + parentId + '<parent';
            }

            $http.get(childrenUrl)
                .success(function(data) {
                    childEntities = {
                        meta: {parentId: parentId},
                        data: data
                    };
                    deferred.resolve(childEntities);
                })
                .error(function() {
                    deferred.reject('Error fetching asset with id ' + parentId);
                });


            return deferred.promise;
        };

        /**
         * get asset by parent id
         */
        var getAssetsByParentId = function(parentId, options) {
            var deferred = $q.defer();

            getEntityChildren(parentId, options).then(function(results) {
                var transformedChildren = [];
                for (var i = 0; i < results.data.length; i++) {
                    transformedChildren.push(transformChildren(results.data[i]));
                }

                results.data = transformedChildren;

                deferred.resolve(results);

            }, function() {
                deferred.reject('Error fetching asset with id ' + parentId);
            });

            return deferred.promise;
        };
        
        /**
         * get assets by customer (for populating context browser initially)
         */
        var getAssetsByCustomer = function(customer) {
            var deferred = $q.defer();

            getEntityChildren(customer, 'customer').then(function(results) {
                var transformedChildren = [];
                for (var i = 0; i < results.data.length; i++) {
                    transformedChildren.push(transformChildren(results.data[i]));
                }

                results.data = transformedChildren;

                deferred.resolve(results);

            }, function() {
                deferred.reject('Error fetching asset with id ' + customer);
            });

            return deferred.promise;
        };
        
        /**
         * fetch meter information based on meter id
         */
        var fetchMeterInfoById = function(meterId) {
            var deferred = $q.defer();
            var apiUrl = baseUrl + 'asset/meter?filter=meterId=' + meterId;

            $http.get(apiUrl)
                .success(function(data) {
                    deferred.resolve(data[0]);
                })
                .error(function() {
                    deferred.reject('Error fetching meter');
                });

            return deferred.promise;
        };
        
        /**
         * fetch asset information based on meter id
         */
        var fetchAssetByMeter = function(meterId) {
            var deferred = $q.defer();
            var apiUrl = baseUrl + 'asset/*?filter=meterId=' + meterId + '<meters';
            
            $http.get(apiUrl)
                .success(function(data) {
                    deferred.resolve(data[0]);
                })
                .error(function() {
                    deferred.reject('Error fetching asset');
                });

            return deferred.promise;
        };
        
        /**
         * fetch visual asset information based on target
         */
        var fetchVisualAssetByAsset = function(target) {
            var deferred = $q.defer();
            var apiUrl = baseUrl + 'asset/asset?filter=target=' + target;
            
            $http.get(apiUrl)
                .success(function(data) {
                    deferred.resolve(data[0]);
                })
                .error(function() {
                    deferred.reject('Error fetching asset');
                });

            return deferred.promise;
        };
        
        /**
         * fetch asset tree for a asset based on asset object
         */
        var fetchAssetTree = function(meterId) {
            var deferred = $q.defer();
            var apiUrl = baseUrl + 'asset/asset?filter=(target=(meterId=' + meterId + '<meters))>parent[t10]|(target=(meterId=' + meterId + '<meters))';
            
            $http.get(apiUrl)
                .success(function(data) {
                    var tree = '';
                    
                    data.sort(function(a, b) {
                        return a.depth - b.depth;
                    });
                    
                    for (var i=0; i < data.length; i++) {
                        tree += data[i].name + ' > ';
                    }
                    
                    tree = tree.substr(0, tree.length - 3);
                    
                    deferred.resolve(tree);
                })
                .error(function() {
                    deferred.reject('Error fetching asset');
                });
                
            return deferred.promise;
        };
        
        /**
         * fetch associated meters based on meter id
         * TODO: hardcoded trend name, have to change it to fetch 
         *       all trends or a specific one based on trend name
         */
        var getAssociatedMeters = function(meterId) {
            var deferred = $q.defer();
            var apiUrl = baseUrl + 'asset/meter?filter=meterId=' + meterId + '>associated_meters.trend1';

            $http.get(apiUrl)
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function() {
                    deferred.reject('Error fetching associated meters');
                });

            return deferred.promise;
        };

        return {
            getAssetsByParentId: getAssetsByParentId,
            getAssetsByCustomer: getAssetsByCustomer,
            fetchMeterInfoById: fetchMeterInfoById,
            fetchAssetByMeter: fetchAssetByMeter,
            fetchVisualAssetByAsset: fetchVisualAssetByAsset,
            fetchAssetTree: fetchAssetTree,
            getAssociatedMeters: getAssociatedMeters
        };
    }]);
});
