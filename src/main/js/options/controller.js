var tabIdForTest;
var settingsForTest;

function injectionListener( tabId, changeInfo, tab ) {
    'use strict';
    // search for tab to handle
    if( changeInfo.status != "complete" ) {
        return;
    }
    if( tabIdForTest == tabId ) {
        var scriptUrl = chrome.extension.getURL( "js/background/injectedLogin.js" );
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if( xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if( xmlhttp.status == 200 ) {
                    var script = xmlhttp.responseText;
                    script = script.replace( /@@testMode@@/g, "true" );
                    script = script.replace( /@@userXPath@@/g, settingsForTest.userXPath.replace( /'/g, "\\'" ) );
                    script = script.replace( /@@passXPath@@/g, settingsForTest.passXPath.replace( /'/g, "\\'" ) );
                    script = script.replace( /@@loginXPath@@/g, settingsForTest.loginXPath.replace( /'/g, "\\'" ) );
                    script = script.replace( /@@user@@/g, settingsForTest.user.replace( /'/g, "\\'" ) );
                    script = script.replace( /@@pass@@/g, settingsForTest.pass.replace( /'/g, "\\'" ) );
                    chrome.tabs.executeScript( tabIdForTest,
                        {
                        'code' : script,
                        'runAt' : 'document_end'
                        } );
                } else {
                    alert( 'Something went wrong. This should not occur.' );
                }
            }
        };

        xmlhttp.open( "GET", scriptUrl, true );
        xmlhttp.send();
    }
    chrome.tabs.onUpdated.removeListener( injectionListener );
}

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
        $scope.$watch( "settings", function( newValue, oldValue ) {
            $scope.settingsJson = angular.toJson( $scope.settings, true );
        } );
        $scope.$watch( "settingsJson", function( newValue, oldValue ) {
            try {
                $scope.settings = angular.fromJson( $scope.settingsJson );
                $scope.settingsJsonError = false;
            } catch( e ) {
                $scope.settingsJsonError = true;
            }
        } );

        // test stuff
        $scope.test = function( index ) {
            // (1) open new tab with url
            chrome.windows.create(
                {
                'state' : "normal",
                'type' : 'normal',
                'focused' : true
                }, function( window ) {
                // open a new tab
                chrome.tabs.create(
                    {
                    'windowId' : window.id,
                    'url' : $scope.settings.urls[index].url
                    }, function( tab ) {
                    tabIdForTest = tab.id;
                    settingsForTest = $scope.settings.urls[index];
                    // get all auto created tabs an close them
                    chrome.tabs.query(
                        {
                            'windowId' : window.id
                        }, function( tabs ) {
                        var tabLength = tabs.length;
                        for( var tabIndex = 0; tabIndex < tabLength; tabIndex++ ) {
                            if( tabs[tabIndex].id != tab.id ) {
                                console.log( "Closing autocreated tab with id " + tabs[tabIndex].id );
                                chrome.tabs.remove( tabs[tabIndex].id );
                            }
                        }
                    } );
                    // (2) inject test code
                    chrome.tabs.onUpdated.addListener( injectionListener );
                } );
            } );
        };

        // overall control
        $scope.start = function( $event ) {
            if( $event.shiftKey ) {
                $scope.settings.debug = true;
            } else {
                $scope.settings.debug = false;
            }
            var settings = angular.copy( $scope.settings );
            startup.saveSettings( settings, startup.start, true );
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
