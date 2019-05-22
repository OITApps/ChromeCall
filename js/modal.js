/**
 js/jquery-3.3.1.min.js
 */

let cc_modal = {
    modal: null,
    overlay: null,
    numText: null,
    modalRaised: false,
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
