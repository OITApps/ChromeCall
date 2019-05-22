/**
 * file dependencies
 jquery-3.3.1.min.js
 */

let shortNumberSearch = false;

const shortNumberRegex = [
	/(?<!\d[ \-)]*)\d{3}(?![ -(]*\d)/g,
	/(?<!\d[ \-)]*)\d{4}(?![ -(]*\d)/g,
	/(?<!\d[ \-)]*)\d{5}(?![ -(]*\d)/g,
];
const longNumberRegex = [
	/\+?\(*(\d{1,4}[(). -]*)?[2-9]\d{2}[) -]*[2-9a-zA-Z] *(?!1[ -]*1)([0-9A-Za-z][- ]*){2}(([- ]*[a-zA-Z]){4}|\d{4})/g,
	/(?<!\d[ \-)]*)([2-9](?!11)([0-9]){2})[-| ]*\d{4}(?![ -(]*\d)/g,
];

/**
 * Listener for background.js initialization. Creates context menu for extension.
 */
chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({
		"id": "cc_call_item",
		"title": "Call",
		"visible": true,
		contexts: ['selection'],
	});


	chrome.storage.sync.get({
		logged: false,
		shortNumberSearch: false
	}, function(items){

		if(items.logged) {

			shortNumberSearch = items.shortNumberSearch
			init()
		}
	});
});

/**
 * Sets event listeners for background.js
 */
function init(){

	chrome.runtime.onMessage.addListener(function (data) {

		if (data.request === 'updateContextMenu') {

			let foundNumber = searchHighlighted(data.selection);

			if (foundNumber.length > 0) {
				chrome.contextMenus.update('cc_call_item', {
					"title": "Call " + foundNumber,
					"visible": true,
					"onclick": function () {

						chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {

							chrome.tabs.sendMessage(tabs[0].id, {
								type: "callFromContextMenu",
								number: foundNumber
							});
						});
					}
				});
			} else {

				chrome.contextMenus.update('cc_call_item', {visible: false});
			}
		} else if (data.request === 'search'){
			chrome.storage.sync.get({
				logged: false,
				shortNumberSearch: false
			}, function(items){

				if(items.logged) {

					shortNumberSearch = items.shortNumberSearch;
				}
			});
		}
	});

}


/**
 * Searches highlighted string for phone numbers and displays the first one found in context menu.
 * Prioritizes longest number first.
 * @param newNodeStr: highlighted text.
 * @returns {string} Phone number found.
 */
function searchHighlighted(newNodeStr){

	let defaultText = '';
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
