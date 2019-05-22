/**
 * File Dependencies:
 js/jquery-3.3.1.min.js,
 js/bootstrap.min.js,
 js/axios.min.js,
 config.js,
 js/stub.js,
 js/search.js,
 js/api.js,
 js/modal.js,
 js/keybind.js
 */

const ignoreNode = ['STYLE', 'SCRIPT', "INPUT", "TEXTAREA", 'IFRAME', 'CANVAS'];
const numberDecoy = ';:^^';
let pageHost = window.location.hostname.replace(/www./g, "");
let countryCode = '';
let internationalPrefix = '';
let areaCode = '';
let loaded = false;

window.onload = function() {
    if (!licenceCheck()) return;
    init();
};


/**
 * tooltip.
 * @type {{ _find_pos, fade, pos, mouseover, mouseout, show, click}}
 */
cc_tip = {

    tooltip_Left_Offset: 3,
    tooltip_Set_Top_Offset: 3,
    tool_tip_height: 34,
    tooltip_Top_Offset: 3,

    //Elements
    tooltip: null,
    tooltipBg: null,
    tooltipBgSuccess: null,
    tooltipBgFailure: null,
    tooltipCont: null,
    tooltipContSuccess: null,
    tooltipContFailure: null,
    raiseModalBackdrop: null,
    raiseModalButton: null,
    closeButtonBackdrop: null,
    closeButton: null,

    displayNumberBeforeCall: false,
    cursorIsOverTooltip: null,
    cursorIsOverWrapper: null,
    successFadeout: null,
    mouseedOverWrapper: null,

    /**
     * Sets position of tooltip.
     * @param event: Event which triggered tooltip repositioning.
     */
    pos:function(event) {

        //assign tooltip to moused over number wrapper element.
        if (typeof(event.target) !== 'undefined'){

            this.tooltip.target = event.target;
            callNum = this.tooltip.target.getAttribute("data-cc-number");
        }

        const tooptip_width = 106;
        const tooptip_height = 38;
        const tooltip_Left_Offset_additional = 43;
        let left = 0;
        let top = 0;
        let element = event.target;
        if (element.offsetParent) {

            do {

                left += element.offsetLeft;
                top += element.offsetTop;
            } while (element = element.offsetParent);


        }
        if(left >= tooptip_width && top >= tooptip_height) {
            left = left - tooltip_Left_Offset_additional;
            top = top - this.tool_tip_height - this.tooltip_Top_Offset;
        } else if (left < tooptip_width && top >= tooptip_height){
            left = left + $(event.target).width() + this.tooltip_Left_Offset - tooltip_Left_Offset_additional;
            top = top - this.tool_tip_height - this.tooltip_Top_Offset;
        } else if (left >= tooptip_width && top < tooptip_height) {
            top = top + $(event.target).height() + this.tooltip_Set_Top_Offset;
        } else {
            left = left + $(event.target).width() + this.tooltip_Left_Offset - tooltip_Left_Offset_additional;
            top = top + $(event.target).height() + this.tooltip_Set_Top_Offset;
        }

        this.tooltip.css({
            top: top + 'px',
            left: left + 'px'
        });
    },

    /**
     * Fades tooltip over 100 intervals over the span of miliseconds entered by time argument.
     * @param out: True if desired opacity is 0, false if 1.
     * @param time: Time to execute animations.
     * @param func: function to be ran after fade completes.
     */
    fade:function(out = true, time = 500, func = null){

        if(!time || typeof time === 'undefined'){ time = 500; }

        cc_tip.tooltip.css('display', 'block');
        cc_tip.tooltipContSuccess.css('display', 'block');
        cc_tip.tooltipContFailure.css('display', 'block');
        /*if fade is set to out and either:
            Cursor's position is to be ignored.
            Or Cursor is in appropriate location to start fade.
        */ 
        if(out){
            cc_tip.tooltip.stop().animate({opacity: 0}, time, null, function () {
                cc_tip.tooltip.css('display', 'none');
                    if (func) {
                        func();
                }
            });
        } else {
            cc_tip.tooltip.css('display', 'block').stop().animate({ opacity: 1 }, time, null, function(){
                if(func){ func(); }
            });
        }
    },

    /** clears tooltip intervals on mouseover. */
    mouseover: function(){

        cc_tip.cursorIsOverTooltip = true;
        if(cc_tip.successFadeout){

            resetTooltip();
        }

        if(!$(cc_tip.mouseedOverWrapper).prop('disabled')){

            cc_tip.fade(false);
        }
        showModalbuttons()
    },

    /**
     * hides tooltip when mouse cursor leaves tooltip.
     * resets timer on hide execution if mouse cursor enters and leaves tooltip.
     * */
    mouseout: function(){

        cc_tip.cursorIsOverTooltip = false;
        if(!cc_tip.cursorIsOverWrapper
            && !$(cc_tip.mouseedOverWrapper).prop('disabled')
            && !cc_modal.modalRaised) {
            cc_tip.fade(true);

        }
        hideModalButtons()
    },

    /**
     *
     *
     */
    click:function(event){

        if(!$(cc_tip.mouseedOverWrapper).prop('disabled')
            && event.target.id !== 'cc_tip_raise_modal_button'
            && event.target.id !== 'cc_tip_raise_modal_backdrop'
            && !cc_modal.modalRaised) {

            log('cc_tip.click()');
            log('-' + extension_initials + ' current target number clicked ' + callNum);

            if(cc_tip.displayNumberBeforeCall) {

                raiseModal(cc_tip.raiseModalButton.attr('data-cc-number'));
                cc_tip.tooltip.css({display: 'none'});
            } else {

                makeCall(null, {
                    func: successFlash,
                    errFunc: errorFlash,
                });
            }
        }

    }
};

/**
 * Generates tooltip elements.
 */
function generatetooltip() {

    let id = 'cc_tip';
    cc_tip.tooltip = $('<div id="' + id + '"></div>');
    cc_tip.tooltipBg = $('<img id="' + id + '_bg" src="' + chrome.extension.getURL('img/tooltip bg.png') + '">');
    cc_tip.tooltipBgSuccess = $('<img id="' + id + '_bg_success" src="'
        + chrome.extension.getURL('img/tooltip bg success.png') + '">');
    cc_tip.tooltipBgFailure = $('<img id="' + id + '_bg_failure" src="'
        + chrome.extension.getURL('img/tooltip bg failure.png') + '">');
    cc_tip.tooltipCont = $('<span id="' + id + '_cont">Call</span>');
    cc_tip.tooltipContSuccess = $('<span id="' + id + '_cont_success">Success</span>');
    cc_tip.tooltipContFailure = $('<span id="' + id + '_cont_failure">Call Failed</span>');
    cc_tip.closeButton = $('<img id="' + id + '_close_button" src="'
        + chrome.extension.getURL('img/tooltip close.png') + '">');
    cc_tip.closeButtonBackdrop = $('<div id="' + id + '_close_button_backdrop"></div>');
    cc_tip.raiseModalButton = $('<div id="' + id + '_raise_modal_button"><img src="'
        + chrome.extension.getURL('img/edit icon.png') + '"></div>');
    cc_tip.raiseModalBackdrop = $('<div id="' + id + '_raise_modal_backdrop"></div>');

    //event listeners
    cc_tip.tooltip
        .on('mouseout', cc_tip.mouseout)
        .on('mouseover', cc_tip.mouseover)
        .on('click', cc_tip.click);

    $('body').append(
        cc_tip.tooltip
            .append(cc_tip.tooltipBg)
            .append(cc_tip.tooltipBgSuccess)
            .append(cc_tip.tooltipBgFailure)
            .append(cc_tip.tooltipCont)
            .append(cc_tip.tooltipContSuccess)
            .append(cc_tip.tooltipContFailure)
            .append(cc_tip.closeButton)
            .append(cc_tip.closeButtonBackdrop)
            .append(cc_tip.raiseModalButton)
            .append(cc_tip.raiseModalBackdrop)

    )

    cc_tip.closeButtonBackdrop.on('click', function(){

        if(cc_tip.mouseedOverWrapper){

            $(cc_tip.mouseedOverWrapper).prop('disabled', true);
        }
        cc_tip.tooltip.css({display: 'none', opacity: 0});
    })


    cc_tip.raiseModalBackdrop.on('click', function(){

        raiseModal(cc_tip.raiseModalButton.attr('data-cc-number'));
        cc_tip.tooltip.css({display: 'none'});
    });
}



/**
 * Take string list of domains and return an array of domains with all asterisks removed.
 * @param str: Input string list of domains
 * @returns Array: array of domains
 */
function getDomains(str) {

    let outArr = [];
    let pageHost = window.location.hostname;
    pageHost = pageHost.replace(/www./g, "");

    let strArr = str.split(",");
    for (let i in strArr) {

        if (strArr[i].startsWith("*")) {

            if (
                pageHost.search(
                strArr[i].replace("*.", "").replace("*", "")
                ) !== -1
            ){

                outArr.push(strArr[i]);
            }
        }
    }
    return outArr;
}


/**
 * Finds all number wrappers added by wrapNode() and assigns event listens to them.
 */
function assignHandlers(){

    const long_number_length = 7;
    chrome.storage.sync.get({
        logged: false,
        shortNumberSearch: false
    }, function(items){

        if(items.logged){

            if(items.shortNumberSearch){
                $('.cc-number-wrapper').each(function(){

                    $(this).on('mouseover', targetMouseOver ).on('mouseout', targetMouseOut);
                });
            } else {
                $('.cc-number-wrapper').each(function(){

                    if($(this).attr('data-cc-number').length < long_number_length){

                        $(this).off('mouseover', targetMouseOver).off('mouseout', targetMouseOut);
                    } else {

                        $(this).on('mouseover', targetMouseOver ).on('mouseout', targetMouseOut);
                    }
                });
            }
        } else {
            $('.cc-number-wrapper').each(function(){

                $(this).off('mouseover', targetMouseOver ).off('mouseout', targetMouseOut);
            });
        }
    });
}

/**
 * Finds all number wrappers added by wrapNode() and assigns event listens to them.
 */
function unassignHandlers(){
    $('.cc-number-wrapper').each(function(){

        $(this).off('mouseover', targetMouseOver ).off('mouseout', targetMouseOut);
    });
}

/**
 * generates tooltip html elements if not already existing,
 *              sets position of tooltip elements
 */
function targetMouseOver(event){
    cc_tip.cursorIsOverWrapper = true;
    cc_tip.mouseedOverWrapper = event.target;
    if(cc_tip.successFadeout){

        resetTooltip();
    }
    if(!cc_modal.modalRaised && !$(event.target).prop('disabled')){

        cc_tip.pos(event);
        cc_tip.fade(false);
        //update tooltip to store phone number.
        cc_tip.raiseModalButton.attr('data-cc-number', this.getAttribute('data-cc-number'));
    }
}

/**
 * Hide tooltip on cursor exiting element
 */
function targetMouseOut(){

    cc_tip.cursorIsOverWrapper = false;
    if(!cc_tip.cursorIsOverTooltip
        && !$(cc_tip.mouseedOverWrapper).prop('disabled')
        && !cc_modal.modalRaised) {

        cc_tip.fade(true);
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
function domainIsFiltered(filter, domainList){

    if(!domainList){
        return false
    }
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

    let noListSelected = (filter !== 'whitelist' && filter !== 'blacklist');

    return !noListSelected && !isWhiteListed && !isBlackListed;
}

/**
 * Enables and Disables mouseover handlers based on whether or not the user is logged in.
 * @param logged
 */
function activateTooltip(logged){


    if(logged){

        assignHandlers();
    } else{

        unassignHandlers();
    }
}

/**
 * initialize Extension on Document Load.
 */
function init(){

    if(loaded){return}
    loaded = true;
    if(window.location.href.indexOf('google') > -1){

        return;
    }

    generateModal('Call', function() {

        makeCall(null, {number: cc_modal.numText.val()})
    });
    generatetooltip();
    makePhoneLinks();
    loadKeybinds();
    getOptions();


    document.addEventListener('selectionchange', function() {
        var selection = window.getSelection().toString();
        chrome.runtime.sendMessage({
            request: 'updateContextMenu',
            selection: selection
        });
    });

    chrome.runtime.onMessage.addListener(function(request) {

        if (request.type === 'options') {

            getOptions();
        } else if(request.type === 'search'){
            chrome.storage.sync.get({logged: false,}, function(items) {

                makePhoneLinks();
                loadKeybinds();
                activateTooltip(items.logged);
            });
        } else if(request.type === 'keybind') {
            loadKeybinds()
        } else if(request.type === 'callFromContextMenu'){

            if (cc_tip.displayNumberBeforeCall) {

                raiseModal(request.number);
            } else {

                    makeCall(null,  { number: request.number });
            }
        }
    });
}

/**
 * Retrieve options from menu.
 */
function getOptions(){

    chrome.storage.sync.get({
        filter: '',
        domain_list: '',
        country_code: '011',
        dialstring_length:'11',
        intl_prefix:'',
        login_name: null,
        domain:'',
        device: null,
        user: null,
        pass: null,
        areacode:'',
        logged: false,
        displayNumberBeforeCall: false,
        token: null,
        expires_in: null,
        expires_at: null,
        refreshToken: null,
    }, function(items) {

        if (domainIsFiltered(items.filter, items.domain_list[items.user])) {
            let tempExtensionInitials1, tempExtensionInitials2;
            if(extension_initials === ''){
                tempExtensionInitials1 = 'Extension';
                tempExtensionInitials2 = 'extension';
            } else {
                tempExtensionInitials1 = extension_initials;
                tempExtensionInitials2 = extension_initials;
            }
            log(tempExtensionInitials1 + ': Current Page is filtered.' + tempExtensionInitials2
                + 'will Not Run.');
            if(loaded){
                unassignHandlers();
            }
        } else if(items.logged){

            countryCode = parseInt(items.country_code);
            internationalPrefix = items.intl_prefix;
            domain = items.domain;
            user = items.user;
            pass = items.pass;
            loginName = items.login_name;
            areaCode = parseInt(items.areacode);
            device = items.device;
            cc_tip.displayNumberBeforeCall = items.displayNumberBeforeCall;

            activateTooltip(items.logged);

            $('body').on('keydown', {keyFunc: checkRaiseModalKeybind}, keyPressDown)
                .on('keyup', keyPressUp);

            log(extension_initials + ' Extension will run');
        } else {

            activateTooltip(items.logged);
        }
    });
}

/**
 * Handler for Raise Modal Keybind.
 */
function showModalbuttons(){

    cc_tip.raiseModalButton.stop().animate({opacity: 1}, 250);
    cc_tip.closeButton.stop().animate({opacity: 1}, 250);
}

/**
 * handler for hiding modal. (on click off modal or esc key press)
 */
function hideModalButtons(){
    cc_tip.raiseModalButton.stop().animate({opacity: 0}, 250);
    cc_tip.closeButton.stop().animate({opacity: 0}, 250);
}

/**
 * Restore tooltip to original state.
 */
function resetTooltip(){

    cc_tip.tooltipBg.css('opacity', '1');
    cc_tip.tooltipBgSuccess.css('opacity', '0');
    cc_tip.tooltipBgFailure.css('opacity', '0');
    cc_tip.tooltipCont.css('opacity', '1');
    cc_tip.tooltipContSuccess.css('opacity', '0');
    cc_tip.tooltipContFailure.css('opacity', '0');
    cc_tip.raiseModalButton.css('opacity', '1');
    cc_tip.raiseModalBackdrop.css('display', 'block');
    cc_tip.closeButton.css('opacity', '1');
    cc_tip.closeButtonBackdrop.css('display', 'block');
    cc_tip.successFadeout = false;
}

/**
 * Animate Tooltip for successful call.
 */
function successFlash(){

    cc_tip.raiseModalBackdrop.css('display', 'none');
    cc_tip.raiseModalButton.stop().animate({opacity: 0}, 250);
    cc_tip.closeButtonBackdrop.css('display', 'none');
    cc_tip.closeButton.stop().animate({opacity: 0}, 250);

    cc_tip.tooltipBg.stop().animate({opacity: 0}, 250);
    cc_tip.tooltipBgSuccess.stop().animate({opacity: 1}, 250);
    cc_tip.tooltipCont.stop().animate({opacity: 0}, 250);
    cc_tip.tooltipContSuccess.stop().animate({opacity: 1}, 250);
    setTimeout(function () {

        cc_tip.successFadeout = true;
        cc_tip.fade(true, null, function () {

            resetTooltip();
        });
    }, 250);
}

/**
 * Animate Tooltip for an unsuccessful call.
 */
function errorFlash(){

    cc_tip.raiseModalBackdrop.css('display', 'none');
    cc_tip.raiseModalButton.stop().animate({opacity: 0}, 1000);
    cc_tip.closeButtonBackdrop.css('display', 'none');
    cc_tip.closeButton.stop().animate({opacity: 0}, 1000);

    cc_tip.tooltipBg.stop().animate({opacity: 0}, 1000);
    cc_tip.tooltipBgFailure.stop().animate({opacity: 1}, 1000);
    cc_tip.tooltipCont.stop().animate({opacity: 0}, 1000);
    cc_tip.tooltipContFailure.stop().animate({opacity: 1}, 1000);
    setTimeout(function () {

        cc_tip.successFadeout = true;
        cc_tip.fade(true, null, function () {

            resetTooltip();
        });
    }, 1000);
}

/**
 * Crentials check for extension lisencing.
 * @returns {boolean}
 */
function licenceCheck(){

    return true;
}