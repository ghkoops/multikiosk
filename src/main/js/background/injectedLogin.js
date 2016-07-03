var testMode = '@@testMode@@';
var isTestSuccessful = false;
var userNode = document.evaluate( '@@userXPath@@', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
var passNode = document.evaluate( '@@passXPath@@', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
var loginNode = document.evaluate( '@@loginXPath@@', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;

// fill up user input field
if( userNode !== null ) {
    userNode.value = '@@user@@';
}

// fill up password input field
if( passNode !== null ) {
    passNode.value = '@@pass@@';
}

// click on login button
if( loginNode !== null && testMode !== "true" ) {
    loginNode.click();
}

// test mode stuff
var testModeDiv = document.createElement( "div" );
document.getElementsByTagName( "body" )[0].appendChild( testModeDiv );
if( userNode !== null && passNode !== null && loginNode !== null ) {
    isTestSuccessful = true;
}
if( testMode === "true" ) {
    if( isTestSuccessful ) {
        testModeDiv.style.cssText = "border: 5px;border-color: green; border-style: solid; background-color: white; margin: 5px; padding: 5px; z-index: 10000; position: absolute; left: 0; top: 0;";
    } else {
        testModeDiv.style.cssText = "border: 5px;border-color: red; border-style: solid; background-color: white; margin: 5px; padding: 5px; z-index: 10000; position: absolute; left: 0; top: 0;";
    }
    if( userNode !== null ) {
        testModeDiv.innerHTML = '<p style="font-size: 16px; line-height: 1em; padding: 0px; margin: 0px; font-style: normal; font-family: sans-serif;">[OK] found user/login field and filled it</p>';
        console.log( JSON.stringify( testModeDiv ) );
    } else {
        testModeDiv.innerHTML = '<p style="font-size: 16px; line-height: 1em; padding: 0px; margin: 0px; font-style: normal; font-family: sans-serif;">[FAIL] could not find user/login field</p>';
        console.log( JSON.stringify( testModeDiv ) );
    }
    if( passNode !== null ) {
        testModeDiv.innerHTML += '<p style="font-size: 16px; line-height: 1em; padding: 0px; margin: 0px; font-style: normal; font-family: sans-serif;">[OK] found password field and filled it</p>';
    } else {
        testModeDiv.innerHTML += '<p style="font-size: 16px; line-height: 1em; padding: 0px; margin: 0px; font-style: normal; font-family: sans-serif;">[FAIL] could not password field</p>';
    }
    if( loginNode !== null ) {
        testModeDiv.innerHTML += '<p style="font-size: 16px; line-height: 1em; padding: 0px; margin: 0px; font-style: normal; font-family: sans-serif;">[OK] found login button</p>';
    } else {
        testModeDiv.innerHTML += '<p style="font-size: 16px; line-height: 1em; padding: 0px; margin: 0px; font-style: normal; font-family: sans-serif;">[FAIL] could not find login button</p>';
    }
    if( !isTestSuccessful ) {
        testModeDiv.innerHTML += '<p style="line-height: 3em !important; font-size: 16px; line-height: 1em; padding: 0px; margin: 0px; font-style: normal; font-family: sans-serif;">If errors persits please make sure that you are logged out.</p>';
    }
}