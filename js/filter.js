/**
 * Generate list of table elements then pass to createFilterTable.
 * @param domain: URL Domain.
 * @param excludeItem: Do not store domain if true.
 */
function updateFilter(item, filter, excludeItem = false, callBack = null){

    let storageElements = {'user': ''};
    let filterType = filter + '_list';
    let newFilter = [];
    let filteredItems;
    storageElements[filterType] = {};
    console.log(JSON.stringify(storageElements));
    chrome.storage.sync.get(storageElements, function(items){
        console.log("!" + JSON.stringify(items));
        if(items[filterType][items.user]){
            filteredItems = items[filterType][items.user].split(",");
            for(let i = 0; i < filteredItems.length; i++){

                if(filteredItems[i] !== item){

                    newFilter .push(filteredItems[i]);
                }
            }
        }
        if(!excludeItem) {

            newFilter .push(item)
        }

        let elementString = newFilter.join(",");


        items[filterType][items.user] = elementString;
        console.log("?" + JSON.stringify(items));
        chrome.storage.sync.set(items);
        if(callBack) { callBack(elementString, filter) }
    });
}

function filterOut(item, filter){
    chrome.storage.sync.get({
        filter: {
            shown: '',
            number: 'nofilter',
            domain: 'nofilter',
        }
    }, function(items){

        switch(items.filter[filter]){

            case 'nofilter':

                items.filter[filter] = 'blacklist';
                chrome.storage.sync.set({
                    filter: items.filter,
                }, function(){

                    updateFilter(item, filter, false, function(){
                        updateContent('search');
                        updateMenu('filter');
                    });

                });
                break;
            case 'whitelist':

                updateFilter(item, filter, true, function(){
                    updateContent('search');
                    updateMenu('filter');
                });
                break;
            case 'blacklist':
                updateFilter(item, filter,false, function(){
                    updateContent('search');
                    updateMenu('filter');
                });
                break;
        }

    });
}

function updateContent(updateType){

    chrome.tabs.query({}, function(tabs) {

        for (var i=0; i<tabs.length; ++i) {

            chrome.tabs.sendMessage(tabs[i].id, {type: updateType});
        }
    });
}

function updateMenu(updateType){

    chrome.runtime.sendMessage({type: updateType});
}