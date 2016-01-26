define(['angular', './uo-module'], function (angular, controllers) {
    'use strict';

    // Controller definition
    controllers.controller('DashboardsCtrl', ['$scope', '$log', 'PredixAssetService', 'PredixViewService', function ($scope, $log, PredixAssetService, PredixViewService) {

        PredixAssetService.getAssetsByCustomer('BP').then(function (initialContext) {
        //PredixAssetService.getAssetsByParentId('root').then(function (initialContext) {
            $scope.initialContexts = initialContext;
        }, function (message) {
            $log.error(message);
        });

        $scope.decks = [];
        $scope.selectedDeckUrl = null;

        // callback for when the Open button is clicked
        $scope.openContext = function (contextDetails) {
            
            // need to clean up the context details so it doesn't have the infinite parent/children cycle,
            // which causes problems later (can't interpolate: {{context}} TypeError: Converting circular structure to JSON)
            var newContext = angular.copy(contextDetails);
            newContext.children = [];
            newContext.parent = [];

            $scope.context = newContext;

            //Tag string can be classification from contextDetails
            PredixViewService.getDecksByTags(newContext.classification) // gets all decks for this context
                .then(function (decks) {
                    $scope.decks = [];

                    if(decks && decks.length > 0) {
                        decks.forEach(function (deck) {
                            $scope.decks.push({name: deck.title, url: PredixViewService.getUrlForFetchingCardsForDeckId(deck.id)});
                        });
                        $scope.selectedDeckUrl = $scope.decks[0].url;
                        $scope.viewServiceBaseUrl = $scope.decks[0].url.split('/decks/')[0];
                        $scope.selectedDeckId = $scope.decks[0].url.split('/decks/')[1].split('?')[0];
                    }
                });
        };

        $scope.getChildren = function (parent, options) {
            return PredixAssetService.getAssetsByParentId(parent.id, options);
        };
        
        var el = document.querySelector('#deck-selector');
        el.addEventListener('selected-deck-url-changed', function(e) {
            // do something on range-changed
            if (e.detail.value !== '') {
                $scope.viewServiceBaseUrl = e.detail.value.split('/decks/')[0];
                $scope.selectedDeckId = e.detail.value.split('/decks/')[1].split('?')[0];
            }
        });
        
        $scope.handlers = {
            itemOpenHandler: $scope.openContext,
            getChildren: $scope.getChildren
            // (optional) click handler: itemClickHandler: $scope.clickHandler
        };
    }]);
});
