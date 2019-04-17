/**
 * Globals
 */


/**
 * Enables Console logging.
 * For ease of access, please keep this as the first function in this class.
 */
function log(input){
    console.log(input);
}

/**
 * initialize event triggers and set custom scaling css.
 */
function init(){

    const padding = 20;
    const tableRow = '<tr><td>';
    const tableRowEnd = '</td></tr>';
    const company_modal_row_height = 50;
    const company_modal_header_height = 50;
    const company_table_width = 350 + padding;
    var companyModalHeight = 40;
    var companyModelRows = 0;
    if(company_name != "" && extension_name != "") {

        $(document).attr("title", company_name + "'s " + extension_name + " Options");
        $('#company_credit').html(extension_name + ' brought to you by <a data-toggle="modal" href="#company_modal">' + company_name + '</a>.');
        $('.extension_title').html(extension_name);
        $('#version').html('version ' + chrome.runtime.getManifest().version);
        $('.logo').attr({"alt": company_name});
        $('#modal_info_table').append('<thead><tr><th><h4 id="company_name"">'
            + company_name + '</h4></th></tr></thead>');

        companyModelRows += 1;
        companyModalHeight += company_modal_header_height; //Height of Company Name Row
    } else if(extension_name != ""){

        $(document).attr("title", extension_name + " Options");
        $('.logo').attr({"alt": company_name});
    }else {

        $(document).attr("title", "Options");
    }

    if(company_phonenumber != ""){

        $('#modal_info_table').append(tableRow + 'Phone: ' + company_phonenumber + tableRowEnd);
        companyModelRows += 1;
        companyModalHeight += company_modal_row_height;
    }


    if(company_email != ""){

        $('#modal_info_table').append(tableRow + 'Email: ' + company_email + tableRowEnd);
        companyModelRows += 1;
        companyModalHeight += company_modal_row_height;
    }

    if(company_website != ""){
        if(company_website_display_name == "") {

            company_website_display_name = company_website;
        }
        $('#modal_info_table').append(tableRow + 'Website: ' + '<a href="' + company_website + '" target="blank">'
            + company_website_display_name + tableRowEnd + '</a>');
        companyModelRows += 1;
        companyModalHeight += company_modal_row_height;
    }
    var modalDialogWidth = company_table_width + companyModalHeight;
    companyModalHeight += padding;
    $('#company_modal_dialog')
        .attr('style', 'width: ' + modalDialogWidth + 'px !important;'
            + 'height: ' + companyModalHeight + 'px !important;'
            + 'min-width: ' + modalDialogWidth + 'px !important;'
            + 'min-height: ' + companyModalHeight + 'px !important;'
        );

    $('#company_modal_content')
        .attr('style', 'width: ' + modalDialogWidth + 'px !important;'
            + 'height: ' + companyModalHeight + 'px !important;'
            + 'min-width: ' + modalDialogWidth + 'px !important;'
            + 'min-height: ' + companyModalHeight + 'px !important;'
        );


    $('#company_modal_img')
        .height(companyModalHeight - 20)
        .width(companyModalHeight - 20);

    if(companyModelRows > 0){
        $('#modal_info_table').append('<td></td>');
    }

    //store all entries in chrome storage on "Save" button.
    $("#save_button").click(save);
    //Empty all domain tables on "Clear Page Lists" button.
    $("#clear_listed_page_button").click(clearLists);
    //on add included domain button click
    $("#add_inc_domain").click(addDomain);
    //on add included domain textbox enter keypress
    $("#inc_domain").on('keypress', function (e) {
        if(e.which === 13){

            addDomain();
        }
    });
    //on add included domain button click
    $("#add_exc_domain").click(removeDomain);
    //on add excluded domain textbox enter keypress
    $("#exc_domain").on('keypress', function (e) {
        if(e.which === 13){

            removeDomain();
        }
    });
    //login/out user
    $("#logout_button").click(logout);
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
    $(".main-container").on("click",".del_domain",function(){
        var curDomain = $(this);
        if(confirm("Are you sure you want to delete the domain " + curDomain.attr("data-domain") + " from the list?")){

            updateTable(curDomain.attr("data-domain"), curDomain.attr("data-list"), true);
        }
    });


    //toggles qtip element text on hover and
    $(".qtip").hover(function(){

        positionTooltip($(this))

    },function(){

        $("#options_tool_tip").css({display: 'none'});
    });
}


$(document).ready(function(){
    init();
    for(i in allCountries) {

        $("<option />")
            .attr("country_initials", allCountries[i][1])
            .attr("value", allCountries[i][2])
            .text(allCountries[i][0] + " " + allCountries[i][2])
            .appendTo("#country_code");
    }

    restoreOptions()

});



function login(){

    var login = document.getElementById('login').value;
    var pass = document.getElementById('pass').value;

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
            log("Set: " + url);



            chrome.storage.sync.set({
                pass: pass,
                login_name: login,
                logged: 'true',
            }, function() {
                //Update status to let user know options were saved.
                var status = document.getElementById('status');
                status.textContent = 'Options saved.';

                setTimeout(function() {
                    status.textContent = '';
                }, 750);

                save();
                setDisplayMode();

            });

        },
        error: function(xhr, exception){

            if(xhr.status == 400 || xhr.status == 403){

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
    var login = '';
    var pass = '';

    //Get oAuth Token Step 1.
    chrome.storage.sync.get({
        pass: '',
        login_name: '',
    }, function(items){
        login = items.login_name;
        pass = items.pass;

        $("#result").html("<img width='20px' src='loading.gif'>");
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

                var user = login.split('@')[0];
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
                        user = $(data).find("user").text()

                        $('#login_name').html(login);
                        $('#extension').html($(data).find("user").text());
                        $('#domain_name').html($(data).find("domain").text());

                        var areaCode = $(data).find("area_code").text();
                        $("#result").html("SIP Username: " + user + "<br>Area Code: " + areaCode);
                        chrome.storage.sync.set({
                            user: $(data).find("user").text(),
                            domain: $(data).find("domain").text(),
                            dialstring_length: document.getElementById('dialstring_length').value,
                            intl_prefix: document.getElementById("intl_prefix").value,
                            country_initials: document.getElementById("country_code")
                                [document.getElementById("country_code").selectedIndex]
                                .getAttribute('country_initials'),
                            country_code: document.getElementById("country_code").value,
                            areacode: areaCode,
                            use_list: $("input.use_list:checked").val(),
                            logged: 'true'
                        }, function() {

                            // Update status to let user know options were saved.
                            var status = document.getElementById('status');
                            status.textContent = 'Options saved.';
                            log('Save Successful');

                            status.textContent = '';
                            setDisplayMode();

                        });
                    },
                    error: function(xhr, exception){

                        chrome.storage.sync.set({
                            logged: 'false'
                        });
                        if(xhr.status == 400 || xhr.status == 403){

                            alert("Invalid Credentials");
                            $("#result").html("Invalid Credentials");
                        }
                    },
                });

            },
            error: function(xhr, exception, third){

                if(xhr.status == 400 || xhr.status == 403){

                    log(xhr);
                    log(exception);
                    log(third);
                    invalidLogin();
                    return "Invalid Credentials";
                }
            },
        });

    });

}

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
        use_list: 'none',
        logged: 'false',
    }, function() {

        clearLists()
        $('#login_name').html('');
        $('#login').val('');
        $('#pass').val('');
        $('#domain').val('');
        $('#dialstring_length').val('11');
        $('#intl_prefix').val('011');
        $('#area_code').val('');
        $("#none_radio").prop("checked", true);
        setDisplayMode();
    });
}

/**
 * Hides Login divs and shows option divs if user is not logged in.
 * and vise versa
 */
function setDisplayMode(){
    chrome.storage.sync.get({
        logged: ''
    }, function(items){

        if(items.logged == 'true'){

            $('#login_modal').css('display', 'none').modal('hide');
            $("#options_container").css('display', 'block');
        } else {

            $('#login_modal').css('display', 'block').modal({ backdrop: 'static', keyboard: false });
            $("#options_container").css('display', 'none');
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
        whitelist:'',
        blacklist:'',
        use_list: 'nolist',
        domain: '',
    }, function(items) {
        log("!");
        log(items);
        $('#login_name').html(items.login_name);
        $('#extension').html(items.user);
        $('#domain_name').html(items.domain);
        document.getElementById('dialstring_length').value = items.dialstring_length;
        document.getElementById('intl_prefix').value = items.intl_prefix;
        document.getElementById("area_code").value = items.areacode,

        $('#country_code option[country_initials="' + items.country_initials + '"]').prop('selected', true);
        $("input.use_list[value=" + items.use_list + "]").attr("checked","checked");

        createTable(items.whitelist,"whitelist");
        createTable(items.blacklist,"blacklist");
    });
    setDisplayMode()
}

/**
 * Parse domain from URL string.
 * @param url: url to be parsed
 * @returns string of parsed domain. https://example.com => example.com
 */
function extractDomain(url) {

    var domain;
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
function createTable(data, list){

    //erase current table and remake it.
    $("#" + list).empty();
    table = $("<table />");
    if(data != ""){

        var tokens = data.split(",");
        for(var i in tokens){
            row = $("<row />");
            $("<td />").text(tokens[i]).appendTo(row);
            $("<td />").addClass("del_td").html(
                "<img src='img/del.png' alt='Delete' class='del_domain' data-list='" + list + "' data-domain='"
                    + tokens[i] + "' >"
            ).appendTo(row);
            row.appendTo(table);
        }
    }
    $("#"+list).append(table);
}

/**
 * Generate list of table elements then pass to createTable.
 * @param domain: URL Domain.
 * @param list: Element to append table to.
 * @param excludeDomain: Do not store domain if true.
 */
function updateTable(domain, list, excludeDomain = false){

    var data = new Array();
    var td;

    $("#" + list + " table").find('row').each(function(){


        td = $(this).find("td").eq(0);
        if(td.text()!=domain){

            data.push(td.text());
        }
    });
    if(!excludeDomain) {

        data.push(domain)
    }
    var elementString = data.join(",");
    var tableObj = {};
    tableObj[list] = elementString;
    chrome.storage.sync.set(tableObj, function() {

        // Update status to let user know options were saved.
        $("#" + list + "_status").text("Domain List Saved").delay(800).text("");
        createTable(elementString, list);
    });
}

/**
 * handler for include domain textbox
 */
function addDomain(){

    var curDomain = extractDomain($("#inc_domain").val());
    if ($.trim(curDomain) != "") {

        updateTable(curDomain, "whitelist");
    }
    $("#inc_domain").val("");
}

/**
 * handler for exclude domain textbox
 */
function removeDomain(){

    var curDomain = extractDomain($("#exc_domain").val());
    if($.trim(curDomain)!=""){

        updateTable(curDomain,"blacklist");
    }
    $("#exc_domain").val("");
}

/**
 * emptys include and exclude domain lists
 */
function clearLists(){

    createTable('', 'whitelist');
    createTable('', 'blacklist');
}

/**
 * positions tooltip.
 * @param element
 */
function positionTooltip(element){

    var tooltipContainer = $('#options_tool_tip');
    $("#options_tool_tip_card").html("<h3>" + tips[element.prop('id')] + "</h3>");
    tooltipContainer.css({display: 'block'});

    var position = element.position();
    tooltipContainer.css({top: ( position.top - tooltipContainer.height() - 4), left: ( position.left + element.width() - 28)});
}



