if(company_name != "" && extension_name != "") {

    $(document).attr("title", company_name + "'s " + extension_name + " User Guide");
    $('.extension_title').html(extension_name);
    $('#version').html('version ' + chrome.runtime.getManifest().version);
    $('.logo').attr({"alt": company_name});
} else if(extension_name != ""){

    $(document).attr("title", extension_name + " Options");
    $('.logo').attr({"alt": company_name});
}else {

    $(document).attr("title", "Options");
}