function main () {
	danciDict.init();
	danciDict.run();
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
	* @description init
	*/
	init: function () {
		danciStorage.init();
		danciStorage.onChange(danciDict.onStorageChanged);
		selectWord.init({onSelect: danciDict.onSelect});

		//var config = danciStorage.get(resource.CONFIG_SETTING_KEY);
		//if(config){
			// TODO
		//}

		danciDict.showHistory();
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
				$.each(alllitems, function(i, e){
					if(!e.value) return;
					
					var selectedItem = highlight.process(e.key);
					danciDict.onTip(selectedItem, e.value.fanyi);
				});	
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
	onTipClick: function () {
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

		var str = '<div class="tip-content"><h4>{0} [{1}]</h4><ul>{2}</ul></div>';
		str = $.framework.format(str, item.word, decodeURIComponent(item.ps), array.join(''));

		return str;
	},

	/*
	* @description play mp3
	*/
	play: function (src) {
		$.playAudio(src).play();
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

    // else from extension
    if(!request.from || request.from != "popup"){
    	return;
    }

    if(request.action == 'delete'){
    	danciDict.onItemDelete(request.word);
    }
  });


var bodytip = $('body').qtip({
	   content: '.',
	   position: {
              		my: 'bottom center',
					at: 'center',
					target: 'mouse',
					viewport: $(window)
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
			delay:1000
		},
		events:{
			move: function(){
				var first = this.attr('_x_first');
				console.log('move');
				console.log(first);
				if(first){
					this.qtip().hide();
					console.log('hide');
				}
				this.attr('_x_first', true);					
			},
			hide: function(){
				this.attr('_x_first', false);
			}
		}
	});

var bodyTipApi = bodytip.qtip('api');