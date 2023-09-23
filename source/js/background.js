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
      id: "translation_from_selection",
      title: "词霸翻译",
      contexts: ["selection"],
    });
    chrome.contextMenus.onClicked.addListener(background.onMenuClick);
  },
  onMenuClick: function (info, tab) {
    console.log("on menu context lick", info);
    if (info.menuItemId == "translation_from_selection") {
      const searchUrl =
        "http://cn.bing.com/dict/search?q=" +
        encodeURIComponent(info.selectionText);
      chrome.tabs.create({ url: searchUrl });
    }
  },
};

background.init();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("background", message);

  const type = message.type;

  switch (type) {
    case "http_get":
      fetchGet(message.url, sendResponse);

    default:
      break;
  }

  return true;
});

async function fetchGet(url, callback) {
  const response = await fetch(url);
  if (response && response.ok) {
    const text = await response.text();

    return callback({
      isSuccess: true,
      data: text,
    });
  }

  return callback({
    isSuccess: false,
  });
}
