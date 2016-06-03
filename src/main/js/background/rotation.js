/**
 * @fileOverview Doing the rotation stuff by reading settings.
 * @author ghkoops@github.com
 */

/** @namespace rotation */
var rotation =
    {
    _settings : {},
    _firstTab : {},
    _secondTab : {},
    _showTab : {},
    _hideTab : {},

    /**
     * Logs to console if debug is set to true. It also adds a timestamp to
     * message
     * 
     * @summary Logs to console if debug is set to true.
     * 
     * @private
     * @param message
     *            {string} message to be logged
     */
    _log : function( message ) {
        'use strict';
        if( rotation._settings.debug ) {
            console.log( Date( Date.now() ).toString() + " - " + message );
        }
    },

    /**
     * Closes existing windows and creates two new ones, which will be used to
     * load urls and rotate display/visibility in order to prevent seeing page
     * loads. The first two urls are being loaded once the windows are created.
     * 
     * @summary Closes existing windows and creates two new ones used for
     *          rotating the urls
     * 
     * @private
     * @param callback
     *            {function} function to call when window is prepared
     */
    _prepareWindow : function( callback ) {
        'use strict';
        // close all existing windows
        chrome.windows.getAll(
            {
                'populate' : false
            }, function( windows ) {
            var windowsLength = windows.length;
            for( var windowIndex = 0; windowIndex < windowsLength; windowIndex++ ) {
                // rotation._log( "Closing window with id " +
                // windows[windowIndex].id );
                // chrome.windows.remove( windows[windowIndex].id );
            }
            // opens a new window with one tab
            chrome.windows.create(
                {
                'state' : rotation._settings.fullScreen ? "fullscreen" : "normal",
                'type' : 'popup',
                'focused' : true
                }, function( window ) {
                rotation._log( "First window for rotation has been created. id " + window.id );
                // open a new tab
                chrome.tabs.create(
                    {
                    'windowId' : window.id,
                    'url' : rotation._settings.urls[1].url
                    }, function( tab ) {
                    rotation._secondTab = tab;
                    rotation._hideTab = tab;
                    rotation._settings.urls[1].tabId = rotation._secondTab.id;
                    rotation._settings.urls[1].handle = true;
                    rotation._log( "First tab (hide) created with id: " + rotation._settings.urls[1].tabId + " and loaded " + rotation._settings.urls[1].url );
                    // get all auto created tabs an close them
                    chrome.tabs.query(
                        {
                            'windowId' : window.id
                        }, function( tabs ) {
                        var tabLength = tabs.length;
                        for( var tabIndex = 0; tabIndex < tabLength; tabIndex++ ) {
                            if( tabs[tabIndex].id != rotation._secondTab.id ) {
                                rotation._log( "Closing autocreated tab with id " + tabs[tabIndex].id );
                                chrome.tabs.remove( tabs[tabIndex].id );
                            }
                        }
                    } );
                    // opens a second window with one tab
                    chrome.windows.create(
                        {
                        'state' : rotation._settings.fullScreen ? "fullscreen" : "normal",
                        'type' : 'popup'
                        }, function( window ) {
                        rotation._log( "Second window for rotation has been created. id " + window.id );
                        // open a new tab
                        chrome.tabs.create(
                            {
                            'windowId' : window.id,
                            'url' : rotation._settings.urls[0].url,
                            'active' : false,
                            'selected' : false
                            }, function( tab ) {
                            rotation._firstTab = tab;
                            rotation._showTab = tab;
                            rotation._settings.urls[0].tabId = rotation._firstTab.id;
                            rotation._settings.urls[0].handle = true;
                            rotation._log( "Second tab (show) created with id: " + rotation._settings.urls[0].tabId + " and loaded " + rotation._settings.urls[0].url );

                            // get all auto created tabs an close them
                            chrome.tabs.query(
                                {
                                    'windowId' : window.id
                                }, function( tabs ) {
                                var tabLength = tabs.length;
                                for( var tabIndex = 0; tabIndex < tabLength; tabIndex++ ) {
                                    if( tabs[tabIndex].id != rotation._firstTab.id ) {
                                        rotation._log( "Closing autocreated tab with id " + tabs[tabIndex].id );
                                        chrome.tabs.remove( tabs[tabIndex].id );
                                    }
                                }
                            } );
                            var durationInMS = rotation._settings.urls[0].durationInS * 1000;
                            rotation._log( "start: showing " + rotation._settings.urls[0].url + " for " + durationInMS + "ms" );
                            setTimeout( callback, durationInMS );
                        } );
                    } );

                } );
            } );
        } );
    },

    /**
     * starts url rotation, using two windows. Thus two urls get loaded in
     * separate windows. Once duration passed for the first one the second gets
     * displayed and the first gets loaded, so that page loading will not be
     * visible.
     * 
     * CSS and custom login stuff are handled in
     * chrome.tabs.onUpdated.addListener <br>
     * Basic auth is handled in chrome.webRequest.onAuthRequired.addListener
     * 
     * @private
     * @summary starts url rotation using two tabs.
     * @returns {void}
     */
    _rotateUrls : function() {
        'use strict';
        // check if tabs are still there. If not, then abort.
        chrome.tabs.get( rotation._firstTab.id, function( tab ) {
            if( chrome.runtime.lastError ) {
                // tabs does not exist any longer
                rotation._removeListeners();
                throw "Aborting. FirstTab not no longer found.";
            }
            chrome.tabs.get( rotation._secondTab.id, function( tab ) {
                if( chrome.runtime.lastError ) {
                    // tab does not exist any longer
                    rotation._removeListeners();
                    throw "Aborting. SecondTab no longer found.";
                }
                // get next to shown url entry
                var currentUrlSettings;
                var urlsLength = rotation._settings.urls.length;
                for( var urlIndex = 0; urlIndex < urlsLength; urlIndex++ ) {
                    if( rotation._settings.urls[urlIndex].tabId == rotation._hideTab.id ) {
                        currentUrlSettings = rotation._settings.urls[urlIndex];
                        break;
                    }
                }

                // handle tabId setting for listener function
                var previousUrlIndex = rotation._settings.currentUrlIndex - 1;
                if( previousUrlIndex < 0 ) {
                    previousUrlIndex = rotation._settings.urls.length - 1;
                }
                rotation._settings.urls[previousUrlIndex].tabId = null;

                // display next tab and load next
                // url in hidden one
                rotation._settings.currentUrlIndex = ( rotation._settings.currentUrlIndex + 1 ) % rotation._settings.urls.length;
                var nextUrlSettings = rotation._settings.urls[rotation._settings.currentUrlIndex];
                // reset all handle stuff except of currentUrlSettings
                for( var urlIndex2 = 0; urlIndex2 < urlsLength; urlIndex2++ ) {
                    rotation._settings.urls[urlIndex2].handle = false;
                }
                nextUrlSettings.handle = true;

                // switch tabs to show and hide (and thus load url)
                var tmpSwitchTab = rotation._showTab;
                rotation._showTab = rotation._hideTab;
                rotation._hideTab = tmpSwitchTab;
                rotation._settings.urls[rotation._settings.currentUrlIndex].tabId = rotation._hideTab.id;
                rotation._log( "Loading next url " + nextUrlSettings.url + " in hidden tab " + rotation._hideTab.id );
                chrome.windows.update( rotation._showTab.windowId,
                    {
                    'focused' : true,
                    'state' : rotation._settings.fullScreen ? "fullscreen" : "normal"
                    } );
                chrome.windows.update( rotation._hideTab.windowId,
                    {
                    'focused' : false,
                    'state' : rotation._settings.fullScreen ? "fullscreen" : "normal"
                    } );
                chrome.tabs.update( rotation._showTab.id,
                    {
                    'active' : true,
                    'selected' : true
                    }, function( tab ) {
                    // load next url
                    chrome.tabs.update( rotation._hideTab.id,
                        {
                        'url' : nextUrlSettings.url,
                        'active' : false,
                        'selected' : false
                        } );
                } );
                var durationInMS = currentUrlSettings.durationInS * 1000;
                rotation._log( "Bring tab " + rotation._showTab.id + " with url " + currentUrlSettings.url + " to front and show it for " + durationInMS + "ms" );
                setTimeout( rotation._rotateUrls, durationInMS );
            } );
        } );
    },

    /**
     * Does custom login and CSS insertion if requested. Login is performed by
     * injecting JS-Code which fills input fields and simulates click to the
     * login button.
     * 
     * @private
     * @summary Does custom login and CSS insertion if requested
     * @see {@link https://developer.chrome.com/extensions/tabs#event-onUpdated}
     */
    _injectionListener : function( tabId, changeInfo, tab ) {
        'use strict';
        // search for tab to handle
        if( changeInfo.status != "complete" ) {
            return;
        }
        var urlsLength = rotation._settings.urls.length;
        for( var urlIndex = 0; urlIndex < urlsLength; urlIndex++ ) {
            if( rotation._settings.urls[urlIndex].handle === true && rotation._settings.urls[urlIndex].tabId == tabId ) {
                var currentUrlSettings = rotation._settings.urls[urlIndex];
                rotation._log( "Handle zoom/CSS/Login-JS for url " + rotation._settings.urls[urlIndex].url + " in  hidden tab id " + rotation._hideTab.id + " [current id " + rotation._settings.urls[urlIndex].tabId + "]" );
                // CSS
                if( typeof currentUrlSettings.customCSS !== "undefined" && currentUrlSettings.customCSS !== "" ) {
                    // inject CSS
                    chrome.tabs.insertCSS( currentUrlSettings.tabId,
                        {
                        'code' : currentUrlSettings.customCSS,
                        'allFrames' : true,
                        'runAt' : 'document_idle'
                        } );
                    rotation._log( "Added CSS to tab id " + currentUrlSettings.tabId );
                }
                // zoom
                var zoomFactor = typeof currentUrlSettings.zoomFactor !== "undefined" ? currentUrlSettings.zoomFactor : 1;
                chrome.tabs.setZoom( currentUrlSettings.tabId, zoomFactor );
                rotation._log( "Setting zoomFactor to " + zoomFactor + " for tab id " + currentUrlSettings.tabId );
                // custom login
                if( typeof currentUrlSettings.authType !== "undefined" && currentUrlSettings.authType == "custom" && typeof currentUrlSettings.userXPath !== "undefined" && typeof currentUrlSettings.passXPath !== "undefined" && typeof currentUrlSettings.loginXPath !== "undefined" && typeof currentUrlSettings.user !== "undefined" && typeof currentUrlSettings.pass !== "undefined" ) {
                    /* jshint multistr: true */
                    var script = "\
                        var userNode = document.evaluate( '@@userXPath@@', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;\
                        var passNode = document.evaluate( '@@passXPath@@', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;\
                        var loginNode = document.evaluate( '@@loginXPath@@', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;\
                        \
                        if( userNode != null && passNode != null && loginNode != null ) {\
                            userNode.value = '@@user@@';\
                            passNode.value = '@@pass@@';\
                            loginNode.click();\
                        }\
                    ";
                    script = script.replace( /@@userXPath@@/g, currentUrlSettings.userXPath.replace( /'/g, "\\'" ) );
                    script = script.replace( /@@passXPath@@/g, currentUrlSettings.passXPath.replace( /'/g, "\\'" ) );
                    script = script.replace( /@@loginXPath@@/g, currentUrlSettings.loginXPath.replace( /'/g, "\\'" ) );
                    script = script.replace( /@@user@@/g, currentUrlSettings.user.replace( /'/g, "\\'" ) );
                    script = script.replace( /@@pass@@/g, currentUrlSettings.pass.replace( /'/g, "\\'" ) );
                    chrome.tabs.executeScript( currentUrlSettings.tabId,
                        {
                        'code' : script,
                        'runAt' : 'document_end'
                        } );
                    rotation._log( "Added Login-JS to tab id " + currentUrlSettings.tabId );
                }
            }
        }
    },
    /**
     * Does basic auth login, if requested
     * 
     * @private
     * @summary Does basic auth login
     * @see {@link https://developer.chrome.com/extensions/webRequest#event-onAuthRequired}
     */
    _basicAuthListener : function( details, callback ) {
        'use strict';
        var urlsLength = rotation._settings.urls.length;
        for( var urlIndex = 0; urlIndex < urlsLength; urlIndex++ ) {
            if( rotation._settings.urls[urlIndex].handle === true && rotation._settings.urls[urlIndex].tabId == details.tabId ) {
                if( rotation._settings.urls[urlIndex].authType && rotation._settings.urls[urlIndex].authType == "basic" && rotation._settings.urls[urlIndex].user && rotation._settings.urls[urlIndex].pass ) {
                    // do basic login
                    callback(
                        {
                            authCredentials :
                                {
                                username : rotation._settings.urls[urlIndex].user,
                                password : rotation._settings.urls[urlIndex].pass
                                }
                        } );
                }
            }
        }
    },

    /**
     * Registers listeners only after setup is ready. Prevents from unwanted
     * behavior.
     * 
     * @private
     * @returns {void}
     */
    _registerListeners : function() {
        chrome.tabs.onUpdated.addListener( rotation._injectionListener );
        chrome.webRequest.onAuthRequired.addListener( rotation._basicAuthListener,
            {
                urls :
                    [ "<all_urls>" ]
            },
            [ 'asyncBlocking' ] );
    },

    /**
     * Unregisters listeners, when no more tabs are found.
     * 
     * @private
     * @returns {void}
     */
    _removeListeners : function() {
        chrome.webRequest.onAuthRequired.removeListener( rotation._basicAuthListener );
        chrome.tabs.onUpdated.removeListener( rotation._injectionListener );
        rotation._log( "Removed event listeners." );
    },

    /**
     * starts rotation using the settings. In case no valid config is passed,
     * falls back to default values
     * 
     * @summary starts rotation using the settings.
     * @public
     * @param config
     *            {config} configuration to be used for rotation
     * @returns {void}
     */
    start : function( config ) {
        'use strict';
        rotation._settings = config;
        rotation._settings.currentUrlIndex = 1;
        rotation._registerListeners();
        rotation._prepareWindow( rotation._rotateUrls, rotation._settings.debug );
    }
    };
