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
 modal.js
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

//Event listens to be bound when a menu tab is opened
let tabListeners = {
    tab1: {
        keypress: tab1KeyPressHandler,
    },
    tab3: { keypress: tab3KeyPressHandler }
};

$(document).ready(function(){

    if(apiUrl !== '' || typeof apiUrl !== 'undefined'){
        url = managerPortal + '/ns-api/';
    } else {
        url = apiUrl + '/ns-api/';
    }

    populate();
    setEventHandlers();
    restore();
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

        $('#about_info_table').append('<div>Email: <a href="mailto:' + company_email + '?subject=' + extension_name + '" target="blank">' + company_email + '</a></div>');
    }

    if(company_website_link !== ""){
        if(company_website_display_name === "") {

            company_website_display_name = company_website_link;
        }
        $('#about_info_table').append('<div>Web: <a href="' + company_website_link + '" target="blank">'
            + company_website_display_name + '</a></div>');
    }

    if(managerPortal !== ""){
        $('#about_info_table').append('<div>Portal: <a href="' + managerPortal + '" target="blank">' + managerPortal + '</a></div>');
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
    //Empty all domain tables on "Clear Page Lists" button.
    $("#clear_listed_page_button").click(function(){
        createDomainTable();
    });
    //on add included domain button click
    $("#add_domain_list").click(addDomain);
    //on add included domain textbox enter keypress
    $("#add_domain").on('keypress', function (e) {
        if(e.which === 13){

            addDomain();
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

            updateTable(curDomain.attr("data-domain"),  true);
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
    //set filter in filter tab textbox.
    $("input[name='filter']").change(function() {
        //setFilter(this.value)
    });
    //automatically save on change of options elements
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

        let input = $('#dialpad_input');
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
    }).on('input', function(){

        this.value = this.value.replace(/[^\da-zA-Z#*]/g, '');
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
}

/**
 * Authenticates user and disables login page then allow access to extension functionality and options.
 */
function login() {

    let loginName = document.getElementById('login').value;
    let pass = document.getElementById('pass').value;
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
        //device: $('#devices').find(":selected").attr('aor'),
        dialstring_length: $('#dialstring_length').val(),
        intl_prefix: $('#intl_prefix').val(),
        filter: $('input.filter:checked').val(),
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
        domain_list: {},
        filter: 'nolist',
        domain: '',
        shortNumberSearch: false,
        displayNumberBeforeCall: false,
        forceAnswer: false,
        raiseModalKeybind: {modifiers: [], key: ''},
    }, async function(items) {

        if(items.user !== '' && items.pass !== '') {
            user = items.user;
            pass = items.pass;
            domain = items.domain;
            loginName = items.login_name;
            //device = items.device;
            autoSave = false;

            $('.login_name').html(items.login_name);
            $('#extension').html(items.user);
            $('.domain_name').html(items.domain);
            $('#dialstring_length').val(items.dialstring_length);
            $('#intl_prefix').val(items.intl_prefix);
            $('#area_code').val(items.areacode);

            /*await getDevices(await checkNSAuthToken({
                token: items.token,
                expires_in: items.expires_in,
                expires_at: items.expires_at,
                refreshToken: items.refreshToken,
            }), domain, user);*/
            $('#country_code option[country_initials="' + items.country_initials + '"]').prop('selected', true);
            $('input.filter[value=' + items.filter + ']').attr('checked', 'checked');

            $('#short_number_switch').prop('checked', items.shortNumberSearch);
            $('#display_number_before_call_switch').prop('checked', items.displayNumberBeforeCall);
            $('#force_call_switch').prop('checked', items.forceAnswer);
            forceCall = items.forceAnswer;

            let raiseModalKeybinds = items.raiseModalKeybind.modifiers.slice();
            raiseModalKeybinds[raiseModalKeybinds.length] = items.raiseModalKeybind.key;
            setRaiseModalKeybindMenuText(raiseModalKeybinds);

            createDomainTable(items.domain_list[items.user]);
            //setFilter(items.filter);

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
        //device: null,
        areacode: '',
        filter: 'none',
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
        createDomainTable();
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
 * Generate list of table elements then pass to createDomainTable.
 * @param domain: URL Domain.
 * @param excludeDomain: Do not store domain if true.
 */
function updateTable(domain, excludeDomain = false){

    let data = new Array();
    let td;

    $('#domain_list table').find('row').each(function(){


        td = $(this).find("td").eq(0);
        if(td.text()!==domain){

            data.push(td.text());
        }
    });
    if(!excludeDomain) {

        data.push(domain)
    }
    let elementString = data.join(",");
    chrome.storage.sync.get({
        domain_list: {},
        'user': ''
    }, function(items) {

        items.domain_list[items.user] = elementString;
        chrome.storage.sync.set({
            domain_list: items.domain_list
        });
        createDomainTable(elementString);
    });
}


/**
 * handler for include domain textbox
 */
function addDomain(){

    let curDomain = extractDomain($("#add_domain").val());
    if ($.trim(curDomain) !== "") {

        updateTable(curDomain);
    }
    $("#add_domain").val("");
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
function createDomainTable(data = '', filter){

    //erase current table and remake it.
    $('#' + filter + '_list').empty();
    table = $("<table />");
    if(data !== ""){

        let tokens = data.split(",");
        for(let i in tokens){
            row = $("<row />");
            $('<td>').text(tokens[i]).addClass('list_td').appendTo(row);
            $("<td>").addClass("del_td").html(
                "<img src='img/del.png' alt='Delete' class='del_domain'"  + "' data-domain='"  + tokens[i] + "' >"
            ).appendTo(row);
            row.appendTo(table);
        }
    }
    $('#domain_list').append(table);

    if(data === ''){ $('#domain_list').css('display', 'none') }
    else { $('#domain_list').css('display', 'block') }
}

/**
 * Displays tab by id and hides all other tabs.
 * @param id
 */
function setTab(id){

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
    $('#main_menu').css('display', 'none');
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

    if($('#domain_list_container').css('display') !== 'none'){

        let input = $('#add_domain');
        if(!input.is(":focus")){

            input.focus();
        }
    }
}

/**
 * Set which filter the user wants to use.
 * @param filter: enum {Whitelist, Blacklist, nolist} which filter the user wants to use.
 */

function setFilter(filter){
    if (autoSave) {

        save();
    }
    if (filter === 'nolist') {

        $('#domain_list').css('display', 'none');
        $('#domain_list_container').css('display', 'none');
    } else {

        $('#domain_list').css('display', 'block');
        $('#domain_list_container').css('display', 'block');

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

/**
 * Retrieve List of devices from PBX.
 * @param accessToken
 * @param domain
 * @param user
 * @returns {Promise<*>}
 */
async function getDevices(accessToken, domain, user){

    devices = [];
    response = await nsCall('post', null,
    {
        object: 'device',
        action: 'read',
        domain: domain,
        user: user,
    },
    {"Content-Type": 'application/x-www-form-urlencoded',
        "Authorization": "Bearer " + accessToken,},
    function(response, exception){

        log('Could not retrieve devices.');
        log(response);
        log(exception);
        return response;
    },
    function (response) {

        for(let i = 0; i < response.data.length; i++){
            devices[devices.length] = {
                aor: response.data[i].aor,
                userAgent: response.data[i].user_agent
            };
            $("<option />")
                .attr("aor", response.data[i].aor)
                .text(response.data[i].user_agent)
                .appendTo("#devices");
        }
        if(device){

            $('#devices option[aor="' + device + '"]').prop('selected', true);
            chrome.storage.sync.set({ device });
        } else {

            device = response.data[0].aor;
            chrome.storage.sync.set({ device: response.data[0].aor });
        }
    });
    return response;
}


