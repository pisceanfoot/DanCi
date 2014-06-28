function main () {
	danciDict.run();
	danciDict.init();
}


$(function(){
	main();
});

/*
* @description 单词字典功能
*/
var danciDict = {

	/*
	* @private
	* @description enable control
	*/
	_running: false,

	/*
	* @private
	* @description 用户设置
	*/
	_setting : null,

	/*
	* @description init
	*/
	init: function () {
		danciStorage.init();
		setTimeout(function(){
			danciStorage.get(resource.CONFIG_SETTING_KEY, function (result) {

				if(result){
					var value = result.value;

					danciDict._running = value.open == "open";
					danciDict._setting = {};
					danciDict._setting.open = danciDict._running;
					danciDict._setting.quci_method = value.quci_method;
					danciDict._setting.quci_pron = value.quci_pron == "quci_pron_open";
					danciDict._setting.quci_shortcut = value.quci_shortcut;
				}

				log.debug(value);

				danciStorage.onChange(danciDict.onStorageChanged);
				selectWord.init({onSelect: danciDict.onSelect, setting: danciDict._setting});

				if(danciDict._running){
					danciDict.showHistory();
				}
			});				
		}, 500);
	},

	/*
	* @description run
	*/
	run: function () {
		danciDict._running = true;
	},

	/*
	* @description show save word
	*/
	showHistory: function(){
		var condition = { namespace: 'word', pageSize: 5000};

		danciStorage.getall(condition, function (alllitems) {
			if(!alllitems) return;

			setTimeout(function(){
				var array = [];
				var arrayKey = [];
				$.each(alllitems, function(i, e){
					if(!e.value) return;
					if(!e.value.fanyi) return;
					
					array.push(e);
					arrayKey.push(e.key);
				});	

				highlight.processAll(arrayKey, function(word, newClass){

					$.each(array, function(i, e){

						if(e.key == word){
							danciDict.onTip(newClass, e.value.fanyi);		
						}
					})
				});

				delete array;
				delete arrayKey;
			}, 500);
		});
	},

	/*
	* @description storage change from popup
	*/
	onStorageChanged: function(changes, namespace){
		for (key in changes) {
		    var storageChange = changes[key];
		    if(!storageChange.newValue){
		    	// del
		    	$('span[class^=danci_highlight]').each(function(i, e){
		    		// destory qtip
		    		var _this = $(e);
		    		var word = _this.data(resource.SAVE_HIGHLIGHT_WORD);
		    		if(key.toLowerCase() == word.toLowerCase()){
						var className = _this.attr('class');
						$('.' + className).qtip().destroy();
						highlight.remove(className);
					}
		    	});
		    }
		}
	},

	/*
	* @description on delete
	*/
	onItemDelete: function(key){
		var removeItem = $('span[class^=danci_highlight]');
		if(!removeItem.length) return;

		removeItem.each(function(i, e){
			var _this = $(e);
			var word = _this.data(resource.SAVE_HIGHLIGHT_WORD);

			if(!word){
				return;
			}
			if(key.toLowerCase() == word.toLowerCase()){
				var className = _this.attr('class');
				$('.' + className).qtip().destroy();
				highlight.remove(className);
			}
		});
	},

	/*
	* @description onSelect
	*/
	onSelect: function (word, node) {
		if(!danciDict._running){
			return;
		}

		bodyTipApi.render();
		
		bingDict.query({word: word, callback: function(result){
			//result: {word:, tt:[fanyi], ps:'pronounce', pron:'mp3'}
			// tt: {acceptation: ,pos:}
			log.debug((result));
			if(!result || !result.tt || !result.tt.length){
				// 没有翻译
				bodyTipApi.set('content.text', '<div class="tip-content"><h4>没有翻译</h4</div>');
				bodyTipApi.show();

				setTimeout(function () {
					bodyTipApi.hide();
				}, 800);
				return;
			}

			var newClassItem = highlight.process(word);
			danciDict.onQuery(result);
			danciDict.onTip(newClassItem, result);

			bodyTipApi.set('content.text', danciDict.itemString(result));
			bodyTipApi.show();
		}});
	},

	/*
	* @description onQuery
	*/
	onQuery: function (result) {
		log.debug(result);

		//{tt:[fanyi], ps:'pronounce', pron:'mp3'}
		danciDict.save(result);

		if(result.pron){
			danciDict.play(result.pron);
		}
	},

	onTip: function (selectItem, item) {
		var highlightItem = $('.' + selectItem);
		highlightItem.data(resource.SAVE_HIGHLIGHT_WORD, item.word);
		
		highlightItem.qtip({
		   content: danciDict.itemString(item),
		   position: {
                  		my: 'bottom center',
						at: 'center',
						viewport: $(window),
						adjust: {
							y: -10
						}
	                  },
            style: { 
      			classes: 'qtip-shadow qtip-rounded qtipex',
      			width: '400px',
				tip: false
   			},
   			show: {
   				event: 'mouseenter'
   			},
   			hide: {
   				event: 'mouseleave',
   				delay: 100
   			},
   			events: {
		        show: function(event, api) {
					bodyTipApi.hide();		            
		        }
		    }
		});

		highlightItem.mouseenter(danciDict.onTipMouseEnter);
		highlightItem.mouseleave(danciDict.onTipMouseLeave);
		highlightItem.dblclick(danciDict.onTipClick);
	},

	/*
	* @description mouse move to tip, play mp3
	*/
	onTipMouseEnter: function () {
		var _this = $(this);
		var word = _this.data(resource.SAVE_HIGHLIGHT_WORD);

		danciStorage.get(word, function(value){
			item = value.value;
			if(!item) return;

			if(danciDict._playAudioTimer){
				clearTimeout(danciDict._playAudioTimer);
			}
			danciDict._playAudioTimer = setTimeout(function() {
				danciDict.play(item.fanyi.pron);
			}, 800);
		});	
	},

	/*
	* @description mouse leave  tip, stop play mp3
	*/
	onTipMouseLeave: function () {
		var _this = $(this);
		var word = _this.data(resource.SAVE_HIGHLIGHT_WORD);

		if(danciDict._playAudioTimer){
			clearTimeout(danciDict._playAudioTimer);
		}

		var item = danciStorage.get(word, function (e) {
			if(!e || !e.value) return;

			danciDict.pause(e.value.fanyi.pron);
		});
		
	},

	/*
	* @description click tip remove saved
	*/
	onTipClick: function (event) {
		if(!danciDict._running){
			return;
		}

		if(danciDict._setting && danciDict._setting.quci_method == "quci_ctrl_dblclick" && !event.originalEvent.ctrlKey){
			return;
		}

		// remove
		if(danciDict._playAudioTimer){
			clearTimeout(danciDict._playAudioTimer);
		}

		var _this = $(this);
		var word = _this.data(resource.SAVE_HIGHLIGHT_WORD);

		// destory qtip
		var className = _this.attr('class');
		$('.' + className).qtip().destroy();

		// remove highlight
		highlight.remove(className);

		// remove data
		danciDict.remove(word);
		selectWord.enabled = false;
	},

	/*
	* @description save
	*/
	save: function (result) {
		// word: word
		// result: {tt:[fanyi], ps:'pronounce', pron:'mp3'}
		danciStorage.add(result.word, {fanyi: result}, 'word');
	},

	/*
	* @description save
	*/
	remove: function (word) {
		// remove data
		danciStorage.remove(word);
	},

	/*
	* @description 单词翻译内容
	*/
	itemString: function (item) {
		//item: {tt:[fanyi], ps:'pronounce', pron:'mp3'}
		//    tt: {acceptation: ,pos:}
		// <div><h4></h4><ul><li></li></ul></div>

		// word  *pronounce*
		// n.
		// web.
		var array = [];
		var strLi = '<li><div class="tip_title">{0}</div> <div class="tip_content">{1}</div></li>';
		if(item.tt){

			$.each(item.tt, function(i, e){
				var tmp = $.framework.format(strLi, decodeURIComponent(e.pos), decodeURIComponent(e.acceptation));
				array.push(tmp);
			});
		}

		var str = '<div class="tip-content"><h4>{0}{1}</h4><ul>{2}</ul></div>';
		var ps = item.ps;
		if(ps){
			ps = ' [' + ps + ']';
		}
		str = $.framework.format(str, item.word, decodeURIComponent(ps), array.join(''));

		return str;
	},

	/*
	* @description play mp3
	*/
	play: function (src) {
		if(danciDict._setting){
			if(danciDict._setting.quci_pron){
				$.playAudio(src).play();	
			}
		}else{
			$.playAudio(src).play();
		}
	},

	/*
	* @description pause
	*/
	pause: function (src) {
		$.playAudio(src).pause();
	}
};

/*
* @description message
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	// TODO: add event drive

    if(sender.tab){
    	// from content script
    	// sender.tab.url
    	return;
    }

   	for(var key in action){
   		action[key](request, sendResponse);
   	}
  });

var action = {
	itemDelete: function (request, sendResponse) {
		// else from extension
	    if(!request.from || request.from != "popup"){
	    	return;
	    }

	    if(request.action == 'delete'){
	    	danciDict.onItemDelete(request.word);
	    }
	},

	getSelection: function (request, sendResponse) {
		// else from extension
	    if(!request.from || request.from != "background"){
	    	return;
	    }

	    if(request.action == 'getSelection'){
	    	sendResponse({data: window.getSelection().toString()});
	    }
	}
};


var bodytip = $('body').qtip({
	   content: '.',
	   position: {
              		my: 'bottom center',
					at: 'center',
					target: 'mouse',
					viewport: $(window),
					adjust: {
							y: -10
					}
                  },
        style: { 
  			classes: 'qtip-shadow qtip-rounded qtipex',
  			width: '400px',
			tip: false
			},
		show: {
			ready:false,
			delay: 10,
			event: false
		},
		hide: {
			delay:10
		},
		events:{
			move: function(event, api){
				var first = this.attr('_x_first');
				if(first){
					api.hide();
				}
				this.attr('_x_first', true);					
			},
			hide: function(){
				this.attr('_x_first', false);
			}
		}
	});

var bodyTipApi = bodytip.qtip('api');