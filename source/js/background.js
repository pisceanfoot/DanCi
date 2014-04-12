/*
* @namespace
* @description background
*/
var background = {
	/*
	* @description init
	*/
	init: function () {
		background.contextMenu();
	},

	/*
	* @description ceateContextMenu
	*/
	contextMenu: function () {
	    chrome.contextMenus.create({
            title: '词霸翻译',
            contexts: ["selection"],
            onclick: function () {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				  chrome.tabs.sendMessage(tabs[0].id, {from: 'background', action: 'getSelection'}, function(response) {
				  	
				  	var searchUrl = 'http://cn.bing.com/dict/search?q=' + encodeURIComponent(response.data);
					chrome.tabs.create({url:searchUrl});
				  });
				});
            }
        });	    
	}
}

background.init();