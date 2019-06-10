/**
 js/jquery-3.3.1.min.js
 */

let cc_modal = {
    modal: null,
    overlay: null,
    numText: null,
    modalRaised: false,
    active: false,
};

let cc_dialog = {
    dialog: null,
    prompt: null,
    description: null,
    checkboxContainer: null,
    buttonContainer: null,
    active: false,
    buttons: [],
    checkboxes: [],
    waiting: [],
};
/**
 * generate modal which allows users to manually enter a text and perform a function set in arguments.
 * Calling this function again will unbind all button handlers and set new button text and function.
 * @param buttonText: Text to be displayed on the button.
 * @param buttonFunc: Function to be run once the Modal button has been clicked or if the user presses enter.
 */
function generateModal(buttonText = '', buttonFunc = null){
    if(!cc_modal.modal) {

        if ($("#cc_modal").length === 0) {
            //generate modal HTML elements and grant them ID.
            cc_modal.overlay = $('<div id="cc_modal_overlay"></div>');
            cc_modal.modal = $('<div id="cc_modal">');
            cc_modal.numText = $('<input id="cc_modal_input" type="text">');
            var modalButton = $('<button id="cc_call_btn"></button>');
            var modalInfoText = $('<div id=cc_modal_info_text>Press ESC to Cancel</div>');

            $('body').append(cc_modal.overlay)
                .append(cc_modal.modal
                    .append(cc_modal.numText)
                    .append(modalButton)
                    .append(modalInfoText)
                );

            cc_modal.overlay.css('display', 'none');
            cc_modal.modal.css('display', 'none');

            cc_modal.overlay.on('click', lowerModal);
            document.addEventListener('keydown', function (e) {
                if (e.keyCode === 27) {

                    lowerModal();
                }
            });
        }
    }
    if(buttonText){

        modalButton.html(buttonText);
    }

    if(buttonFunc){

        modalButton.off().on('click', function() {
            buttonFunc($("#cc_modal_input").val());
            lowerModal();
        });
        $("#cc_modal_input").off().on('keypress', function (e) {
            if(e.which === 13){

                buttonFunc($("#cc_modal_input").val());
                lowerModal();
            }
        });
    }

}


/**
* Hides modal elements
*/
function lowerModal() {

    cc_modal.modalRaised = false;
    cc_modal.overlay.css('display', 'none');
    cc_modal.modal.css('display', 'none');
}

/**
 * Shows Modal Elements.
 */
function raiseModal(defaultText = ''){

    cc_modal.modalRaised = true;
    cc_modal.modal.css('display', 'block');
    cc_modal.overlay.css('display', 'block');
    cc_modal.numText.val(defaultText);
    //prevent textbox from having character from keybind used to raise modal.
    setTimeout(function(){cc_modal.numText.focus()}, 0);
}

function ccAlert(promptText = '', descriptionText = '', ...buttonArgs){
    console.log('A START');

    //accept an array of arguments instead of rest arguments
    if(typeof promptText !== 'string'){
        let tempPromptText = promptText.shift();
        descriptionText = promptText.shift();
        buttonArgs = promptText.slice();
        promptText = tempPromptText;
    }

    if(cc_dialog.active){
        let args = [promptText, descriptionText];
        for(let i = 0; i < buttonArgs.length; i++){

            args.push(buttonArgs[i]);
        }
        cc_dialog.waiting.push(args);
        return;
    }

    cc_dialog.active = true;
    if(!cc_dialog.dialog) {

        //generate modal HTML elements and grant them ID.
        cc_dialog.dialog = $('<div id="cc_dialog"></div>');
        cc_dialog.prompt = $('<div id="cc_dialog_prompt"></div>');
        cc_dialog.description = $('<div id="cc_dialog_description"></div>');
        cc_dialog.checkboxContainer = $('<div id="cc_dialog_checkbox_container">');
        cc_dialog.buttonContainer = $('<div id="cc_dialog_button_container">');

        $('body').append(cc_dialog.dialog);
        cc_dialog.dialog
            .append(cc_dialog.prompt)
            .append(cc_dialog.numText)
            .append(cc_dialog.description)
            .append(cc_dialog.checkboxContainer)
            .append(cc_dialog.buttonContainer);
    }

    setDialogText($.parseHTML(promptText), $.parseHTML(descriptionText));
    setDialogButtons(buttonArgs);
    cc_dialog.dialog
        .css({display: 'block'})
        .stop()
        .animate({opacity: 1}, 250);

}

function hideAlert(){

    cc_dialog.dialog.stop().animate({opacity: 0}, 250);
    setTimeout(function(){
        cc_dialog.dialog.css({display: 'none'});
        console.log("A END");
        cc_dialog.active = false;
        if(cc_dialog.waiting.length > 0) {
            ccAlert(cc_dialog.waiting.shift());
        }
    }, 250);

}

function setDialogText(promptText = '', descriptionText = '', fadeIn = false, fadeOut = false) {
    if(fadeIn && fadeOut){
        cc_dialog.prompt.animate({opacity: 0}, 250);
        cc_dialog.description.animate({opacity: 0}, 250);
        setTimeout(function(){
            cc_dialog.prompt.html(promptText);
            cc_dialog.description.html(descriptionText);
            cc_dialog.prompt.animate({opacity: 1}, 250);
            cc_dialog.description.animate({opacity: 1}, 250);
        }, 250);
    } else if(fadeIn && !fadeOut){
        cc_dialog.prompt.html(promptText);
        cc_dialog.description.html(descriptionText);
        cc_dialog.prompt.animate({opacity: 1}, 250);
        cc_dialog.description.animate({opacity: 1}, 250);
    } else if(!fadeIn && fadeOut){
        cc_dialog.prompt.html(promptText);
        cc_dialog.description.html(descriptionText);
        cc_dialog.prompt.animate({opacity: 0}, 250);
        cc_dialog.description.animate({opacity: 0}, 250);
    } else {
        cc_dialog.prompt.html(promptText);
        cc_dialog.description.html(descriptionText);
    }
}
function setDialogButtons(buttonArgs){
    console.log("Called")
    buttonCount = 0;
    boxCount = 0;
    for(let i = 0; i < cc_dialog.buttons.length; i++){

        cc_dialog.buttons[i].remove();
    }
    for(let i = 0; i < cc_dialog.checkboxes.length; i++){

        cc_dialog.checkboxes[i].remove();
    }
    if(!buttonArgs || (buttonArgs && buttonArgs.length === 0)) {

        let newButton = $('<button id="cc_dialog_button_1">OK</button>');
        newButton.on('click', hideAlert);
        cc_dialog.buttons.push(newButton);
        cc_dialog.buttonContainer.append(newButton)
    } else {

        let newButton, buttonType, newButtonLabel;
        for(let i = 0; i < buttonArgs.length; i++) {
            if(buttonArgs[i].type && buttonArgs[i].type === 'checkbox'){
                boxCount++;
                buttonType = 'checkbox';
                newButton = $('<input id="cc_dialog_checkbox_' + boxCount + '" class="cc_dialog_checkbox" type="checkbox">');
                if(buttonArgs[i].text){

                    newButtonLabel = $('<span></span>');
                    newButtonLabel.append(buttonArgs[i].text);
                } else {

                    newButtonLabel = $('<span></span>');
                }
                if(buttonArgs[i].change){
                    newButton.on('change', buttonArgs[i].change);
                }
                cc_dialog.checkboxes.push(newButton);
                cc_dialog.checkboxes.push(newButtonLabel);
                cc_dialog.checkboxContainer.append(newButton).append(newButtonLabel);

            } else {
                buttonCount++;
                if(buttonArgs[i].text){

                    newButton = $('<button id="cc_dialog_button_' + buttonCount + '"></button>');
                    newButton.append(buttonArgs[i].text);
                } else {

                    newButton = $('<button>OK</button>');
                }
                console.log(JSON.stringify(buttonArgs[i]));
                console.log(!buttonArgs[i].noHide);
                if(!buttonArgs[i].noHide){
                    newButton.on('click', hideAlert);
                }
                cc_dialog.buttonContainer.append(newButton);
                cc_dialog.buttons.push(newButton);

            }
            if(buttonArgs[i].click){
                newButton.on('click', buttonArgs[i].click);
            }
            if(buttonArgs[i].mouseover){
                newButton.on('mouseover', buttonArgs[i].mouseover);
            }
            if(buttonArgs[i].mouseout){
                newButton.on('mouseout', buttonArgs[i].mouseover);
            }
        }

    }
}