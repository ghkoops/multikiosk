angular.module( 'multiKioskApp', [] ).controller( 'optionsCtrl',
    [ '$scope', '$sce', function( $scope, $sce ) {
        $scope.settings = {};
        $scope.settingsJson = "";

        // handling UrlEntries
        // ... adding a new entry
        $scope.addUrlEntry = function( index ) {
            $scope.settings.urls.splice( index, 0,
                {
                'url' : '',
                'durationInS' : 5,
                'zoomFactor' : 1
                } );
        };
        // ... removing an existing entry
        $scope.removeUrlEntry = function( index ) {
            $scope.settings.urls.splice( index, 1 );
        };
        // ... move an existing entry up
        $scope.moveUrlEntryUp = function( index ) {
            $scope.settings.urls.splice( index - 1, 0, $scope.settings.urls.splice( index, 1 )[0] );
        };
        // ... move an existing entry down
        $scope.moveUrlEntryDown = function( index ) {
            $scope.settings.urls.splice( index + 1, 0, $scope.settings.urls.splice( index, 1 )[0] );
        };
        
        // keeping settings and settingsJson in sync
        $scope.$watch( "settings", function(newValue, oldValue) {
			$scope.settingsJson = angular.toJson($scope.settings, true );
		} );
        $scope.$watch( "settingsJson", function(newValue, oldValue) {
			try {
				$scope.settings = angular.fromJson( $scope.settingsJson );
				$scope.settingsJsonError = false;
			} catch(e) {
				$scope.settingsJsonError = true;
			}
		} );

        // overall control
        $scope.start = function( $event ) {
            if( $event.shiftKey ) {
                $scope.settings.debug = true;
            } else {
                $scope.settings.debug = false;
            }
            startup.saveSettings( $scope.settings );
            startup.start( true );
        };

        $scope.saveSettings = function() {
            startup.saveSettings( $scope.settings );
        };

        $scope.loadSettings = function( config ) {
            $scope.settings = config;
            $scope.$apply();
        };
        startup.getSettings( $scope.loadSettings );

    } ] ).directive( 'convertToNumber', function() {
    var returnValue =
        {
        require : 'ngModel',
        link : function( scope, element, attrs, ngModel ) {
            ngModel.$parsers.push( function( val ) {
                return val ? parseFloat( val ) : null;
            } );
            ngModel.$formatters.push( function( val ) {
                return val ? '' + val : null;
            } );
        }
        };
    return returnValue;

} );
