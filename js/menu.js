/**
 * Globals
 */
const options_pages = 2;
let autoSave = true;

if(apiUrl == '' || typeof apiUrl !== 'undefined'){
    url = managerPortal + '/ns-api/';
} else {
    url = apiUrl + '/ns-api/';
}


/**
 * Enables Console logging.
 * For ease of access, please keep this as the first function in this class.
 */
function log(input){
    //console.log(input);
}

$(document).ready(function(){

    populate();
    chrome.storage.sync.get({'options_page': 1}, function(items){
        setOptionsPage(items.options_page)
    });
    setEventHandlers();
    for(i in allCountries) {

        $("<option />")
            .attr("country_initials", allCountries[i][1])
            .attr("value", allCountries[i][2])
            .text(allCountries[i][0] + " " + allCountries[i][2])
            .appendTo("#country_code");
    }
    restoreOptions()
});


/**
 * Populate Extension Data from config.js.
 */
function populate(){

    if(extension_name != ""){

        $('.extension_title').html(extension_name);
        $('#titlebar_title').html(extension_name);
        $('#_how_to_use_text').html('How to use ' + extension_name);
    }else {

        $('#_how_to_use_text').html('How to use ');
    }

    if(company_phonenumber != ""){

        $('#about_info_table').append('<div>Phone: ' + company_phonenumber + '</div>');
    }

    if(company_email != ""){

        $('#about_info_table').append('<div>Email: <a href="mailto:' + company_email + '?subject=' + extension_name + '" target="blank">' + company_email + '</a></div>');
    }

    if(company_website_link != ""){
        if(company_website_display_name === "") {

            company_website_display_name = company_website_link;
        }
        $('#about_info_table').append('<div>Web: <a href="' + company_website_link + '" target="blank">'
            + company_website_display_name + '</a></div>');
    }

    if(managerPortal != ""){
        $('#about_info_table').append('<div>Portal: <a href="' + managerPortal + '" target="blank">' + managerPortal + '</a></div>');
    }

    if(company_additional_website_link != ""){
        if(company_additional_website_display_name === "") {

            company_additional_website_display_name = company_additional_website_link;
        }
        $('#about_info_table').append('<div><a href="' + company_additional_website_link + '" target="blank">'
            + company_additional_website_display_name + '</a></div>');
    }


    $('#about_info_table div').hover( function(){
        this.style.backgroundColor = 'lightgray';
    }, function(){
        this.style.backgroundColor = 'white';
    });

}

/**
 * Sets which options page should be visible.
 * @param page
 */
function setOptionsPage(page){
    for(let i = 1; i <= options_pages; i++){
        if(i === page){

            $('#tab2_content_main .page' + i).css('display', 'inline-block');
        } else {

            $('#tab2_content_main .page' + i).css('display', 'none');
        }
    }
    chrome.storage.sync.set({'options_page': page});
}

/**
 * initialize event triggers.
 */
function setEventHandlers(){
    $('.tab').click(function(){
        setTab(this.id);
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
    $("#pass").on('keypress', function (e) {
        if (e.which === 13) {

            login();
        }
    });
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

        let tooltip = $('#options_tool_tip');
        if($('#' + this.id).position()['top'] > 230){

            tooltip.css( {'top': '0', 'bottom': 'unset' });
        } else {

            tooltip.css( {'top': 'unset', 'bottom': '0' });
        }

        $('#options_tool_tip_card').html("<h3>" + tips[this.id] + "</h3>");
        tooltip.css('display', 'block');
    },function(){

        $("#options_tool_tip").css({display: 'none'});
    });


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


    $("#tab2_content_pager .previous").click(function() {

        chrome.storage.sync.get({'options_page': 1}, function(items){

            if(items.options_page > 1) {

                setOptionsPage(items.options_page - 1)
            }
        });
    });

    $("#tab2_content_pager .next").click(function() {

        chrome.storage.sync.get({'options_page': 1}, function(items){

            if(items.options_page < options_pages) {

                setOptionsPage(items.options_page + 1)
            }
        });
    });

    $('#menu_backdrop').click(function(){
        let menu = $('#main_menu');

        if(menu.css('display') === 'none'){

            menu.css('display', 'block');
        } else {

            menu.css('display', 'none');
        }
    });

    $('html').click(function(event) {
        if ($(event.target).closest('#menu_backdrop, #main_menu').length === 0) {
            $('#main_menu').hide();
        }
    });

    $("input[name='filter']").change(function() {
        setFilter(this.value)
    });

    $('.triggersSave').change(save).on('input', function(){

        if(autoSave){

            save();
        }
    });

    $('.dialpad_row div').mousedown(function(){
    }).mouseup(function(){
        let display = $('#dialpad_display');
        display.val(display.val() + this.getAttribute('input'));
    });

}

/**
 * Authenticates user and disables login page.
 */
function login(){

    let login = document.getElementById('login').value;
    let pass = document.getElementById('pass').value;

    //Get oAuth Token Step 1.
    $.ajax({
        url: url + 'oauth2/token/',
        type: 'post',
        data: {'grant_type': 'password',
            'client_id' : clientID,
            'client_secret': clientSecret,
            'username': login,
            'password': pass,},
        headers: { "Content-Type":'application/x-www-form-urlencoded' },
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
                    'login': login,
                },
                headers: {
                    'Authorization': 'Bearer ' + data.access_token
                },
                success: function (data) {
                    log(data);

                    chrome.storage.sync.set({
                        login_name: login,
                        pass: pass,
                        user: $(data).find("user").text(),
                        domain: $(data).find("domain").text(),
                        areacode: $(data).find("area_code").text(),
                        logged: 'true',
                    }, function() {

                        log('Save Successful');
                        status.textContent = '';
                        restoreOptions();
                        setDisplayMode();
                        save();
                    });
                },
                error: function(xhr, exception){

                    chrome.storage.sync.set({
                        logged: 'false'
                    });
                    if(xhr.status === 400 || xhr.status === 403){

                        alert("Invalid Credentials");
                        $("#result").html("Invalid Credentials");
                    }
                },
            });
        },
        error: function(xhr, exception){

            if(xhr.status === 400 || xhr.status === 403){

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
        dialstring_length: $('#dialstring_length').val(),
        intl_prefix: $('#intl_prefix').val(),
        filter: $('input.filter:checked').val(),
    });
}

/**
 * Restores select box and checkbox state using the preferences
 * stored in chrome.storage.
 */
function restoreOptions() {

    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        user: '',
        pass: '',
        login_name: '',
        country_initials: 'us',
        country_code: '1',
        dialstring_length: '11',
        intl_prefix: '011',
        areacode:'',
        domain_list:'',
        filter: 'nolist',
        domain: '',
        //active_tab: 'tab5',
    }, function(items) {

        log(items);
        autoSave = false;
        $('.login_name').html(items.login_name);
        $('#extension').html(items.user);
        $('.domain_name').html(items.domain);
        $('#dialstring_length').val(items.dialstring_length);
        $('#intl_prefix').val(items.intl_prefix);
        $('#area_code').val(items.areacode);

        $('#country_code option[country_initials="' + items.country_initials + '"]').prop('selected', true);
        $("input.filter[value=" + items.filter + "]").attr("checked","checked");


        createDomainTable(items.domain_list);
        setFilter(items.filter);
        setTab('tab5') //items.active_tab
        setDisplayMode();
        autoSave = true;
    });
}

/**
 * clears stored data and removes user authentication.
 */
function logout(){

    chrome.storage.sync.set({
        user: '',
        pass: '',
        login_name: '',
        dialstring_length: '11',
        intl_prefix: '011',
        country_initials:'',
        country_code: '',
        areacode: '',
        filter: 'none',
        logged: 'false',
        active_tab: 'tab1',
        token: '',
        expires_in: '',
        expires_at: '',
        refresh: ''
    }, function() {
        setTab('tab1');
        createDomainTable();
        $('.login_name').html('');
        $('#login').val('');
        $('#pass').val('');
        $('#domain').val('');
        $('#dialstring_length').val('11');
        $('#intl_prefix').val('011');
        $('#area_code').val('');
        $("#none_radio").prop("checked", true);
        $('#main_menu').hide();
    });
    setDisplayMode();


}

/**
 * Hides Login divs and shows option divs if user is not logged in.
 * and vise versa
 */
function setDisplayMode(){
    chrome.storage.sync.get({
        logged: 'false'
    }, function(items){

        if(items.logged === 'true'){

            $('#login_container').css('display', 'none');
            $("#content").css('display', 'block');
        } else {

            $('#login_container').css('display', 'block');
            $("#content").css('display', 'none');
        }
    });
}


function invalidLogin(){

    alert("Invalid Credentials");
    log("Login Attempt Unsuccessful");
    $("#result").html("Invalid Credentials");

    chrome.storage.sync.set({
        logged: 'false'
    });
    logout();
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
 * @param list: Element to append table to.
 */
function createDomainTable(data = ''){

    //erase current table and remake it.
    $('#domain_list').empty();
    table = $("<table />");
    if(data != ""){

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
 * Generate list of table elements then pass to createDomainTable.
 * @param domain: URL Domain.
 * @param list: Element to append table to.
 * @param excludeDomain: Do not store domain if true.
 */
function updateTable(domain, excludeDomain = false){

    let data = new Array();
    let td;

    $('#domain_list table').find('row').each(function(){


        td = $(this).find("td").eq(0);
        if(td.text()!=domain){

            data.push(td.text());
        }
    });
    if(!excludeDomain) {

        data.push(domain)
    }
    let elementString = data.join(",");
    chrome.storage.sync.set({
        domain_list: elementString,
    }, function() {

        createDomainTable(elementString);
    });
}

/**
 * handler for include domain textbox
 */
function addDomain(){

    let curDomain = extractDomain($("#add_domain").val());
    if ($.trim(curDomain) != "") {

        updateTable(curDomain);
    }
    $("#add_domain").val("");
}


function setTab(id){

    let tabs = $('.tab');
    for(let i = 0; i < tabs.length; i++){
        if(tabs[i].id === id){

            $('#' + tabs[i].id).addClass('active_tab');
            $('#' + tabs[i].id + '_content').css('display', 'block');
            chrome.storage.sync.set({
                active_tab: tabs[i].id,
            });
        } else {

            $('#' + tabs[i].id).removeClass('active_tab');
            $('#' + tabs[i].id + '_content').css('display', 'none');
        }
    }
    $('#main_menu').css('display', 'none');
}

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

