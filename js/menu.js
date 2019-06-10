/**
 * File Dependencies:
 jquery-3.3.1.min.js
 bootstrap.min.js
 axios.min.js
 menuTables.js
 config.js
 stub.js
 search.js
 api.js
 popup.js
 keybind.js
 */

/**
 * Globals
 */
let autoSave = true;
let optionsSaveAlertStart, optionsSaveAlertEnd;
let tipHover;
let saveWaiting;
let backspaceInterval;
let voicemail_extension = '5001';


//Event listens to be bound when a menu tab is opened
let tabListeners = {
    tab1: {
        keypress: tab1KeyPressHandler,
    },
    tab3: { keypress: tab3KeyPressHandler }
};

$(document).ready(function(){

    init();
});

/**
 * Populate Extension Data from config.js.
 */
function populate(){

    if(extension_name !== ""){

        $('.extension_title').html(extension_name);
        $('#titlebar_title').html(extension_name);
        $('#_how_to_use_text').html('How to use ' + extension_name);
    }else {

        $('#_how_to_use_text').html('How to use ');
    }

    if(company_phonenumber !== ""){

        $('#about_info_table').append('<div>Phone: ' + company_phonenumber + '</div>');
    }

    if(company_email !== ""){

        $('#about_info_table').append('<div>Email: <a href="mailto:' + company_email + '?subject=' + extension_name
            + '" target="blank">' + company_email + '</a></div>');
    }

    if(company_website_link !== ""){
        if(company_website_display_name === "") {

            company_website_display_name = company_website_link;
        }
        $('#about_info_table').append('<div>Web: <a href="' + company_website_link + '" target="blank">'
            + company_website_display_name + '</a></div>');
    }

    if(managerPortal !== ""){
        $('#about_info_table').append('<div>Portal: <a href="' + managerPortal + '" target="blank">' + managerPortal
            + '</a></div>');
    }

    if(company_additional_website_link !== ""){
        if(company_additional_website_display_name === "") {

            company_additional_website_display_name = company_additional_website_link;
        }
        $('#about_info_table').append('<div><a href="' + company_additional_website_link + '" target="blank">'
            + company_additional_website_display_name + '</a></div>');
    }

    for(i in allCountries) {

        $("<option />")
            .attr("country_initials", allCountries[i][1])
            .attr("value", allCountries[i][2])
            .text(allCountries[i][0] + " " + allCountries[i][2])
            .appendTo("#country_code");
    }
}

/**
 * initialize event triggers.
 */
function setEventHandlers(){

    //change tab via hamburger menu,
    $('.tab').click(function(){
        setTab(this.id);
    });
    //change tab on anchor linking to tabs
    $('.jump_to_tab').on('click', function(){

        setTab($(this).attr('tab'));
    });

    //store all entries in chrome storage on "Save" button.
    $("#save_button").click(save);

    //on add included domain button click
    $("#add_domain_list").on('click', function(){
        addFilter('domain');
    });
    //on add included domain textbox enter keypress
    $("#add_domain").on('keypress', function (e) {
        if(e.which === 13){

            addFilter('domain');
        }
    });

    //on add included domain button click
    $("#add_number_list").on('click', function(){
        addFilter('number');
    });
    //on add included domain textbox enter keypress
    $("#add_number").on('keypress', function (e) {
        if(e.which === 13){

            addFilter('number');
        }
    });
    //login/out user
    $("#logout_tab").click(logout);
    $("#login_button").click(function() {

        login();
    });
    //press enter on password textbox to enter login credentials.
    $("#pass").on('keypress', function (e) {
        if (e.which === 13) {

            login();
        }
    });
    //press enter on username textbox to enter login credentials.
    $("#login").on('keypress', function (e) {
        if (e.which === 13) {

            login();
        }
    });

    //deletes current domain on click from domain table.
    $(document).on('click', '.del_domain', function() {
        let curDomain = $(this);
        if(confirm("Are you sure you want to delete the domain " + curDomain.attr("data-domain") + " from the list?")){

            updateFilter(curDomain.attr("data-domain"), curDomain.attr("filter"),  true, createFilterTable);
        }
    });

    //toggles qtip element text on hover and
    $(".qtip").hover(function(){
        tipHover = true;
        menuTip(tips[this.id], '#' + this.id);
    },tooltipEnd);

    //Expand and collapse help tab entries.
    $(".toggle").on("click", function(){

        let toggler = $('#' + this.id);
        let togglerContent = $('#' + this.id + '_info');
        let togglerImg = $('#' + this.id + '_toggler');
        if(toggler.hasClass('expanded')){

            toggler.removeClass('expanded').html();
            togglerImg.removeClass('rotated');
            togglerContent.slideUp();
        } else {

            togglerImg.addClass('rotated');
            toggler.addClass('expanded').html();
            togglerContent.slideDown();
        }
    });
    //Show hamburger menu on click.
    $('#menu_backdrop').click(function(){
        let menu = $('#main_menu');

        if(menu.css('display') === 'none'){

            menu.css('display', 'block');
        } else {

            menu.css('display', 'none');
        }
    });
    //close hamburger menu on clicking outside hamburger menu.
    $('html').click(function(event) {
        if ($(event.target).closest('#menu_backdrop, #main_menu').length === 0) {
            $('#main_menu').hide();
        }
    });

    $('.triggersSave').change(save).on('input', function(){

        if(autoSave){

            optionsSave();
        }
    });

    //automatically save without alert on change of options elements
    $('.triggersQuietSave').change(save).on('input', function(){

        if(autoSave){

            optionsSave(false);
        }
    });
    //backspace button on dialpad.
    $('#dialpad_backspace').on('mousedown', function(){

        backspace();
        backspaceInterval = setTimeout(function(){

            backspace();
            clearInterval(backspaceInterval);
            backspaceInterval = setInterval(function(){

                backspace()
            }, 250);

        }, 500);
    }).on('mouseup', function(){
        clearInterval(backspaceInterval);
    });
    //Voicemail button on dialpad.
    $('#dialpad_voicemail').on('click', function(){

        $('#dialpad_input').val('');


        makeCall(null, {
            number: voicemail_extension,
            func: function () {

                menuTip('Call placed to voicemail', null, 'center', 500);
            },
        });
        setTimeout(function(){

            $('#options_tool_tip').fadeOut();
        }, 2500);

    });
    //On enter keypress for dialpad to make call.
    $('#dialpad_input').on('keypress', function (event) {

        let input = $(this);
        if (event.which === 13) {

            if (input.val().length > 0) {
                let number = alphabetToDialNumber(input.val());
                makeCall(null, {
                    number: number,
                    func: function(){

                        menuTip('Call placed to: ' + number, null, 'center', 500);
                    },
                });
                input.val('').blur();
                setTimeout(function(){

                    $('#options_tool_tip').fadeOut();
                }, 2500);
            }
            setTimeout(function() {
                $('#dialpad_input').blur();
            },0);
        }
    //resize dialpad font if text is overflown.
    }).on('input', function(){

        let input = $(this);
        input.css('font-size', '30px');
        let fontSize;
        while(isOverflown(input[0])){

            fontSize = parseInt(input.css('font-size').replace('px', '')) - 1;
            input.css('font-size', fontSize + 'px');
        }
    });
    //Search Short Number Option in options.
    $('#short_number_switch').on('change', function(){

        chrome.storage.sync.set({
            shortNumberSearch: this.checked,
        }, function(){

            updateContent('search');
        });
    });
    //Option to bring up modal on call clicks.
    $('#display_number_before_call_switch').on('change', function(){

        chrome.storage.sync.set({
            displayNumberBeforeCall: this.checked,
        }, function(){

            updateContent('options');
        });
    });
    //Set modal keybind.
    $('#dial_number_display').on('click', resetModalKeybind);
    //Change which filtered is displayed in the filter tab.
    $('#filter_select').on('change', function(){

        chrome.storage.sync.get({
            filter: {
                shown: 'domain_filter',
                number: 'nofilter',
                domain: 'nofilter',
            }
        }, function(items) {

            items.shown = $('#filter_select').find(":selected").attr('filter');
            chrome.storage.sync.set(items);
        });
        setFilter();
    });
    //Set default behavior for when a user presses the close button on the tooltip. (set from options tab)
    $('#tooltip_close_button_select').change(function(){

        chrome.storage.sync.set({ closeButtonDefault: $('#tooltip_close_button_select').find(":selected").attr('value')});
    });
    //
    $('input.domain_filter[name=domain_filter]').change(function(){

        updateContent('search');
    });
    $('input.number_filter[name=number_filter]').change(function(){

        updateContent('search');
    });

    $('#devices').on('change', function(){

        let selectedDevice = $('#devices').find(":selected").attr('aor');
        device = selectedDevice;
        chrome.storage.sync.set({ device: selectedDevice});
    });

    $('.power_button_checkbox').on('change', function(){

        let box = $(this);
        if( box.is(':checked') ){

            chrome.storage.sync.set({enabled: false}, function(){

                updateContent('search');
            })
             } else {
            chrome.storage.sync.set({enabled: true}, function(){

                updateContent('search');
            })

        }
    });

}

/**
 * Authenticates user and disables login page then allow access to extension functionality and options.
 */
function login() {

    let loginName = $('#login').val();
    let pass = $('#pass').val();
    //Get oAuth Token Step 1.
    $.ajax({
        url: url + 'oauth2/token/',
        type: 'post',
        data: {
            'grant_type': 'password',
            'client_id': clientID,
            'client_secret': clientSecret,
            'username': loginName,
            'password': pass,
        },
        headers: {"Content-Type": 'application/x-www-form-urlencoded'},
        contentType: 'application/x-www-form-urlencoded',
        success: function (data) {

            log('Login Successful');
            //oAuth Step 2
            $.ajax({
                url: url,
                type: 'post',
                data: {
                    'action': 'read',
                    'object': 'subscriber',
                    'login': loginName,
                },
                headers: {
                    'Authorization': 'Bearer ' + data.access_token
                },
                success: function (data) {

                    log('login()')
                    log(data);
                    chrome.storage.sync.set({
                        login_name: loginName,
                        pass: pass,
                        user: $(data).find("user").text(),
                        domain: $(data).find("domain").text(),
                        areacode: $(data).find("area_code").text(),
                        logged: true,
                    }, function () {

                        restore();
                        setDisplayMode();
                        updateContent('options');
                    });
                },
                error: function (xhr) {

                    chrome.storage.sync.set({
                        logged: false
                    });
                    if (xhr.status === 400 || xhr.status === 403) {

                        alert("Invalid Credentials");
                    }
                },
            });
        },
        error: function (xhr, exception) {

            if (xhr.status === 400 || xhr.status === 403) {

                log(xhr);
                log(exception);
                invalidLogin();
                return "Invalid Credentials";
            }
        },
    });

}

/**
 * Query and store user data to chrome.storage
 */
function save() {

    chrome.storage.sync.set({
        country_initials: $('#country_code').find(":selected").attr('country_initials'),
        country_code: $('#country_code').val(),
        device: $('#devices').find(":selected").attr('aor'),
        dialstring_length: $('#dialstring_length').val(),
        intl_prefix: $('#intl_prefix').val(),
        filter: {
            shown: $('#filter_select').find(":selected").attr('filter'),
            domain: $('input.domain_filter:checked').val(),
            number: $('input.number_filter:checked').val(),
        },
    });
}

/**
 * Restores all menu options.
 */
function restore() {

    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        user: '',
        pass: '',
        login_name: '',
        country_initials: 'us',
        country_code: '1',
        device: null,
        dialstring_length: '11',
        intl_prefix: '011',
        areacode: '',
        domain: '',
        domain_list: {},
        number_list: {},
        filter: {
            shown: 'domain_filter',
            number: 'nofilter',
            domain: 'nofilter',
        },
        closeButtonDefault: 'none',
        shortNumberSearch: false,
        displayNumberBeforeCall: false,
        forceAnswer: false,
        raiseModalKeybind: {modifiers: [], key: ''},
        token: null,
        expires_in: null,
        expires_at: null,
        refreshToken: null,
        callHistory: [],
        enabled: true,
    }, async function(items) {

        if(items.user !== '' && items.user !== null && items.pass !== '' && items.pass !== null) {

            user = items.user;
            pass = items.pass;
            domain = items.domain;
            loginName = items.login_name;
            device = items.device;

            autoSave = false;
            $('.login_name').html(items.login_name);
            $('#extension').html(items.user);
            $('.domain_name').html(items.domain);
            $('#dialstring_length').val(items.dialstring_length);
            $('#intl_prefix').val(items.intl_prefix);
            $('#area_code').val(items.areacode);

            $('#country_code option[country_initials="' + items.country_initials + '"]').prop('selected', true);
            $('#filter_select option[filter="' + items.filter.shown + '"]').prop('selected', true);
            $('#tooltip_close_button_select option[value="' + items.closeButtonDefault + '"]').prop('selected', true);
            $('input.domain_filter[value=' + items.filter.domain + ']').attr('checked', 'checked');
            $('input.number_filter[value=' + items.filter.number + ']').attr('checked', 'checked');
            $('.power_button_checkbox').prop('checked', !items.enabled);

            $('#short_number_switch').prop('checked', items.shortNumberSearch);
            $('#display_number_before_call_switch').prop('checked', items.displayNumberBeforeCall);

            let raiseModalKeybinds = items.raiseModalKeybind.modifiers.slice();
            raiseModalKeybinds[raiseModalKeybinds.length] = items.raiseModalKeybind.key;
            setRaiseModalKeybindMenuText(raiseModalKeybinds);

            //Create DOM elements for filter tables in filter tabs.
            createFilterTable(items.domain_list[items.user], 'domain');
            createFilterTable(items.number_list[items.user], 'number');

            //Promises for calls requiring oAuth Token.
            new Promise(function(resolve){

                checkNSAuthToken({
                    token: items.token,
                    expires_in: items.expires_in,
                    expires_at: items.expires_at,
                    refreshToken: items.refreshToken,
                    promise: resolve,
                });
            }).then(function(token){

                //Populate Devices
                promiseDevice(token);
                //Populate CallHistory
                promiseCallHistory(token);
            });
            setFilter();
            setTab('tab1');
            save();
            autoSave = true;
        }
        setDisplayMode();
    });

}

/**
 * clears stored data and removes user authentication.
 */
function logout(){

    chrome.storage.sync.set({
        user: null,
        pass: null,
        login_name: null,
        dialstring_length: '11',
        intl_prefix: '011',
        country_initials:'',
        country_code: '',
        device: null,
        areacode: '',
        filter: 'none',
        domain_list: {},
        number_list: {},
        logged: false,
        active_tab: 'tab1',
        token: null,
        expires_in: null,
        expires_at: null,
        refreshToken: null,
        shortNumberSearch: false,
        displayNumberBeforeCall: false,
        forceAnswer: false,
        raiseModalKeybind: {modifiers: [], key: ''},
    }, function() {
        createFilterTable('', 'domain');
        createFilterTable('', 'number');
        $('.login_name').html('');
        $('#loginName').val('');
        $('#pass').val('');
        $('#domain').val('');
        $('#dialstring_length').val('11');
        $('#intl_prefix').val('011');
        $('#area_code').val('');
        $("#none_radio").prop("checked", true);
        $('#main_menu').hide();
        $('#dial_number_display').html('');
        updateContent('options');
        forceCall = false;
    });
    setDisplayMode();
}

/**
 * Hides Login divs and shows option divs if user is not logged in.
 * and vise versa
 */
function setDisplayMode(){
    chrome.storage.sync.get({
        logged: false
    }, function(items){

        if(items.logged === true){

            $('#login_container').css('display', 'none');
            $("#content").css('display', 'block');
        } else {

            $('#login_container').css('display', 'block');
            $("#content").css('display', 'none');
        }
    });
}

/**
 * On invalid login credentials show alert and set logged in status to false.
 */
function invalidLogin(){

    alert("Invalid Credentials");
    log("Login Attempt Unsuccessful");

    chrome.storage.sync.set({
        logged: false
    });
    logout();
}


/**
 * handler for include domain textbox
 */
function addFilter(filter){

    let input = $('#add_' + filter);
    let curDomain = extractDomain(input.val());
    if ($.trim(curDomain) !== '') {

        updateFilter(curDomain, filter, null, createFilterTable);
    }

    input.val('');
}


/**
 * Parse domain from URL string.
 * @param url: url to be parsed
 * @returns string of parsed domain. https://example.com => example.com
 */
function extractDomain(url) {

    let domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {

        domain = url.split('/')[2];
    }
    else {

        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

/**
 * Generates HTML table and appending it to element with list argument as its ID.
 * If table already exists it is cleared first.
 * Table Columns are populated from parsed string (data)
 * @param data: string to parse data elements from.
 */
function createFilterTable(data = '', filter){

    let table, row;
    let listElement = $('#' + filter + '_list');
    listElement.empty();
    table = $("<table />");
    if(data !== ""){

        let tokens = data.split(",");
        for(let i in tokens){
            row = $("<row />");
            $('<td class="list_td">' + tokens[i] + '</td>').appendTo(row);
            $('<td class = del_td>' +
                '<img src="../img/del.png" alt="Delete" class="del_domain" data-domain="'  + tokens[i] + '" filter="'
                + filter + '">'
            ).appendTo(row);
            row.appendTo(table);
        }

    }
    listElement.append(table);
}

/**
 * Displays tab by id and hides all other tabs.
 * @param id
 */
function setTab(id){

    let tabHeight = 30;
    let tabHeightOffset = 3;

    for (let tab in tabListeners) {

        for(let listener in tabListeners[tab]){

            $('html').off(listener, tabListeners[tab][listener])
        }
    }
    let tabs = $('.tab');
    for(let i = 0; i < tabs.length; i++){
        if(tabs[i].id === id){

            $('#' + tabs[i].id).addClass('active_tab');
            $('#' + tabs[i].id + '_content').css('display', 'block');

            for (let tab in tabListeners) {

                if(id === tab){
                    for(let listener in tabListeners[tab]){

                        $('html').on(listener, tabListeners[tab][listener])
                    }
                }
            }
        } else {

            $('#' + tabs[i].id).removeClass('active_tab');
            $('#' + tabs[i].id + '_content').css('display', 'none');
        }
    }
    $('#main_menu').css({display: 'none', height: (tabs.length * tabHeight) + tabHeightOffset + 'px'});
}

/**
 * Pressing any key on the dialpad page will automatically enter the key press into dialpad even if it not focused
 */
function tab1KeyPressHandler(){

    let input = $('#dialpad_header input');
    if(!input.is(":focus")){

        input.focus();
    }

}

/**
 * Pressing any key on the filer page will automatically enter the key press into filter textbox even if it not focused
 */
function tab3KeyPressHandler(){

    let filter = $('#filter_select').find(":selected").attr('filter');
    if(filter === 'domain_filter' && $('#domain_list_options').css('display') !== 'none'){

        let input = $('#add_domain');
        if(!input.is(":focus")){

            input.focus();
        }
    } else if(filter === 'number_filter' && $('#number_list_options').css('display') !== 'none'){

        let input = $('#add_number');
        if(!input.is(":focus")){

            input.focus();
        }
    }
}

/**
 * Save option and display tooltip in menu. If the alert is currently in use the save tooltip will wait for alert to be
 * unused.
 * @param announce message to be announced via tooltip alert.
 */
function optionsSave(announce = true){

    save();
    if(announce){

        if(tipHover){
            saveWaiting = true;
            return;
        }
        let tooltip = $('#options_tool_tip');
        optionsSaveAlertStart = setTimeout(function(){

            $('#options_tool_tip_card').html("<h3>" + 'Saved.' + "</h3>");
            tooltip.css( {'top': 'unset', 'bottom': '0'}).fadeIn();
        }, 1000);
        optionsSaveAlertEnd = setTimeout(function(){

            tooltip.fadeOut();
        }, 2500);
    }
    updateContent('options');
}

/**
 * Signals tooltip is no longeri n use and allows save alert to broadcast via tooltip.
 */
function tooltipEnd() {

    tipHover = false;
    let tooltipText = $('#options_tool_tip_card h3');
    let tooltip = $('#options_tool_tip');
    if(saveWaiting){
        saveWaiting = false;
        tooltipText.fadeOut();
        setTimeout(function() {

            tooltipText.html('Saved.').fadeIn();
            tooltip.css( {'top': 'unset', 'bottom': '0', 'display': 'block'});
        }, 250);


        clearInterval(optionsSaveAlertEnd);
        optionsSaveAlertEnd = setTimeout(function(){

            tooltip.fadeOut();
        }, 2500);
    } else {
        $("#options_tool_tip").fadeOut();
    }
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

/**
 * Display message via tooltip. Position tooltip at top of menu instead of bottom if mouseover element which triggered
 * the tooltip is too close to the top.
 * @param msg: text to be displayed.
 * @param relativeTo: Location of mouseover element which triggers tooltip.
 * @param align: Text alignment of tooltip message.
 * @param weight: Font weight of tooltip text.
 */
function menuTip(msg, relativeTo = '', align = null, weight = null){
    const distance_From_Top_Threshold = 230;
    let tooltip = $('#options_tool_tip');
    if(relativeTo &&relativeTo !== '' && $(relativeTo).position()['top'] > distance_From_Top_Threshold){

        tooltip.css( {'top': '0', 'bottom': 'unset' });
    } else {

        tooltip.css( {'top': 'unset', 'bottom': '0' });
    }

    $('#options_tool_tip_card').html("<h3>" + msg + "</h3>");

    let tooltipText = $('#options_tool_tip_card h3');
    if(align){

        tooltipText.css('text-align', align);
    } else {

        tooltipText.css('text-align', 'left');
    }

    if(weight){

        tooltipText.css('font-weight', weight);
    } else {

        tooltipText.css('font-weight', 'unset');
    }
    tooltip.fadeIn();
}

/**
 * Backspace function for dialpad.
 */
function backspace(){
    let input = $('#dialpad_input');
    input.val(input.val().slice(0, -1));
}

/**
 * Converts a letter string to it's dialpad number equivalent.
 * @param input: string to be converted to only numbers.
 * @returns converted string.
 */
function alphabetToDialNumber(input){
    let char;
    for (let i = 0; i < input.length; i++){
        char = input.charAt(i);
        if(/([A-Za-z+])/g.test(char)){
            input = input.replace(char, dialpadTranslations[char]);

        }
    }
    return input;
}

/**
 * Sets keybind.
 */
function clickDuringSetModalKeybind(){
    chrome.storage.sync.get({
        raiseModalKeybind: {
            key: '',
            modifiers: [],
        }
    }, function(items){

        if(items.raiseModalKeybind.key === '') {

            removeInputHandler('ModalKeybind');
            setInputHandler('ModalKeybind', checkRaiseModalKeybind);
            $('#dial_number_display').css('outline', 'none').html('');
            modalKeybindKey = '';
            modalKeybindModifiers = [];
            updateContent('keybind');
        }
        $('#dial_number_display').on('click', resetModalKeybind);
        $('html').off('click', clickDuringSetModalKeybind);
    });
}

/**
 * clear modal keybind and prepare to set again or leave unset.
 */
function resetModalKeybind(){

    chrome.storage.sync.set({
        raiseModalKeybind: {
            key: '',
            modifiers: []
        }
    }, function(){

        $('#dial_number_display')
            .css('outline', '1px solid red')
            .off('click', resetModalKeybind);
        removeInputHandler('ModalKeybind');
        setInputHandler('ModalKeybind', setRaiseModalKeybind);
        $('html').on('click', clickDuringSetModalKeybind);
    });
}

function setFilter(){

    let filter = $('#filter_select').find(":selected").attr('filter');
    if(filter === 'domain_filter'){

        $('#domain_list_options').css('display', 'block');
        $('#number_list_options').css('display', 'none');

    } else if (filter === 'number_filter'){

        $('#number_list_options').css('display', 'block');
        $('#domain_list_options').css('display', 'none');
    }
    tab3KeyPressHandler();
}

function setDeviceOptions(devices){

    for(let i = 0; i < devices.length; i++){

        $("<option />")
            .attr("aor", devices[i].aor)
            .text(devices[i].model)
            .appendTo("#devices");
    }
    if(device){

        $('#devices option[aor="' + device + '"]').prop('selected', true);
    } else {

        device = $("#devices").prop("selectedIndex", 0).attr('aor');
        chrome.storage.sync.set({ device });
    }
}

function init(){

    if(apiUrl !== '' || typeof apiUrl !== 'undefined'){
        url = managerPortal + '/ns-api/';
    } else {
        url = apiUrl + '/ns-api/';
    }

    populate();
    setEventHandlers();
    restore();

    chrome.runtime.onMessage.addListener(function(request) {

        if (request.type === 'filter') {
            chrome.storage.sync.get({
                user: '',
                domain_list: {},
                number_list: {},
            }, function(items){

                createFilterTable(items.domain_list[items.user], 'domain');
                createFilterTable(items.number_list[items.user], 'number');
            });
        }
    });
}

function populateCallHistory(calls){
    let tableBody = $('#call_history_table_body');
    tableBody.empty();
    let call;
    for(let i = 0; i < calls.length; i++) {
        call = calls[i];
        tableBody.append(generateCallHistoryRow(call.number, call.type, call.name, call.start, call.domain));
    }
    $('#call_history_table_body tr').off().on('click', callHistoryClick);
}

function getTimeStr(curDate){

    let newDate;
    let thisDate = new Date();
    let thisDay = thisDate.getDate();
    let curDateDay = curDate.getDate();
    let thisMonth = thisDate.getMonth() + 1;
    let curDateMonth = curDate.getMonth() + 1;
    if(thisDay === curDateDay && thisMonth === curDateMonth){

        newDate = 'Today';
    } else if(thisDay === curDateDay + 1 && thisMonth === curDateMonth){

        newDate = 'Yesterday';
    } else {

        newDate = curDate.getFullYear()
            + '/' + (curDateMonth < 10 ? '0' + curDateMonth : curDateMonth)
            + '/' + (curDateDay < 10 ? '0' + curDateDay : curDateDay);
    }



    let hour = curDate.getHours();
    let meridiem = 'am';
    if(hour === 0){

        hour = 12;
    } else if(hour === 12){

        meridiem = 'pm';
    } else if(hour > 12){

        hour = hour - 12;
        meridiem = 'pm';
    }
    let minutes = curDate.getMinutes();
    let time = hour + ':' + (minutes < 10 ? '0' + minutes: minutes) + meridiem;
    return {date: newDate, time}
}


//Populate CallHistory
function promiseCallHistory(token){

    new Promise(function(resolve){

        getCallHistory(token, domain, user, resolve);
    }).then(function(calls){

        populateCallHistory(calls);
    });
}
//Populate Devices
function promiseDevice(token){

    new Promise(function(resolve, reject){

        getDevices(token, domain, user, resolve);
    }).then(function(newDeviceList){
        devices = newDeviceList;
        setDeviceOptions(newDeviceList);
    });
}

function generateCallHistoryRow(callNumber, callType, callName, callStart, callDomain) {
    console.log('GCHR');
    console.log(callNumber);
    console.log(callType);
    console.log(callName);
    console.log(typeof callName);
    console.log(callStart);
    console.log(callDomain);
    let displayNumber, iconSrc;
    callNumber = (callNumber === 'null' || callNumber === 'undefined') ? '' : callNumber;
    callType = (callType === 'null' || callType === 'undefined' || !callType) ? '' : parseInt(callType);
    callName = (callName === 'null' || callName === 'undefined') ? '' : callName;
    callStart = (callStart === 'null' || callStart === 'undefined') ? '' : callStart;
    callStart = (typeof callStart == 'string') ? parseInt(callStart) : callStart;
    curDate = getTimeStr(new Date(callStart));
    callDomain = (callDomain === 'null' || callDomain === 'undefined') ? '' : callDomain;

    switch(callType){
        case 0:
            iconSrc = '../img/call incoming.png';
            displayNumber = callNumber.replace('sip:', '').replace(/['"]/g, '').split('@')[0];
            callNumber = cleanNumber(callNumber.replace('sip:', '').split('@')[0]);
            break;
        case 1:
            iconSrc = '../img/call outgoing.png';
            displayNumber = callNumber;
            callNumber = cleanNumber(callNumber) + '@' + callDomain;
            break;
        case 2:
            iconSrc = '../img/call incoming missed.png';
            displayNumber = callNumber.replace('sip:', '').replace(/['"]/g, '').split('@')[0];
            callNumber = cleanNumber(callNumber.replace('sip:', '').split('@')[0]);
            break;
        case 3:
            iconSrc = '../img/call outgoing.png';
            displayNumber = callNumber.replace('sip:', '').replace(/['"]/g, '').split('@')[0];
            callNumber = cleanNumber(callNumber.replace('sip:', '').split('@')[0]);
            break;
        case 4:
            iconSrc = '../img/call outgoing.png';
            displayNumber = callNumber;
            callNumber = cleanNumber(callNumber) + '@' + callDomain;
            break;
        case 5:
            iconSrc = '../img/call outgoing.png';
            displayNumber = callNumber.replace('sip:', '').replace(/['"]/g, '').split('@')[0];
            callNumber = cleanNumber(callNumber.replace('sip:', '').split('@')[0]);
            break;
    }
    callType = callType % 3;

    if(callName){

        numberClass = 'tab2_history_number_with_sub'
    } else {

        numberClass = 'tab2_history_number'
    }
    let row = $(
        '<tr number="' + callNumber + '" ' +
        'type="' +  + callType + '" ' +
        'name="' + callName + '" ' +
        'start="' + callStart + '">' +
        'domain="' + callDomain + '">' +
            '<td class="tab2_history_phone_icon_td">' +
                '<img src="' + iconSrc + '">' +
            '</td>' +
            '<td >' +
                '<div class="' + numberClass + '">' + displayNumber + '</div>' +
                '<div class="tab2_history_number_sub">' + (callName ? callName : '') + '</div>' +
            '</td>' +
            '<td>' +
                '<div class="tab2_history_date">' + curDate.date + '</div>' +
            '</td>' +
            '<td>' +
                '<div class="tab2_history_time">' + curDate.time + '</div>' +
            '</td>' +
        '</tr>'
    );
    row.on('click', callHistoryClick);
    return row;
}

function callHistoryClick(){
    let args = {
        destination: $(this).attr('number'),
        type: '' + (parseInt($(this).attr('type')) + 3),
        name: $(this).attr('name'),
        start: $(this).attr('start'),
        domain: $(this).attr('domain'),
    };

    args.func = function(args) {
        $('#call_history_table_body tr:last').remove();
        $('#call_history_table_body')
            .prepend(generateCallHistoryRow(
                args.destination,
                args.type,
                args.name,
                args.start,
                args.domain,
            ));
        menuTip('Call placed to ' + args.destination, null, 'center', 500);
        setTimeout(function(){

            $('#options_tool_tip').fadeOut();
        }, 2500);
    };
    makeCall(null, args);
}