/**
 js/jquery-3.3.1.min.js
 */

let modalKeybindKey = '';
let modalKeybindModifiers = '';
let pressedModifiers = [];
let waitingForInput = {};

$('html').on('keydown', keyPressDown).on('keyup', keyPressUp);

/**
 * Sets handlers waiting to be processed on next key press.
 * @param inputName: identifier to remove from list of handlers waiting to be processed on next key press.
 * @param handler: handler to be processed.
 */
function setInputHandler(inputName, handler){

    waitingForInput[inputName] = handler;
}

/**
 * Removed handler waiting to be processed on next key press.
 * @param inputName: Identifier of handler to be removed.
 */
function removeInputHandler(inputName){

    delete waitingForInput[inputName];
}

/**
 * Get Keybind from storage and set event handlers to process it.
 */
function loadKeybinds(){

    chrome.storage.sync.get({
        raiseModalKeybind: null,
        shortNumberSearch: false,
    }, function(items) {
        shortNumberSearch = items.shortNumberSearch;
        if (items.raiseModalKeybind) {
            modalKeybindKey = items.raiseModalKeybind.key;
            if (items.raiseModalKeybind.modifiers.constructor === Array) {
                modalKeybindModifiers = items.raiseModalKeybind.modifiers.slice();
            } else {
                modalKeybindModifiers = [];
            }
        }
    });
}

/**
 * Set keybind to raise modal.
 * @param key: keycode  which is set to raise modal.
 */
function setRaiseModalKeybind(key){

    if(typeof key !== 'string'){

        let key = (96 <= event.keyCode && event.keyCode <= 105)? event.keyCode - 48 : event.keyCode;
        if(key < 16 || 18 < key) {
            modalKeybindKey = key;
            modalKeybindModifiers = pressedModifiers;
            chrome.storage.sync.set({
                raiseModalKeybind: {
                    key: modalKeybindKey,
                    modifiers: pressedModifiers
                }
            }, function(){
                updateContent('keybind');
                let tokens = pressedModifiers.slice();
                tokens[tokens.length] = key;
                setRaiseModalKeybindMenuText(tokens);

                removeInputHandler('ModalKeybind');
                setInputHandler('ModalKeybind', checkRaiseModalKeybind);
            });
        }
    }
}

/**
 * Displays and resizes text for modal keybind textbox in options.
 * @param tokens: Array of keycodes to be turned into text.
 */
function setRaiseModalKeybindMenuText(tokens){

    let display = $('#dial_number_display');
    display.html(keyCodeToString(tokens)).css('outline', 'none');
    display.css('font-size', '14px');
    let fontSize;
    while(isOverflown(display[0])){

        fontSize = parseInt(display.css('font-size').replace('px', '')) - 1;
        display.css('font-size', fontSize + 'px');
    }
}

/**
 * Handler for checking if keybind was entered.
 * @param event: Keypress event for html element.
 */
function checkRaiseModalKeybind(event){

    let key = (96 <= event.keyCode && event.keyCode <= 105)? event.keyCode - 48 : event.keyCode;

    if(key === modalKeybindKey && compareArray(pressedModifiers, modalKeybindModifiers) ){

        raiseModal(searchHighlighted());
    }
}

/**
 * Checks handlers waitingForInput global variable to process them on keypress.
 * @param event: Keypress event for html element.
 */
function keyPressDown(event){

    let key = (96 <= event.keyCode && event.keyCode <= 105)? event.keyCode - 48 : event.keyCode;
    if(key >= 16 && key <= 18){

        if(pressedModifiers.indexOf(key) === -1){

            pressedModifiers.push(key);
        }
        if(event.data && event.data.modifierFunc){

            event.data.modifierFunc(event);
        }

    } else {

        if(event.data && event.data.keyFunc){

            event.data.keyFunc(event);
        }
    }
    if(event.data && event.data.func){

        event.data.func(event);
    }
    for (var handler in waitingForInput) {
        if (waitingForInput.hasOwnProperty(handler)) {
            waitingForInput[handler](event);
        }
    }

}

/**
 * Removes keyboard modifiers from pressedModifiers global variable.
 * @param event: key up event from html element.
 */
function keyPressUp(event){

    if(event.keyCode >= 16 && event.keyCode <= 18) {
        pressedModifiers.splice(pressedModifiers.indexOf(event.keyCode), 1);
    }
}

/**
 * converts keycodes to strings for set keybind options.
 * @param key: keycode from keypress event.
 * @returns {string}: '-' delimited string of modifiers and single non-modifier key pressed.
 */
function keyCodeToString(key){

    if(key.constructor === Array){

        let order = [17,16,18];
        let outStr = '';
        let shiftText, controlTex;
        let altText = 'Alt-';
        //Shorten modifier names if string is contains at least 4 tokens.
        if(key.length > 3) {

            shiftText = 'Shf-';
            controlText = 'Ctr-';
        } else {

            shiftText = 'Shift-';
            controlText = 'Ctrl-';
        }


        for(let i = 0; i < order.length; i++){

            for(let j = 0; j < key.length; j++){

                if(order[i] === key[j]){

                    switch(key[j]){
                        case 16:
                            outStr +=  shiftText;
                            key.splice(j, 1);
                            break;
                        case 17: outStr +=  controlText;
                            key.splice(j, 1);
                            break;
                        case 18: outStr +=  altText;
                            key.splice(j, 1);
                            break;
                    }
                }
            }
        }
        for(let i = 0; i < key.length; i++){

            switch(key[i]){
                case 8: outStr += 'bksp'; break;
                case 9: outStr += 'tab'; break;
                case 20: outStr += 'cplk'; break;
                case 32: outStr += 'spc'; break;
                case 33: outStr += 'pgup'; break;
                case 34: outStr += 'pgdn'; break;
                case 35: outStr += 'end'; break;
                case 36: outStr += 'home'; break;
                case 45: outStr += 'ins'; break;
                case 46: outStr += 'del'; break;
                case 91:
                    if (navigator.appVersion.indexOf("Mac")!=-1) { outStr += 'cmd'; break;}
                    outStr += 'win'; break;
                case 112: outStr += 'F1'; break;
                case 113: outStr += 'F2'; break;
                case 114: outStr += 'F3'; break;
                case 115: outStr += 'F4'; break;
                case 116: outStr += 'F5'; break;
                case 117: outStr += 'F6'; break;
                case 118: outStr += 'F7'; break;
                case 119: outStr += 'F8'; break;
                case 120: outStr += 'F9'; break;
                case 121: outStr += 'F10'; break;
                case 122: outStr += 'F11'; break;
                case 123: outStr += 'F12'; break;
                case 144: outStr += 'nmlk'; break;
                case 187: outStr += '+'; break;
                case 189: outStr += '-'; break;
                case 192: outStr += '~'; break;
                default: outStr += String.fromCharCode(key[i]); break;
            }
        }
        return outStr;
    } else {
        if(96 <= key && key <= 105){

            return String.fromCharCode(key - 48);
        }
        switch(key){
            case 8: return 'bksp';
            case 9: return 'tab';
            case 16: return 'shift-';
            case 17: return 'ctrl-';
            case 18: return 'alt-';
            case 20: return 'cplk';
            case 32: return 'spc';
            case 33: return 'pgup';
            case 34: return 'pgdn';
            case 35: return 'end';
            case 36: return 'home';
            case 45: return 'ins';
            case 46: return 'del';
            case 91:
                if (navigator.appVersion.indexOf("Mac")!=-1) { return 'cmd'; }
                return 'win';
            case 112: return 'F1';
            case 113: return 'F2';
            case 114: return 'F3';
            case 115: return 'F4';
            case 116: return 'F5';
            case 117: return 'F6';
            case 118: return 'F7';
            case 119: return 'F8';
            case 120: return 'F9';
            case 121: return 'F10';
            case 122: return 'F11';
            case 123: return 'F12';
            case 144: return 'nmlk';
            case 189: return '-';
            case 187: return '+';
            case 192: return '~';
        }
    }
    //For all keys that do not need to override the results from String.fromCharCode.
    return String.fromCharCode(key);
}

/**
 * checks if element textbox is overflown.
 * @param element: Element to be checked.
 * @returns {boolean}: True if element is overflown, false otherwise.
 */
function isOverflown(element) {

    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
}

/**
 * Compares to arrays and returns false if any difference is present.
 * @param arr1: array to be compared to arr2.
 * @param arr2: array to be compared to arr1.
 * @returns {boolean} True if arrays have the same elements in the same locations, false otherwise.
 */
function compareArray(arr1, arr2){
    if(arr1.length !== arr2.length){ return false; }
    if(arr1.length === 0 && arr2.length === 0){ return true; }
    for(let i = 0; i < arr1.length; i++){
        if(arr1[i] !== arr2[i]){ return false; }
    }
    return true;
}

/**
 * send message to all open tabs to have js/content.js check if user is logged in or out and start/end execution.
 */
function updateContent(updateType){

    chrome.tabs.query({}, function(tabs) {

        for (var i=0; i<tabs.length; ++i) {

            chrome.tabs.sendMessage(tabs[i].id, {type: updateType});
        }
    });
}

