chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getOpts"){

		sendResponse({opts: [localStorage['country_code'],
			localStorage['dialstring_length']],
			success:true});
	}else if (request.method === "dialNumber"){

	}else{

		sendResponse({}); // snub them.
	}
});
