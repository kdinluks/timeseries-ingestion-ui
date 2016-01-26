define(['angular', './uo-module'], function(angular, controllers) {
    'use strict';

    //Controller definition
    controllers.controller('ExcursionCtrl', ['$scope', '$log', 'ExcursionService', 'TimeseriesService', 'PredixAssetService', function ($scope, $log, ExcursionService, TimeseriesService, AssetService) {

        $scope.excursions = [];
        $scope.selectedExcursion = null;
        $scope.loadingExcursion = {'loading': null};
        $scope.loadingAssociatedTags = {'loading': null};

        ExcursionService.getAllExcursions().then(function (excursions) {
            $scope.excursions = excursions;
        }, function(message) {
            $log.error(message);
        });

        /** 
         * get excursion details and fetch timeseries for tag in excursion
        **/
        var getDetailedExcursion = function(id) {
            $scope.loadingExcursion = {'loading': true};
            ExcursionService.getExcursionById(id).then(function (excursion) {
                $scope.selectedExcursion = excursion;
                TimeseriesService.fetchTimeseries(excursion.tag, excursion.start, excursion.end).then(function(tsData) {
                    $scope.loadingExcursion = {'loading': false};
                    $scope.tsData = tsData;
                });
            });
        };
        
        /** 
         * get associated meters for current meter in excursion and fetch timeseries
        **/
        var getAssociatedMeters = function() {
            $scope.loadingAssociatedTags = {'loading': true};
            var excursion = $scope.selectedExcursion;
            AssetService.getAssociatedMeters(excursion.tag).then(function(associatedMeters) {
                TimeseriesService.fetchMultipleTimeseries(associatedMeters, excursion.start, excursion.end).then(function(tsData) {
                    $scope.associatedTags = tsData;
                    $scope.loadingAssociatedTags = {'loading': false};
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            });
        };

        /** 
         * Watcher for broadcast from uo-excursion-inbox
         * get detailed excursion info when user selects an excursion from inbox
        **/
        var inbox = document.querySelector('#inbox');
        inbox.addEventListener('selected-excursion-changed', function(e) {
            if (e.detail.value && e.detail.value.id !== '') {
                if (!$scope.selectedExcursion) {
                    getDetailedExcursion(e.detail.value.id);
                }
                else if (e.detail.value.id !== $scope.selectedExcursion.id) {
                    getDetailedExcursion(e.detail.value.id);
                }
                
            }
        });
        
        /** 
         * Watcher for broadcast from uo-excursion-details
         * broadcast to scope var when user clicks see full chart
        **/
        var details = document.querySelector('#details');
        details.addEventListener('template-toggle-changed', function(e) {
            if (e.detail.path === 'templateToggle.isTimeseries' && e.detail.value === true) {
                getAssociatedMeters();
            }
        });
        
    }]);
});
