let user;
let pass;
let loginName;
let countryCode="";
let dialStringLength="";
let internationalPrefix;
let targetNum;
let areaCode;
const url = 'https://manage.oitvoip.com/ns-api/';
const clientID = '20463.client';
const clientSecret = '18c038c8676d9d4114390ab4a5862d8b';


/**
 * Enables Console logging.
 * For ease of access, please keep this as the first function in this class.
 */
function log(input){
    console.log(input);
}

/**
 * Take oAuth Token and register call via post to domain.
 * @param access_token: oAuth token.
 */
function makeCall(accessToken){
    log( 'callid: ' + targetNum + "-" + new Date().getTime());
    log('UID ' + user + '@' + domain);
    log('user: ' + user);
    log('domain: ' + domain);
    log('destination: ' + targetNum);
    log('Token: ' + accessToken);
    log('login: ' + loginName);
    $.ajax({
        url: url,
        type: 'post',
        data: {
            'object': 'call',
            'action': 'call',
            'callid': targetNum + "-" + new Date().getTime(),
            'uid': user + '@' + domain,
            'destination': targetNum,
        },
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded',
            "Authorization": "Bearer " + accessToken,
        },
        contentType: 'application/x-www-form-urlencoded',
        success: function (data, result, response) {

            log(extension_initials + ' call went through to ' + targetNum);
            log(data);
            log(result);
            log(response);
        },
        error: function(xhr, exception){

            log('Call Failed: ');
            log(xhr);
            log(exception);
        },
    });
}

/**
 * Make oAuth post request and get bearer tokens before registering phone call via makeCall function.
 */
function getAccessToken(){

    //User has not submitted credentials.
    if(typeof pass === 'undefined' || typeof user === 'undefined' || pass==='' || user===''){

        let tempExtensionName;
        if(extension_name === "") {

            tempExtensionName = 'the';
        } else {

            tempExtensionName = extension_name;
        }
        alert("Please register your username and password in " + tempExtensionName  + " extension options Page.");
    }else{

        $("#result").html("<img width='20px' src='loading.gif'>");
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

                log(data);
                chrome.storage.sync.set({
                        token: data.access_token,
                        expires_in: data.expires_in,
                        expires_at: new Date().getTime(),
                        refresh: data.refresh_token,
                    },
                    function() {
                        log(extension_initials + ' set token in storage and call');
                        makeCall(data.access_token);
                    });
            },
            error: function(xhr, exception){

                if(xhr.status == 400 || xhr.status == 403){
                    log('Invalid Credientals:');
                    log(xhr);
                    log(exception);
                    alert("Invalid Credentials, please visit this extension's options and set your username and"
                        + "password.");
                }
            },
        });
    }
}

/**
 * Issue new post request to get new oAuthToken then register call with domain through post request.
 * @param refreshToken: oAuthToken.
 */
function refreshToken(refreshToken){
    log("refreshToken: " + refreshToken);
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url + "oauth2/token/");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4 && xhr.status == 200) {

            let responseText = JSON.parse(xhr.responseText);
            access_token = responseText.access_token;
            chrome.storage.sync.set(
                {token:access_token,
                    expires_in:responseText.expires_in,
                    expires_at:new Date().getTime(),
                    refresh:responseText.refresh_token
                }, function() {
                    log(extension_initials + ' set refresh token in storage and call');
                    makeCall(access_token);
                });
        }
        if(xhr.status == 401){

            //Original Author Note: "401 refresh_token expired: added coz of email error 13Dec"
            getAccessToken();
        }
    }
    xhr.send("client_id=" + clientID + "&client_secret=" + clientSecret
        + "&grant_type=refresh_token&refresh_token=" + refreshToken);
}

/**
 * Check is existing call has been run through oAuth and registered with domain and does so if not already done
 * with enough time remaining on the registered call.
 */
function checkAndCall(){

    let access_token;
    chrome.storage.sync.get([
        'token',
        'expires_in',
        'expires_at',
        'refresh'
    ], function(items) {

        //get oAuth token if one is has not been retrieved.
        if(items.expires_in === undefined || items.expires_at === undefined){

            getAccessToken();
        }else{

            let time = new Date().getTime();

            log(extension_initials + ' token age ' + (time-parseInt(items.expires_at)));
            log(extension_initials + ' token expiration ' + (parseInt(items.expires_in)*1000));

            /**
             *Register new call with domain using current token if not enough time is remaining
             * At this time it is unclear what determines how much time should be remaining.
             */
            if((time - parseInt(items.expires_at)) < (parseInt(items.expires_in)*1000)){

                log(extension_initials + ' get current token from storage and call');
                access_token = items.token;
                makeCall(access_token);
            }else{

                //refresh token
                log(extension_initials + ' refresh token and call');
                refreshToken(items.refresh);
            }
        }
    });
}