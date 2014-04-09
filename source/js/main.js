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
						$('.' + className).qtip('destroy');
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

		removeItem = removeItem.eq(0);

		var _this = $(removeItem);
		var word = _this.data(resource.SAVE_HIGHLIGHT_WORD);
		if(key.toLowerCase() == word.toLowerCase()){
			var className = _this.attr('class');
			$('.' + className).qtip('destroy');
			highlight.remove(className);
		}
	},

	/*
	* @description onSelect
	*/
	onSelect: function (word, node) {
		if(!danciDict._running){
			return;
		}

		var newClassItem = highlight.process(word);
		bingDict.query({word: word, callback: function(result){
			//result: {word:, tt:[fanyi], ps:'pronounce', pron:'mp3'}
			// tt: {acceptation: ,pos:}
			danciDict.onQuery(result);
			danciDict.onTip(newClassItem, result);
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
                  		corner: {
                  			tooltip: 'bottomMiddle',
	                     	target: 'topMiddle'
	                  	},
	                  	adjust: {
							screen: true
						}
	                  },
            style: { 
      			name: 'cream',
      			width: '400px',
      			border: {
			         width: 7,
			         radius: 5,
			         color: '#A2D959'
			      }
   			},
		   	show: 'mouseover',
		   	hide: 'mouseout'
		})

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

			danciDict.play(item.fanyi.pron);
		});

		
	},

	/*
	* @description mouse leave  tip, stop play mp3
	*/
	onTipMouseLeave: function () {
		var _this = $(this);
		var word = _this.data(resource.SAVE_HIGHLIGHT_WORD);

		var item = danciStorage.get(word, function (e) {
			danciDict.pause(e.value.fanyi.pron);
		});
		
	},

	/*
	* @description click tip remove saved
	*/
	onTipClick: function () {
		// remove

		var _this = $(this);
		var word = _this.data(resource.SAVE_HIGHLIGHT_WORD);

		// destory qtip
		var className = _this.attr('class');
		$('.' + className).qtip('destroy');

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
		var strLi = '<li><span>{0}</span> <p>{1}</p></li>';
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

function deleteItem (key) {
	danciDict.onItemDelete(key);
}