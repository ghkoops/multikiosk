# MultiKiosk Chrome Extension

## Purpose
Rotates multiple urls in kiosk mode.
 
As user you can specify multiple urls altogether with display duration. Optionally basic and form based login authentications are supported as well as overriding css in order to simply hide unwanted parts of the page or only show the relevant portions.

It works by using two separate windows. While the first window is showing the url, the next url gets loaded in the second window. When time has elapsed the window are simply swapped. This way no one sees page loading and rendering activities of the browser specially on slower devices like a Raspberry PI.

### Usage
Once installed options dialog should show up with default values. You may always click on the icon next to the address bar to open the options dialog. 

If fullscreen and autostart are enabled, Chrome will automatically start url rotation on next starts. To change settings, if url rotation is already running, please close both windows used for url rotation e.g. by pressing Crtl-w or Command-w. This will stop the extension to rotate urls. Then you can create a new window if none is visible and click on the MultiKiosk icon to get to the options dialog and change settings.

### Raspberry PI usage
If you intend to use it for a Raspberry PI or similar devices you could add Chrome start to your autostart files of choice with following command line:  
`<path to chrome>/chromium --ignore-certificate-errors --disable-restore-session-state --noerordialogs --disable-session-crashed-bubble --disable-infobars --kiosk`  

Incognito mode is not supported. 

### Installation / Update
1. Download the latest release from <https://github.com/ghkoops/multikiosk/releases>
1. Copy the contents of the zip file to whatever destination
2. Open Chrome
3. Go to settings
4. Select extensions
5. Check developer mode
6. Choose load unpacked extension and point it to your chosen destination path

You are done. Enjoy.

Sorry, not yet uploaded to Chrome Web Store. 


### Tips for overriding CSS
* using !important might be useful to make sure your settings are used
* in case you want only to show a part of the page you could set  
`html { visibility: collapse; }`   
`<your css selector> { visibility: visible; }`

### Version 1.0.1
Changes:  
* added test mode for xpath expressions (form based logins)
* made injected js for form based login more robust
* fixed bug where only one url led to errors
* minor improvements

### Version 1.0
Changes:  
* Initial release

Known issues:  
* As Chrome seems to behave differently on Macs the initial display of the windows gets a bit confused. After the initial back and forth of the windows everything works as expected. 


## Developer
Gulp is used as build system. It basically does jslint and creates some jsdoc based documentation. Invoke it with `node_modules/gulp/bin/gulp.js help` to get some hints about available tasks.

node_modules is not checked in. After cloning please use `npm install` to have all relevant modules installed. 

Bower is used to provide bootstrap and angularjs.

In case you want do debug something, simply open the developer console in the options dialog and use Shift-Click on the start button.  

MIT License 



