/**
    query-3.3.1.min.js,
    axios.min.js,
    config.js,
    js/api.js,
*/
let shortNumberSearch = false;

const shortNumberRegex = [
    /(?<!\d[ \-)]*)\d{3}(?![ -(]*\d)/g,
    /(?<!\d[ \-)]*)\d{4}(?![ -(]*\d)/g,
    /(?<!\d[ \-)]*)\d{5}(?![ -(]*\d)/g,
];
const longNumberRegex = [
    /\+?\(*(\d{1,4}[(). -]*)?[2-9]\d{2}[) -]*[2-9a-zA-Z] *(?!1[ -]*1)([0-9A-Za-z][- ]*){2}(([- ]*[a-zA-Z]){4}|\d{4})/g,
    /(?<!\d[ \-)]*)([2-9](?!11)([0-9]){2})[-| ]*\d{4}(?![ -(]*\d)/g,
];


/**
 * Scrapes page and creates wrappers for all phone number text strings found inside the document then
 * registers handlers for mouse click and mouseovers.
 */
function makePhoneLinks(){

    let t = new Date().getTime()
    //check is document is ready
    if(document.readyState === "complete"){
        chrome.storage.sync.get({
            shortNumberSearch: false
        }, function(items){

            getTextNodes(document.body, items.shortNumberSearch);
            log((t - new Date().getTime()) / -1000 + 'seconds to run getTextNodes()');
        });
        //if document not ready try again in .5 seconds.
    }else{

        setTimeout(makePhoneLinks,500);
    }
}

/**
 * Search for DOM elements with phone numbers and apply wrapNode function to them.
 * @param node: Node to be searched (document.body to search entire page)
 */
function getTextNodes(node, shortNumberSearch){

    /**
     * Ignore Node and all child nodes unless:
     * line 1 & 2 & 3: Node does not already have an assigned data-cc-number (Node is a not already a wrapper.)
     * line 4: Node is not in list of nodes to not check
     */
    if(node.nodeType === node.TEXT_NODE && node.nodeValue.length > 2 && node.nodeValue.search(/\d/) > -1) {
        let wrapped = wrapNode(node, shortNumberSearch);
        if(wrapped) return;
    }

    $(node).contents().each(function(){

        if( !ignoreNode.indexOf(this.tagName) > -1
            && !(
                typeof this.nodeValue == 'string'
                && this.nodeValue.indexOf("google") !== -1)
            && !(
                typeof this.classname === 'string'
                && this.classList.indexOf('cc-number-wrapper') !== -1)
            && !(
                typeof this.hasAttribute === 'function'
                && this.hasAttribute('data-cc-number'))
        ){
            getTextNodes($(this)[0], shortNumberSearch); }
    });
}

/**
 * Wrap text node elements in span to identify via mouseover events which text nodes have phone numbers in them.
 * @param node to be wrapped.
 * @param shortNumberSearch Whether Wrapnode acknowledges short number strings as phone numbers.
 * @returns {boolean} Whether or not the node found a number and placed a wrap over the node.
 */
function wrapNode(node, shortNumberSearch){
    let ran = false;
    let tempResult;
    let result = [], shortResult = [];
    let newNodeStr = node.nodeValue;
    for (k in longNumberRegex) {
        tempResult = newNodeStr.match(longNumberRegex[k]);
        for (i in tempResult) {
            newNodeStr = newNodeStr.replace(tempResult[i], numberDecoy + result.length + numberDecoy);
            result.push(tempResult[i]);
        }
    }

    if(shortNumberSearch) {
        for (let k = 0; k < shortNumberRegex.length; k++) {
            shortResult = newNodeStr.match(shortNumberRegex[k]) || [];
            for (let i = 0; i < shortResult.length; i++) {
                ran = true;
                newNodeStr = newNodeStr.replace(shortResult[i], '<span class="cc-number-wrapper" data-cc-number="'
                    + cleanNumber(shortResult[i]) + '" >' + shortResult[i] + '</span>');
            }
        }
    }
    for (let i = 0; i < result.length; i++) {
        ran = true;
        newNodeStr = newNodeStr.replace(numberDecoy + i + numberDecoy,
            '<span class="cc-number-wrapper" data-cc-number="'
            + cleanNumber((result[i].length === 7? areaCode + result[i]: result[i])) + '" >' + result[i] + '</span>');
    }
    if(!ran) return false;
    let replacement = $($.parseHTML(newNodeStr));
    for(let i = 0; i < replacement.length; i++){
        node.parentNode.insertBefore(replacement[i], node);
    }
    node.parentNode.removeChild(node);
    return true;
}

/**
 * Extracts phone number string from string containing phone number.
 * @param number: string containing a phone numbers
 * @returns string containing phone number.
 */
function cleanNumber(number){

    let isInternationalNumber = false;
    //International calls syntax usually starts with '+'.
    if(number.startsWith("+")){

        isInternationalNumber = true;
    }
    //remove: whitespaces, parentheses and anything that is not a number.
    let cleanNum = number.replace(/-/g,"")
        .replace(/ /g,"")
        .replace(/[(]/g,"")
        .replace(/[)]/g,"")
        .replace(/[^0-9]/g,"")
        .replace(/[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    if(isInternationalNumber){

        //if country code is not the same as user's country code.
        if(!cleanNum.startsWith(countryCode)){

            cleanNum = internationalPrefix + cleanNum;
        } else {

        }
    }
    return cleanNum;
}

/**
 * Search text highlighted by cursor to place a context menu item to call said number.
 * @returns {string}
 */
function searchHighlighted(){

    let defaultText = '';
    let newNodeStr = window.getSelection().toString();
    if(typeof newNodeStr === 'string'){

        let result;
        for (k in longNumberRegex) {

            result = newNodeStr.match(longNumberRegex[k]);
            if(result && result.length && result.length > 0){

                defaultText = result[0];
                break;
            }
        }
        if(defaultText === '' && shortNumberSearch) {

            for (k in shortNumberRegex) {

                result = newNodeStr.match(shortNumberRegex[k]);
                if(result && result.length && result.length > 0){

                    defaultText = result[0];
                    break;
                }
            }
        }
    }
    return defaultText;
}

