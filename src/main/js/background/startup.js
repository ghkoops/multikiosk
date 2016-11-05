/**
 * @fileOverview Handling startup and manage settings (=configuration modified
 *               by user)
 * @author ghkoops@github.com
 */

/** @namespace startup */
var startup =
    {
    /**
     * current configuration which holds defaults
     * 
     * @protected
     */
    _config : {},

    /**
     * validates and corrects settings
     * 
     * @private
     * @summary validates and corrects settings
     * @returns {void}
     */
    _validateSettings : function() {
        'use strict';
        // default values
        if( typeof startup._config === 'undefined' ) {
            console.log( "Using config from scratch." );
            startup._config = {};
        }
        if( typeof startup._config.debug === 'undefined' ) {
            console.log( "Using debug default value." );
            startup._config.debug = false;
        }
        if( typeof startup._config.fullScreen === 'undefined' ) {
            console.log( "Using fullScreen default value." );
            startup._config.fullScreen = true;
        }
        if( typeof startup._config.autoStart === 'undefined' ) {
            console.log( "Using autoStart default value." );
            startup._config.autoStart = false;
        }
        if( typeof startup._config.urls === 'undefined' ) {
            console.log( "Using default urls." );
            startup._config.urls =
                [
                    {
                    'url' : "http://gnu.org",
                    'durationInS' : 60
                    },
                    {
                    'url' : "http://xkcd.com",
                    'durationInS' : 60
                    } ];
        }
        // check if url list consists of only one url, then duplicate entry
        if( startup._config.urls.length == 1 ) {
            console.log( "Using first url object also for the second (we need two ones)." );
            var urlObjectToCopy =  angular.copy( startup._config.urls[0] );
            startup._config.urls.push( urlObjectToCopy );
        }
        // required values url, durationInS and zoomFactor
        for( var urlsIndex = 0; urlsIndex < startup._config.urls.length; urlsIndex++ ) {
            if( typeof startup._config.urls[urlsIndex].url === "undefined" || startup._config.urls[urlsIndex].url === "" ) {
                console.log( "Using default url." );
                startup._config.urls[urlsIndex].url = "http://gnu.org";
            }
            if( typeof startup._config.urls[urlsIndex].durationInS === "undefined" ) {
                console.log( "Using default duration." );
                startup._config.urls[urlsIndex].durationInS = 60;
            }
            if( typeof startup._config.urls[urlsIndex].zoomFactor === "undefined" ) {
                console.log( "Using default zoom." );
                startup._config.urls[urlsIndex].zoomFactor = 1;
            }
        }
    },

    /**
     * loads saved configuration to _config
     * 
     * @private
     * @param callback
     *            {function} callback which is called once configuration is
     *            loaded
     * @returns {void}
     */
    _loadConfig : function( callback, param1 ) {
        'user strict';
        chrome.storage.local.get( 'config', function( items ) {
            if( chrome.runtime.lastError ) {
                console.log( "Could not read saved config, using defaults." );
                startup._validateSettings();
                startup._saveConfig();
                startup._showOptions();
                return;
            } else {
                if( typeof items !== "undefined" && typeof items.config !== "undefined" ) {
                    startup._config = items.config;
                    console.log( "Saved config: " + JSON.stringify( startup._config ) );
                } else {
                    startup._validateSettings();
                    startup._saveConfig();
                    startup._showOptions();
                    return;
                }
            }
            startup._validateSettings();
            if( typeof callback === "function" ) {
                callback( startup._config, param1 );
            }
        } );
    },

    /**
     * saves configuration _config to local store
     * 
     * @private
     * @param callback
     *            {function} callback which is called once configuration is
     *            saved
     * @param param1
     *            {any} callback parameter
     * @returns {void}
     */
    _saveConfig : function( callback, param1 ) {
        'user strict';
        chrome.storage.local.set(
            {
                'config' : this._config
            }, function() {
            if( typeof callback === "function" ) {
                callback( param1 );
            }
        } );
    },

    /**
     * checks what should happen, depending on the configurations
     * 
     * @private
     * @param forceStart
     *            {boolean} if true starts overriding the configuration
     * @returns {void}
     */
    _evalConfig : function( ignore, forceStart ) {
        if( Object.keys( startup._config ).length !== 0 ) {
            if( startup._config.autoStart === true || forceStart === true ) {
                // autostart is enabled thus do the twist
                rotation.start( startup._config );
                return;
            }
            // we should do nothing
            return;
        }
    },

    /**
     * Searches for an already opened options dialog and put it to front or
     * opens a new one if not found.
     * 
     * @summary opens the options dialog
     * @private
     * @returns {void}
     */
    _showOptions : function() {
        // search for already opened options dialog
        var optionsUrl = chrome.extension.getURL( 'html/options.html' );
        chrome.tabs.query( {}, function( tabs ) {
            var foundOpenedOptionsDialog = false;
            for( var tabIndex = 0; tabIndex < tabs.length; tabIndex++ ) {
                if( optionsUrl == tabs[tabIndex].url ) {
                    foundOpenedOptionsDialog = true;
                    chrome.tabs.update( tabs[tabIndex].id,
                        {
                            "selected" : true
                        } );
                }
            }
            if( !foundOpenedOptionsDialog ) {
                chrome.tabs.create(
                    {
                        url : "html/options.html"
                    } );
            }
        } );
    },

    /**
     * starts up the extension. It basically loads the saved configuration and
     * auto starts if requested.
     * 
     * @summary starts up the extension
     * @public
     * @param forceStart
     *            {boolean} true forces start
     * @returns {void}
     */
    start : function( forceStart ) {
        'use strict';
        if( typeof forceStart === "undefined" ) {
            forceStart = false;
        }
        startup._loadConfig( startup._evalConfig, forceStart );
    },

    /**
     * returns the current settings using a callback
     * 
     * @summary get settings
     * @public
     * @param callback
     *            {function} called when configuration is ready
     */
    getSettings : function( callback ) {
        startup._loadConfig( callback );
    },

    /**
     * saves new configuration to local store
     * 
     * @summary saves new configuration
     * @public
     * @param newConfig
     *            {config} the new config to apply
     * @param callback
     *            {function} function to call after configuration has been saved
     * @param param1
     *            {any} parameter for callback
     */
    saveSettings : function( newConfig, callback, param1 ) {
        this._config = newConfig;
        this._saveConfig( callback, param1 );
    }
    };
