/**
 * @namespace
 * @fileOverview Extension main entry point
 * @author ghkoops@github.com
 */

/**
 * configuration structure holding all relevant data for url rotation
 * 
 * @typedef {object} config
 * @property {object} settings - settings/configuration which is used for
 *           rotating urls. Usually gets loaded from localStorage
 * @property {boolean} settings.autoStart - true if rotating urls should run,
 *           when Chrome gets started.
 * @property {boolean} settings.fullScreen - if true opens the window in
 *           full screen
 * @property {boolean} settings.debug - for debugging purposes, sets duration to
 *           2 seconds and prints more to console.
 * @property {array} settings.urls - specification of urls
 * @property {string} settings.urls.url - url to load
 * @property {number} settings.urls.durationInS - number of seconds to show url
 * @property {string} [settings.urls.customCSS] - CSS to be injected, in case
 *           you want to override url specific CSS
 * @property {double} [settings.urls.zoomFactor] - zoomFactor to be used.
 *           Defaults to 1. A value of 1.2 would be 120%. A value of 0.75 would
 *           be 75%.
 * @property {string} settings.urls.authType - Either "basic" (Basic
 *           Authentication) or "custom" (in case the url requires login dialog
 *           to be filled).
 * @property {string} settings.urls.user - for authType "basic": user/login name
 * @property {string} settings.urls.pass - for authType "basic": password of
 *           users
 * @property {string} settings.urls.userXPath - for authType "custom": XPath to
 *           user/login input field
 * @property {string} settings.urls.passXPath - for authType "custom": XPath to
 *           password input field
 * @property {string} settings.urls.loginXPath - for authType "custom": XPath
 *           for login button/element which gets clicked
 */


/**
 * Opens the options dialog when browser action icon is clicked
 * 
 * @summary Opens the options dialog when clicked
 */
chrome.browserAction.onClicked.addListener( function( tab ) {
    startup._showOptions();
} );

startup.start();