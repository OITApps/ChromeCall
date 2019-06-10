/**
    query-3.3.1.min.js,
    axios.min.js,
    config.js,
    js/api.js,
*/
let shortNumberSearch = false;
let makePhoneLinksInProgress = false;
const ignoreNode = ['STYLE', 'SCRIPT', "INPUT", "TEXTAREA", 'IFRAME', 'CANVAS'];
const numberDecoy = '[[!@#$%!@#$%!@#$%]]';
const filteredNumberDecoy = '))?@*$%?@*$%?@*$%((';
const shortNumberRegex = [
    /\b(?<!\d[ \-)]*)\d{3}(?![ -(]*\d)\b/g,
    /\b(?<!\d[ \-)]*)\d{4}(?![ -(]*\d)\b/g,
    /\b(?<!\d[ \-)]*)\d{5}(?![ -(]*\d)\b/g,
];
const longNumberRegex = [
    /\b\+?\(*(\d{1,4}[(). -]*)?[2-9]\d{2}[) -]*[2-9a-zA-Z] *(?!1[ -]*1)([0-9A-Za-z][- ]*){2}(([- ]*[a-zA-Z]){4}|\d{4})\b/g,
    /\b(?<!\d[ \-)]*)([2-9](?!11)([0-9]){2})[-| ]*\d{4}(?![ -(]*\d)\b/g,
];

/**
 * Scrapes page and creates wrappers for all phone number text strings found inside the document then
 * registers handlers for mouse click and mouseovers.
 */
function makePhoneLinks(){

    if(makePhoneLinksInProgress){
        setTimeout(makePhoneLinks, 250);
        return;
    }
    makePhoneLinksInProgress = true;
    let time = new Date().getTime();
    //check is document is ready
    if(document.readyState === "complete"){
        chrome.storage.sync.get({
            shortNumberSearch: false,
            number_list: {},
            user: '',
            filter: {
                number: 'nofilter'
            },
        }, function(items){

            getTextNodes(document.body,
                items.shortNumberSearch,
                sortAndIndex(items.number_list[items.user]),
                items.filter.number);
            log((time - new Date().getTime()) / -1000 + 'seconds to run getTextNodes()');
        });
        //if document not ready try again in .5 seconds.
    } else {

        setTimeout(makePhoneLinks,500);
    }
    makePhoneLinksInProgress = false;
}

/**
 * Search for DOM elements with phone numbers and apply wrapNode function to them.
 * @param node: Node to be searched (document.body to search entire page)
 * @param shortNumberSearch: (bool) checks whether short numbers (length of 3-5) should be wrapped by wrapNode.
 * @param numberFilter: (Obj) Object with indexed sorted arrays of phone numbers.
 * @param filterMode: (enum)
 *      'blacklist' : Do not wrap node if number is in numberFilter.
 *      'whitelist' : Wrap node only if it is in numberFilter.
 *      'nofilter' : Always wrap found numbers
 */
function getTextNodes(node, shortNumberSearch, numberFilter = {}, filterMode = 'nofilter'){

    //Google refreshes the page if any elements on it's page are modified. This is to avoid a never ending refresh loop.
    if(typeof node.nodeValue === 'string' && node.nodeValue.indexOf("google") !== -1){ return; }
    for(let i = 0; i < ignoreNode.length; i++){

        if(node.nodeType === ignoreNode[i]){ return; }
    }

    let jNode = $(node);
    let contents = jNode.contents();

    //Current Node is a wrapper that is not accepted by the filter.
    if(node.className
        && node.className === 'cc-number-wrapper'){

        if(node.hasAttribute("data-cc-number")
            && !checkFilter(jNode.attr('data-cc-number'), numberFilter, filterMode)
        ){
            jNode.replaceWith(contents);
            return;
        }

    }
    if(node.nodeType === node.TEXT_NODE
        && node.nodeValue.length > 2
        && node.nodeValue.search(/\d/) > -1){

        let wrapped = wrapNode(node, shortNumberSearch, numberFilter, filterMode);
        if(wrapped) { return; }
    }
    contents.each(function(){

        getTextNodes($(this)[0], shortNumberSearch, numberFilter, filterMode);
    });


}

/**
 * Wrap text node elements in span to identify via mouseover events which text nodes have phone numbers in them.
 * @param node to be wrapped.
 * @param shortNumberSearch Whether Wrapnode acknowledges short number strings as phone numbers.
 * @param numberFilter: (Obj) Object with indexed sorted arrays of phone numbers.
 * @param filterMode: (enum)
 *      'blacklist' : Do not wrap node if number is in numberFilter.
 *      'whitelist' : Wrap node only if it is in numberFilter.
 *      'nofilter' : Always wrap found numbers
 * @returns {boolean} Whether or not the node found a number and placed a wrap over the node.
 */
function wrapNode(node, shortNumberSearch, numberFilter = {}, filterMode = 'nofilter'){

    let ran = false;
    let tempResult;
    let result = [], cleanResult = [], filteredResult = [], shortResult = [];
    let newNodeStr = node.nodeValue;
    let cleanedNumber, filteredCleanResult = [];
    for (k in longNumberRegex) {
        tempResult = newNodeStr.match(longNumberRegex[k]);
        for (i in tempResult) {

            cleanedNumber = cleanNumber(tempResult[i].length === 7? areaCode + tempResult[i]: tempResult[i]);

            if(checkFilter(cleanedNumber, numberFilter, filterMode)) {

                newNodeStr = newNodeStr.replace(tempResult[i], numberDecoy + result.length + numberDecoy);
                result.push(tempResult[i]);
                cleanResult.push(cleanedNumber);
            } else {


                newNodeStr = newNodeStr.replace(tempResult[i], filteredNumberDecoy + filteredResult.length
                    + filteredNumberDecoy);
                filteredResult.push(tempResult[i]);
                filteredCleanResult.push(cleanedNumber)
            }
        }

    }
    if(shortNumberSearch) {

        for (let k = 0; k < shortNumberRegex.length; k++){

            shortResult = newNodeStr.match(shortNumberRegex[k]) || [];
            for (let i = 0; i < shortResult.length; i++) {

                ran = true;
                cleanedNumber = cleanNumber(shortResult[i]);
                if(checkFilter(cleanedNumber, numberFilter, filterMode)){

                    newNodeStr = newNodeStr.replace(shortResult[i], '<span class="cc-number-wrapper" ' +
                        'data-cc-number="' + cleanedNumber + '">' + shortResult[i] + '</span>');
                }

            }
        }
    }
    for(let i = 0; i < result.length; i++) {

        ran = true;
        newNodeStr = newNodeStr.replace(numberDecoy + i + numberDecoy,
            '<span class="cc-number-wrapper" data-cc-number="' + cleanResult[i] + '" >' + result[i]
            + '</span>');
    }
    for(let i = 0; i < filteredResult.length; i++) {

        ran = true;
        newNodeStr = newNodeStr.replace(filteredNumberDecoy + i + filteredNumberDecoy, filteredResult[i]);
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
    number = number.toLowerCase();
    let isInternationalNumber = false;
    //International calls syntax usually starts with '+'.
    if(number.startsWith("+")){

        isInternationalNumber = true;
    }
    //remove: whitespaces, parentheses and anything that is not a number or letter.
    let cleanNum = number.replace(/[^0-9a-zA-Z]/g,"");

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
 * Checks if number is allowed based on sortAndIndex()'s phone number list obj and the filter mode.
 * Item is assumed to have been run through cleanNumber (as well as obj provided by sortAndIndex().
 * @param item: phone number to be checked.
 * @param filter: (Obj) Object with indexed sorted arrays of phone numbers.
 * @param mode: (enum)
 *      'blacklist' : Do not wrap node if number is in numberFilter.
 *      'whitelist' : Wrap node only if it is in numberFilter.
 *      'nofilter' : Always wrap found numbers
 * @returns {boolean} Whether or not the item should be allowed based on the above parameters.
 */
function checkFilter(item, filter, mode){

    if(mode === 'nofilter' || filter === {}){

        return true;
    }
    if(item === null || item === ''){

        log('CheckFilter: Warning Empty Item');
        return true;
    }
    let found = false;
    if(filter[item[0]]){

        for(let i in filter[item[0]]){

            if(filter[item[0]].hasOwnProperty(i) && filter[item[0]][i] === item){

                found = true;
                break;
            }
        }

    }
    if(mode === 'blacklist'){

        return !found;
    }
    if(mode === 'whitelist'){

        return found;
    }

    log("Warning: Number did not run through any kind of filter.");
    return false;
}

/**
 * Generates an object with indexes of arrays containing phone numbers that start with the same character.
 * Assumed to already be cleaned numbers.
 * @param: number_list assumed to be already sorted list of numbers.
 * @return: obj: Object with an index of sorted arrays of phone numbers.
 */
function sortAndIndex(list = ''){

    if (list !== '') {

        let filteredNumbers = {};
        let token;
        let filteredTokens = mergeSort(list.split(","));
        for (let i = 0; i < filteredTokens.length; i++) {

            token = cleanNumber(filteredTokens[i]);
            if (filteredTokens[i] !== '') {

                if (!filteredNumbers[token[0]]) {

                    filteredNumbers[token[0]] = [];
                }
                filteredNumbers[token[0]][filteredNumbers[token[0]].length] = token;
            }
        }
        return filteredNumbers;
    }
    return {};
}

/**
 * Sorts an array.
 * @param arr: Array to be sorted
 * @returns array: Sorted Array
 */
function mergeSort (arr) {

    if (arr.length === 1) {

        return arr;
    }
    const middle = Math.floor(arr.length / 2) // get the middle item of the array rounded down
    return merge(
        mergeSort(arr.slice(0, middle)),
        mergeSort(arr.slice(middle))
    )
}

/**
 * Compare the arrays item by item and return the concatenated result
 * @param left: left half of a larger array.
 * @param right : right half of a larger array.
 */
function merge(left, right) {

    let result = [];
    let indexLeft = 0;
    let indexRight = 0;
    while (indexLeft < left.length && indexRight < right.length) {

        if (left[indexLeft] < right[indexRight]) {

            result.push(left[indexLeft]);
            indexLeft++;
        } else {

            result.push(right[indexRight]);
            indexRight++;
        }
    }
    return result.concat(left.slice(indexLeft)).concat(right.slice(indexRight));
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