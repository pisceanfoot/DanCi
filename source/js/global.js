var config = {
  isDebug: false
}

var resource = {
  CONFIG_SETTING_KEY: "Setting_4C6B301702544FBFAB286DE34F6B2AB3",
  SAVE_HIGHLIGHT_WORD : "save_highlight_word"
}


var log = {
	log: function (arg) {
		console.log(arg);
	},
	error: function (arg) {
		console.error(arg);
	},
	debug: function (arg) {
      if(config.isDebug)
        console.debug(arg);
	}
};

(function($){
	$.framework = {};

    $.framework.dynamicCall = function (func) {
        var _thisFunc = this[func];
        if (_thisFunc) {
            this[func].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    };

    $.framework.format = function (format) {
        var args = $.makeArray(arguments).slice(1);
        if (format === undefined) { format = ""; }
        return format.replace(/\{(\d+)\}/g, function (m, i) {
            return args[i];
        });
    };

    $.framework.urlEncode = function (str) {
        if (str) {
            return encodeURIComponent(str);
        } else {
            return str;
        }
    };

    $.framework.urlDecode = function (str) {
        if (str) {
            return decodeURIComponent(str.replace(/\+/g, "%20"));
        } else {
            return str;
        }
    };
})(jQuery);

(function($){

	function audioPlayer(src){
		var audio = new Audio(src);

		this.play = function(){
			audio.play();	
		};

		this.pause = function(){
			audio.pause();
		};

		this.dispose = function(){
			delete audio;
		};
	}

  var _playList = {};
	$.playAudio = function(src){
    var myAudio = _playList[src];
    if(!myAudio){
		  myAudio = new audioPlayer(src);
      _playList[src] = myAudio;
    }

		return {
            play: function () {
                myAudio.play();
                if(myAudio){
                    myAudio.dispose();
                    delete myAudio;
                    delete _playList[src];
                }
            },
            pause: function () {
                if(myAudio){
                    myAudio.pause();
                    delete myAudio;
                }
                delete _playList[src];
            }
        };
	}

})(jQuery);

/**
 * @preserve jQuery Plugin: Highlight Search Terms v0.4.2
 *
 * LICENSE: http://hail2u.mit-license.org/2009
 */

/*jslint indent: 2, browser: true, regexp: true */
/*global jQuery, $ */
(function ($) {
  // Private: Encode entities
  function encodeEntities(s) {
    return $("<u/>").text(s).html(); // jQuery magic
  }

  $.fn.highlightSearchTerms = function (options) {
    var o = $.extend({}, $.fn.highlightSearchTerms.defaults, options),
      terms,
      t,
      c,
      highlighted;

      terms = o.terms;
      // Highlight terms
      if (terms !== "") {
        terms = new RegExp("(" + terms + ")", "gi");
        t = o.tagName;
        c = o.className;
        highlighted = "<" + t + " class=\"" + c + "\" style=\"" + o.style + "\">$1</" + t + ">";
        this.find(":not(iframe, option, script, textarea)").contents().each(function () {
          if (this.nodeType === 3) {
            var s = encodeEntities(this.nodeValue).replace(terms, highlighted);
            $(this).replaceWith(s);
          }
        });
      }

      return this;
  };

  $.fn.highlightAllSearchTerms = function (options, settingCallback, tipCallback) {
      var o = $.extend({}, $.fn.highlightSearchTerms.defaults, options),
        terms,
        t,
        c,
        s,
        r,
        highlighted;

        terms = o.terms;
        // Highlight terms
        if (terms !== "") {
          t = o.tagName;
          this.find(":not(iframe, option, script, textarea)").contents().each(function () {

                _this = this;
                $.each(terms, function(i, term){
                  var saved = encodeEntities(_this.nodeValue);
                  if(!saved){
                    return;
                  }
                  if(saved.indexOf(term) != -1){
                    return;
                  }

                  r = settingCallback(term);
                  c = r.className;
                  s = r.style;

                  var regterm = new RegExp("(" + term + ")", "gi");
                  highlighted = "<" + t + " class=\"" + c + "\" style=\"" + s + "\">$1</" + t + ">";
                  
                  var s = saved.replace(regterm, highlighted);
                  if(s != saved){
                    $(_this).replaceWith(s);
                    tipCallback(term, c);  
                  }
                });
          });
        }

        return this;
    };


  // Public: default options
  $.fn.highlightSearchTerms.defaults = {
    tagName:          "span",
    className:        "highlight",
    referrerPatterns: [],
    style: '',
    unsafeChars:      "[!-*,-/:-@[-`{-~]"
  };
}(jQuery));



/*
* @description 单词存储
*/
var danciStorage = {
  /*
  * 1. 管理保存的单词，及其翻译，显示词频
  */
  storage : null,

  /*
  * @description init
  */
  init: function () {
    //danciStorage.storage = window.localStorage;
    danciStorage.storage = chrome.storage.sync;
  },

  /*
  * @description onChange
  */
  onChange: function (callback) {
    //danciStorage.storage.onChanged.addListener(callback);
  },

  /*
  * @description add
  * @param key key
  * @param item item
  * @param namespace namspace
  * @param callback
  */
  add: function(key, item, namespace, callback){
    key = key.toLowerCase();
    //danciStorage.storage[key] = JSON.stringify(item);
    var save = {};
    save[key]={ns: namespace || null, value : item};

    danciStorage.storage.set(save, callback);
  },

  /*
  * @description remove
  * @param key
  */
  remove: function (key, callback) {
    key = key.toLowerCase();
    danciStorage.storage.remove(key, callback);
  },

  /*
  * @description list all keys
  * @param key
  */
  allKeys: function (namespace, callback) {
    var storage = danciStorage.storage;
    storage.get(null, function(items){

      if(!items){
        callback(null);
        return;
      }

      var keys;
      if(namespace){
        keys = [];
        for(key in items){
          var value = items[key];
          if(value.ns && value.ns == namespace){
            keys.push(key);
          }
        }
      }else{
        keys = Object.keys(items);
      }

      callback(keys);
    });
  },

  /*
  * @description get item
  * @param key
  */
  get: function (key, callback) {
    key = key.toLowerCase();

    danciStorage.storage.get(key, function(item){
      callback(item[key] ? {key: key, value: item[key].value} : null);
    });
  },

  /*
  * @description getall
  * @param {json} condition {pageIndex, pageSize:}
  */
  getall: function (condition, callback) {
    condition = $.extend(true, {pageIndex:1, pageSize:10}, condition);

    var dict = danciStorage.storage;
    dict.get(null, function (items) {

      var data = [];
      for(var d in items){
        var save = items[d];

        var r = {};
        r.key = d;
        r.value = save.value;
        if(condition.namespace){
          if(save.ns && condition.namespace == save.ns){
            data.push(r);
          }
        }else{
          data.push(r);
        }
      }

      if(!data.length){
        callback(null);
        return;
      }

      var count = data.length;
      var pageIndex = condition.pageIndex;
      var pageSize = condition.pageSize;

      if(pageIndex <= 0) pageIndex = 1;
      if(pageSize <= 0) pageSize = 10;

      var pages = Math.ceil(count / condition.pageSize);

      var index = (pageIndex - 1) * pageSize;
      if(index >= count) {
        pageIndex = pages;
        index = count - pageSize;
      }

      var result = [];
      for(var i = index; i < pageSize + index && i < data.length; i++){
        result.push(data[i]);
      }

      callback(result, count, pageIndex, pages);
    });
  }
};

function defaultText(op) {
   op=$.extend(op || {},{
        hasDefaultText: ".hasDefaultText",
        removeClass: "hasDefaultText",
        addClass: "hasDefaultText"
    });
    var obj = $(op.hasDefaultText);
    var tmpText = new Array();
    var objIndex = 0;
    for (i = 1; i <= obj.length; i++) {
        tmpText[i - 1] = obj.eq(i - 1).attr('defaultValue');
    }
    obj.focus(function () {
        objIndex = obj.index($(this));
        if ($(this).val() == tmpText[objIndex]) {
            $(this).val("");
            $(this).removeClass(op.removeClass);
        }
    });
    obj.blur(function () {
        objIndex = obj.index($(this));
        if ($(this).val() == "") {
            $(this).val(tmpText[objIndex]);
            $(this).addClass(op.addClass);
        }
    });
}


if (!chrome.runtime) {
    // Chrome 20-21
    chrome.runtime = chrome.extension;
} else if(!chrome.runtime.onMessage) {
    // Chrome 22-25
    chrome.runtime.onMessage = chrome.extension.onMessage;
    chrome.runtime.sendMessage = chrome.extension.sendMessage;
    chrome.runtime.onConnect = chrome.extension.onConnect;
    chrome.runtime.connect = chrome.extension.connect;
}