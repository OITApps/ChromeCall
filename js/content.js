window.onload = function() {

    if(!lisenceCheck()){
        return;
    }
    let pageHost = window.location.hostname.replace(/www./g, "");
    let tooltipInterval;
    let cursorIsOverTooltip = false;
    let cursorIsOverWrapper = false;
    const tooltip_width = 100;
    //original /[\(|\d|\+][0-9\(\)\/\+ \-\.]{6,}[0-9]/g;
    const phone_Number_Regex = /[\(|\d|\+][0-9\(\)\+ \-\.]{6,}[0-9]/g;
    const american_country_code = 1;
    const tooltip_mouseout_hide_time = 5;
    const american_Phone_Number_Length = 10;
    const min_phone_number_length= 7;
    //Initialize Extension
    init();




    /**
     * Generates tooltip elements.
     * @returns Object: Containing all HTML ELements generated for tooltip.
     *      {{tooltipCont: HTMLElement
     *      editModal: HTMLElement
     *      tooltip: HTMLElement
     *      closeEditModal: HTMLElement
     *      tooltipTop: HTMLElement
     *      callButton: HTMLElement
     *      tooltipBot: HTMLElement
     *      editLink: HTMLElement
     *      numText: HTMLElement
     */
    function generatetooltip(tooltipWidth) {
        /**
         *IMPORTANT
         * In the original document several lines using <element>.style.setProperty() were out of order.
         * Specifically for tooltipCont and tooltipBot.
         * Author may have intended this order.
         * They have been transcribed to a css file.
         */
        let id = 'cc_tip';

        let tooltip = document.createElement('div');
        tooltip.setAttribute('id', id);
        tooltip.style.display = 'none';
        tooltip.style.width = tooltipWidth ? tooltipWidth + 'px' : 'auto';
        tooltip.style.opacity = '1';

        let tooltipTop = document.createElement('div');
        tooltipTop.setAttribute('id', id + '_top');

        let tooltipCont = document.createElement('div');
        tooltipCont.setAttribute('id', id + '_cont');

        let tooltipContSpan = document.createElement('span');
        tooltipContSpan.setAttribute('id', id + '_cont_span');
        tooltipContSpan.innerHTML = 'Call';

        let tooltipBot = document.createElement('div');
        tooltipBot.setAttribute('id', id + '_bot');

        let editLink = document.createElement('a');
        editLink.setAttribute('class', 'cc_edit_num');
        editLink.innerHTML = "<img src='" + chrome.extension.getURL("img/pencil-15.png") + "'>";

        let editModal = document.createElement('div');
        editModal.setAttribute('id', 'cc_edit_num_modal');

        let numText = document.createElement('input');
        numText.setAttribute("id", "cc_num_txt");

        let callButton = document.createElement('button');
        callButton.setAttribute("id", "cc_call_btn");
        callButton.innerHTML = "Call";

        //closeEditModal = document.createElement('editLink');
        //closeEditModal.setAttribute("id", "close_edit_call_modal");
        //closeEditModal.innerHTML = "[Close]";

        document.body.appendChild(tooltip);
        document.body.appendChild(editModal);
        tooltip.appendChild(tooltipTop);
        tooltip.appendChild(tooltipCont);
        tooltipCont.appendChild(tooltipContSpan);
        tooltip.appendChild(tooltipBot);
        tooltip.appendChild(editLink);
        editModal.appendChild(numText);
        editModal.appendChild(callButton);
        //editModal.appendChild(closeEditModal);

        return {
            tooltip: tooltip,
            tooltipTop: tooltipTop,
            tooltipCont: tooltipCont,
            tooltipContSpan: tooltipContSpan,
            tooltipBot: tooltipBot,
            editLink: editLink,
            editModal: editModal,
            numText: numText,
            callButton: callButton,
            //closeEditModal: closeEditModal,
        };
    }

    /**
     * Take string list of domains and return an array of domains with all asterisks removed.
     * @param str: Input string list of domains
     * @returns Array: array of domains
     */
    function getDomains(str) {

        let outArr = new Array();
        let pageHost = window.location.hostname;
        pageHost = pageHost.replace(/www./g, "");

        let strArr = str.split(",");
        for (let i in strArr) {

            if (strArr[i].startsWith("*")) {

                if (
                    pageHost.search(
                    strArr[i].replace("*.", "").replace("*", "")
                    ) != -1
                ){

                    outArr.push(strArr[i]);
                }
            }
        }
        return outArr;
    }


    /**
     * Take in editLink config and set HTML class, style and content for uglipop_popbox.
     * @param config object: {class:string, keepLayout BOOL, content: string}
     */
    function uglipop(config) {

        if (config) {

            if (typeof config.class == 'string' && config.class) {

                document.getElementById('uglipop_popbox').setAttribute('class', config.class);
            }
            if (config.keepLayout && (!config.class)) {

                document.getElementById('uglipop_popbox').setAttribute('style'
                        ,'position:relative;height:300px;width:300px;background-color:white;opacity:1;');
            }

            if (typeof config.content == 'string' && config.content && config.source == 'html') {

                document.getElementById('uglipop_popbox').innerHTML = config.content;
            }

            if (typeof config.content == 'string' && config.content && config.source == 'div') {

                document.getElementById('uglipop_popbox').innerHTML = document.getElementById(config.content).innerHTML;
            }
        }

        document.getElementById('uglipop_overlay_wrapper').style.display = '';
        document.getElementById('uglipop_overlay').style.display = '';
        document.getElementById('uglipop_content_fixed').style.display = '';
    }

    /**
     * Remove HTML elements.
     */
    function remove() {

        document.getElementById('uglipop_overlay_wrapper').style.display = 'none';
        document.getElementById('uglipop_overlay').style.display = 'none';
        document.getElementById('uglipop_content_fixed').style.display = 'none';
    }

    /**
     * generates tooltip.
     * @type {{hide, _find_pos, fade, pos, mouseover, mouseout, show, updateStatusSuccess, click, updateStatusError}}
     */
    let cc_tip = {

        tooltipLeftOffset: 3,
        tooltipTopOffset: 3,
        tooltipMaxWidth: 300,
        tooltip_Set_Top_Offset: 3,

        //Elements
        tooltip: null,
        tooltipTop: null,
        tooltipCont: null,
        tooltipContSpan: null,
        tooltipBot: null,
        closeEditModal: null,
        editModal: null,
        editLink: null,
        numText: null,
        callButton: null,

        //intentionally deprecated symbol. A microsoft proprietary definition which should only be defined on internet
        //explorer browsers.
        isInternetExplorer: !!document.all,

        //Interval Timer
        onCallHideTimeout: null,
        intervalTime: 2000,

        //Functions
        /**
         * generate and style HTML elements
         * @param tooltipContHTML: HTML code to be entered inside tooltip Content.
         * @param tooltipWidth: Width of the tooltip.
         * @param target: Target of tooltip content.
         */
        show:function(tooltipWidth, target, fade){
            if(typeof this.tooltip == 'undefined' || this.tooltip == null){

                /**
                 * generate tooltip elements and set them.
                 * @type {{tooltipCont, editModal, tooltip, closeEditModal, tooltipTop, callButton, tooltipBot, editLink, numText}}
                 */
                let tooltipElements = generatetooltip(tooltipWidth)

                this.tooltip = tooltipElements['tooltip'];
                this.tooltipTop = tooltipElements['tooltipTop'];
                this.tooltipCont = tooltipElements['tooltipCont'];
                this.tooltipContSpan = tooltipElements['tooltipContSpan'];
                this.tooltipBot = tooltipElements['tooltipBot'];
                this.editModal = tooltipElements['editModal'];
                this.editLink = tooltipElements['editLink'];
                this.numText = tooltipElements['numText'];
                this.callButton = tooltipElements['callButton'];
                //this.closeEditModal = tooltipElements['closeEditModal'];

                //event listeners
                this.tooltip.onmouseover = null;
                this.tooltip.onmouseout = this.mouseout;
                this.tooltipCont.onclick = this.click;
            }

            //assign tooltip to moused over number wrapper element.
            if (typeof(target) !== 'undefined'){

                this.tooltip.target = target;
                targetNum = this.tooltip.target.getAttribute("data-cc-number");
            }

            if(this.tooltip.offsetWidth > this.tooltipMaxWidth){

                this.tooltip.style.width = this.tooltipMaxWidth + 'px'
            }
            this.tooltipTopOffset = parseInt(this.tooltip.offsetHeight) + this.tooltip_Set_Top_Offset;

            this.fade(fade);
        },

        /**
         * Sets position of tooltip.
         * @param element: Element tooltip is to be placed near.
         */
        pos:function(element){

            const tool_tip_additional_left_offset = 40;
            let position = this._find_pos(element.target);
            let curLeft = position[0];
            let curTop = position[1];
            this.tooltip.style.top = (curTop - this.tooltipTopOffset) + 'px';
            this.tooltip.style.left = (curLeft - this.tooltipLeftOffset - tool_tip_additional_left_offset) + 'px';
        },

        /**
         * Iterate Up through element parents until an element with display: none is found.
         * Gets the X,Y offset as it iterates granting the offset between the element and the parent with
         * a display: none attribute.
         * @param element which the offset is gathered from.
         * @returns array:
         *              curLeft: X offset between element argument and parent with display: none attribute.
         *              curTop: Y offset between element argument and parent with display: none attribute.
         */
        _find_pos: function(element){

            let curLeft = 0;
            let curTop = 0;
            if (element.offsetParent) {

                do {

                    curLeft += element.offsetLeft;
                    curTop += element.offsetTop;
                } while (element = element.offsetParent);
                const tooptip_width = 100;
                curLeft = ( curLeft < tooptip_width)? curLeft + tooptip_width : curLeft;

                return [curLeft, curTop];
            }
        },

        /**
         * Alters content of tooltip to reflect error status.
         * @param text: error message text. (hmtl)
         */
        updateStatusError: function (text) {

            this.tooltipCont.innerHTML = text;
            this.tooltipCont.style.setProperty('background', 'red', 'important');
            this.tooltipCont.style.setProperty('color', '#fff', 'important');
            this.tooltipCont.style.setProperty('width', '150px', 'important');
            this.hide(3000);
        },

        /**
         * Alters content of tooltip to reflect success status.
         * @param text: success message text. (hmtl)
         * @param persist: Sets whether the tooltip is temporary or permanent.
         */
        updateStatusSuccess: function (text, persist) {

            this.tooltipCont.innerHTML = text;
            this.tooltipCont.style.setProperty('background', 'green', 'important');
            this.tooltipCont.style.setProperty('color', '#fff', 'important');
            this.tooltipCont.style.setProperty('width', '150px', 'important');
            if (!persist){

                this.hide(2500);
            }
        },

        /**
         * Fades tooltip over 100 intervals over the span of miliseconds entered by time argument.
         * @param endAlpha: Desired alpha of tooltip.
         * @param time: milliseonds for fade to complete.
         */
        fade:function(out = true){

            let endAlpha;
            if((cursorIsOverTooltip || cursorIsOverWrapper)
                && (out == false || out === 'false')) {
                endAlpha = 1;
                this.tooltip.style.display = 'block';
                this.tooltip.onmouseover = this.mouseover;
            } else {
                endAlpha = 0;
            }

            let alpha = this.tooltip.style.opacity;;
            let alphaDiff;
            let tick = 0;
            let nextAlpha = 0;

            clearInterval(tooltipInterval);

            //failed to get opacity.
            if(typeof alpha == 'undefined' || alpha == null || alpha == ''){
                return log('Error: Failed to get Tooltip Opacity.');
            }

            alphaDiff = endAlpha - alpha;
            alphaDiff = alphaDiff.toFixed(2) / 100;
            //No fade needed.
            if(alphaDiff == 0) return;

            tooltipInterval = setInterval(function() {
                nextAlpha = parseFloat(cc_tip.tooltip.style.opacity) + alphaDiff;
                if (nextAlpha < 0) {

                    nextAlpha = 0;


                } else if (nextAlpha > 1) {

                    nextAlpha = 1;
                }
                if (tick < 100) {

                    cc_tip.tooltip.style.opacity = "" + nextAlpha;
                } else {
                    clearInterval(tooltipInterval);
                    cc_tip.tooltip.style.opacity = '' + endAlpha;
                    if(endAlpha == 0) {

                        cc_tip.tooltip.style.display = 'none';
                        cc_tip.tooltip.onmouseover = null;
                    }
                }
                tick++;
            }, tooltip_mouseout_hide_time);
        },

        /**
         * Hides tooltip after delay.
         * @param timeout: Milliseconds until tooltip is hidden.
         */
        hide:function(timeout = 300){

            clearInterval(tooltipInterval);
            tooltipInterval = setTimeout(function(){

                cc_tip.tooltip.style.setProperty('opacity','0', 'important');
            }, timeout);
        },

        /** clears tooltip intervals on mouseover. */
        mouseover: function(){
            cursorIsOverTooltip = true;
            cc_tip.fade(false);
        },

        /**
         * hides tooltip when mouse cursor leaves tooltip.
         * resets timer on hide execution if mouse cursor enters and leaves tooltip.
         * */
        mouseout: function(){
            cursorIsOverTooltip = false;
            cc_tip.fade(true);
        },

        /**
         *
         *
         */
        click:function(){

            log( extension_initials + ' current target number clicked ' + targetNum);
            cc_tip.fade(true);
            checkAndCall();
        }
    }

    /**
     * Scrapes page and creates wrappers for all phone number text strings found inside the document then
     * registers handlers for mouse click and mouseovers.
     */
    function makePhoneLinks() {

        //check is document is ready
        if(document.readyState=="complete"){

            getTextNodes(document.body);
            assignHandlers();
        //if document not ready try again in .5 seconds.
        }else{

            setTimeout(makePhoneLinks,500);
        }
    }

    /**
     * Search for DOM elements with phone numbers and apply wrapNode function to them.
     * @param node: Node to be searched (document.body to search entire page)
     */
    function getTextNodes(node) {

        const ignoreNode = ['STYLE', 'SCRIPT', "INPUT", "TEXTAREA"];

        /**
         * Ignore Node and all child nodes unless:
         * line 1 & 2 & 3: Node does not already have an assigned data-cc-number (Node is a not already a wrapper.)
         * line 4: Node is not in list of nodes to not check
         */
        if(
            !(
                typeof node.hasAttribute === 'function'              //line1
                &&
                node.hasAttribute('data-cc-number')     //line2
            )
            &&
            node.className != 'cc-number-wrapper'                    //line3
            &&
            !ignoreNode.includes(node.nodeName)                      //line4
        ){
            /*
            if(node.nodeName == 'A' && typeof node.href === 'string' && node.href.startsWith("tel:")){

                wrapNode(node);
                return;
            }
            */

            //Node to be wrapped
            if (node.nodeType == node.TEXT_NODE && phone_Number_Regex.test(node.nodeValue)){

                wrapNode(node);
                return;
            }

            //Node to be iterated
            for (let i = 0; i < node.childNodes.length; i++) {

                getTextNodes(node.childNodes[i]);
            }
        }
    }

    /**
     * generates tooltip html elements if not already existing,
     *              sets position of tooltip elements
     */
    function hoverMouseover(event){

        cursorIsOverWrapper = true;
        //show and position modal.
        cc_tip.show(tooltip_width, event.target, false);
        cc_tip.pos(event);
        //update tooltip to store phone number.
        document.getElementById("cc_num_txt").value =  this.getAttribute("data-cc-number");
        document.getElementsByClassName("cc_edit_num")[0].setAttribute('data-cc-number',
            this.getAttribute('data-cc-number'));

    }

    /**
     * Hide tooltip on cursor exiting element
     */
    function hoverMouseout(element){
        cursorIsOverWrapper = false;
        cc_tip.fade(true);
    }

    /**
     * Generate uglipop modal and initialize modal content to cc_edit_num_modal.
     */
    function editNum(){

        uglipop({
            class:'cc_modal',
            source:'div',
            content:'cc_edit_num_modal'
        });
        document.getElementById("cc_num_txt").value =  this.getAttribute('data-cc-number');
    }


    /**
     * Finds all number wrappers added by wrapNode() and assigns event listens to them.
     */
    function assignHandlers(){

        let numberWrappersElements = document.getElementsByClassName('cc-number-wrapper');
        for (let i = 0, len = numberWrappersElements.length; i < len; i++) {

            numberWrappersElements[i].addEventListener('mouseover', hoverMouseover );
            numberWrappersElements[i].addEventListener('mouseout', hoverMouseout);
        }
        let editNumberElements = document.getElementsByClassName('cc_edit_num');
        for (let i = 0, len = editNumberElements.length; i < len; i++) {

            editNumberElements[i].addEventListener('click', editNum );
        }
    }

    /**
     * Removes [ "" ] and [ " " ] from the input string.
     * @param string str: string to remove above symbols from.
     * @returns string: String with above symbols removed.
     */
    function trim(str){
        return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    }

    /**
     * Extracts phone number string from string containing phone number.
     * @param string numbers: string containing a phone numbers
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
            .replace(/[^0-9]/g,"");

        if(isInternationalNumber){

            //if country code is not the same as user's country code.
            if(!cleanNum.startsWith(countryCode)){

                log("Does not have [+countryCode]: " + cleanNum);
                cleanNum = internationalPrefix + cleanNum;
            } else {

                log("Has countryCode: " + cleanNum);
            }
        }

        return cleanNum;
    }

    function targetNode(node){

        //remove we need to catch 3, 4, 5, 7, 10, and 10+ digit numbers
        const american_Phone_Number_Length = 10;
        const min_phone_number_length = 7;

    }
    /**
     * Take an HTML element and find all instances matching the given regex.
     * @param node: Element to be checked for matches for the regex.
     * @param regex: Regular Expression.
     */
    function wrapNode(node) {


        if(node.nodeName = 'A'){

        }
        //if node is itself a number wrapper generated by this function or if element contains the word google,
        //do nothing.

        if (typeof node.nodeValue == 'string'
            && node.nodeValue.indexOf('cc-number-wrapper') != -1
            || node.nodeValue.indexOf("google") !== -1){

            return
        }

        //find text that matches phone number regex.
        let numbersFound = node.nodeValue.match(phone_Number_Regex);

        for( i in numbersFound ){

            numbersFound[i] = trim(numbersFound[i]);
            //Does not match phone number syntax.
            if(trim(numbersFound[i])=="") {

                continue;
            }
            let number = cleanNumber(numbersFound[i]);
            if(number.length >= min_phone_number_length){
                //Line1: American phone number
                //Line2: International phone number.
                if(
                    ( number.length == american_Phone_Number_Length && countryCode == american_country_code )
                    ||
                    ( number.length < dialStringLength && countryCode != american_country_code )
                ){

                    number = countryCode + number;
                }
                if(number.length == min_phone_number_length && countryCode == american_country_code){
                    
                    number = countryCode + areaCode + number;
                }

                //generate new html Pwelements to replace number text on page.
                let innerHTML = "<span class='cc-number-wrapper' data-cc-number='" + number + "' >"
                    + numbersFound[i] + "</span>";
                let numWrapper = document.createElement('div');
                numWrapper.className = 'cc-number-wrapper-div';

                //only perform replace if node is a data node.
                //  replace found number with new html elements.
                if(node.data){

                    numWrapper.innerHTML = node.data.replace(numbersFound[i], innerHTML);
                }
                //place node before numWrapper
                while(numWrapper.firstChild) {
                    if(typeof node.parentNode == "undefined" && node.parentNode == null){
                        break;
                    }
                    node.parentNode.insertBefore(numWrapper.firstChild, node);
                }
                node.parentNode.removeChild(node);
            }
        }
    }

    /**
     * checks options domain filter to see if current page is whitelisted (if whitelist is on)
     * or if current page is not blacklisted (if blacklist is on).
     * or if no list is selected
     * @param filter type of filter
     * @param domainList
     * @returns {boolean}
     */
    function checkDomainFilter(filter, domainList){

        //StarDomains are domains where all subdomains are accepted into the whitelist or blacklist
        let domainListStar = [];
        //if Included domains includes any asterisks.
        if (domainList.search(/\*/g) !== -1) {

            domainListStar = getDomains(domainList);
        }
        //List Set to Whitelist and current page is on domain list.
        let isWhiteListed = (
            filter === "whitelist"
            &&
            (domainList.search(pageHost) !== -1 || domainListStar.length > 0)
        );

        //List Set to blacklist and current page is on domain list.
        let isBlackListed = (
            filter === "blacklist"
            &&
            (domainList.search(pageHost) === -1 && domainListStar.length === 0)
        );

        let isNoListed = (filter !== 'whitelist' && filter !== 'blacklist');

        if(isNoListed || isWhiteListed || isBlackListed){
            return true;
        }
        return false;
    }

    /**
     * initialize Extension on Document Load.
     */
    function init(){

        chrome.storage.sync.get({
            'filter': '',
            'domain_list': '',
        }
            /**
             * Javascript code continues execution before chrome.storage.sync.get function returns.\
             * As a result all sequential code must be scoped within chrome.storage.sync.get on success function
             * (argument 2)
             */
        ,function (items) {

            if (!checkDomainFilter(items.filter, items.domain_list)) {
                let tempExtensionInitials1, tempExtensionInitials2;
                if(extension_initials == ''){
                    tempExtensionInitials1 = 'Extension';
                    tempExtensionInitials2 = 'extension';
                } else {
                    tempExtensionInitials1 = extension_initials;
                    tempExtensionInitials2 = extension_initials;
                }
                log(tempExtensionInitials1 + ': Current Page is filtered.' + tempExtensionInitials2
                    + 'will Not Run.');
                return;
            }

            chrome.storage.sync.get({
                'country_code': '011',
                'dialstring_length':'11',
                'intl_prefix':'',
                'login_name':'',
                'domain':'',
                'user':'',
                'pass':'',
                'clientid':'',
                'clientsecret':'',
                'areacode':'',
                'url':'',
            }, function(items) {

                if(user != '' && pass != '') {

                    countryCode = parseInt(items.country_code);
                    dialStringLength = parseInt(items.dialstring_length);
                    internationalPrefix = items.intl_prefix;
                    domain = items.domain;
                    user = items.user;
                    pass = items.pass;
                    loginName = items.login_name;
                    areaCode = parseInt(items.areacode);

                    //generate modal HTML elements and grant them ID.
                    var overlay = document.createElement('div');
                    var popbox = document.createElement('div');
                    var overlay_wrapper = document.createElement('div');
                    var content_fixed = document.createElement('div');

                    //grant modal HTML elements ID's.
                    content_fixed.id = 'uglipop_content_fixed';
                    popbox.id = 'uglipop_popbox';
                    overlay_wrapper.id = "uglipop_overlay_wrapper";
                    overlay.id = "uglipop_overlay";

                    //nest modal HTML elements.
                    overlay_wrapper.appendChild(overlay);
                    content_fixed.appendChild(popbox);
                    document.body.appendChild(overlay_wrapper);
                    document.body.appendChild(content_fixed);

                    //hide modal HTML elements.
                    document.getElementById('uglipop_overlay_wrapper').style.display = 'none';
                    document.getElementById('uglipop_overlay').style.display = 'none';
                    document.getElementById('uglipop_content_fixed').style.display = 'none';


                    var docBody = document.querySelector('body');
                    if(docBody !== null) {

                        docBody.addEventListener('click', function (event) {

                            //if clicked element is a button generated by the wrapper.
                            if (event.target.tagName.toLowerCase() === 'button'
                                && event.target.id == "cc_call_btn") {

                                targetNum = document.getElementById("cc_num_txt").value;
                                checkAndCall();
                            }
                            //if user removes call from element.
                            if (event.target.tagName.toLowerCase() === 'a'
                                && event.target.id == "close_edit_call_modal"){

                                remove();
                            }
                        });
                    }


                    //remake phonelinks when the page's DOM tree is changed.
                    /*document.addEventListener('DOMSubtreeModified', function(){
                        clearInterval(subtree_load_timer);
                        subtree_load_timer = setTimeout(function(){
                            makePhoneLinks();
                        }, 500);
                    });*.
                    /* Event Listeners to remove HTML elements. */
                    overlay_wrapper.addEventListener('click', remove);
                    window.addEventListener('keypress', function (e) {

                        //hide modal if button is ESC ;)
                        if (e.key == 27) {

                            remove();
                        }
                    });
                    cc_tip.show(tooltip_width, document.body, true);
                    cc_tip.hide(true);
                    log(extension_initials + ' Extension will run');
                    makePhoneLinks();


                }
            });

        });
    }

    function lisenceCheck(){
        return true;
    }
}