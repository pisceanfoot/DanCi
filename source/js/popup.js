/*
* @description popup
*/
var popup = {
	container: '#dict_word',

	/*
	* @description condition
	*/
	condition: {pageIndex : 1},

	/*
	* @description init function
	*/
	init: function () {
		danciStorage.	init();
		popup.list();

		$('#pagepre').click(function () {
			if(popup.condition.pageIndex > 1){
				popup.condition.pageIndex--;
				popup.list();
			}
		});
		$('#pagenext').click(function () {
			popup.condition.pageIndex++;
			popup.list();
		});

		$('#searchAction').click(popup.searchEvent());
	},

	/*
	* @description search
	*/
	search: function (keyword) {
		
	},

	/*
	* @description list all
	*/
	list: function(){

		danciStorage.getall(popup.condition, function(result, count, pageIndex, pages){

			log.debug(result);

			if(!result){
				$(popup.container).html('');
				$('#w_count').html('0');
				$('.navi').hide();
				return;
			}

			var all = [];
			for(var tmpKey in result){
				var value = result[tmpKey].value;
				if(!value) continue;

				var item = value.fanyi;

				var array = [];
				var strLi = '<li><div class="tip_title">{0}</div> <div class="tip_content">{1}</div></li>';
				if(item.tt){

					$.each(item.tt, function(i, e){
						var tmp = $.framework.format(strLi, decodeURIComponent(e.pos), decodeURIComponent(e.acceptation));
						array.push(tmp);
					});
				}

				var str = '<div class="item" w="{0}">\
					        <div class="word"><h4>{0} [{1}]</h4><a href="javascript:void(0);" class="pron"></a>\
					            <div class="right">\
					                <span></span><a class="del" href="javascript:void(0);"></a>\
					            </div>\
					        </div>\
					        <ul>\
					            {2}\
					        </ul>\
					    </div>';

				str = $.framework.format(str, item.word, decodeURIComponent(item.ps), array.join(''));
				all.push(str);
			}

			$(popup.container).html('');
			$(popup.container).append(all.join(''));
			$('#w_count').html(count);
			$('#w_page').html(pageIndex + '/' + pages);

			$(popup.container + ' .del').click(popup.removeEvent);
			$(popup.container + ' .pron').click(popup.pronEvent);

			popup.condition.pageIndex = pageIndex;
		});
	},

	/*
	* @description bind remove event
	*/
	removeEvent: function () {
		// .item
		// remove .item
		var parent = $(this).parents('.item');
		var word = parent.attr('w');
		if(word){
			// delete
			danciStorage.remove(word);

			// reload
			popup.list();

			// call content
			var code = "deleteItem('" + word + "');";
			chrome.tabs.executeScript(null, {code:code});

			/*
			chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
				if(!tabs) return;

				chrome.tabs.sendMessage(tags[0], {from: 'popup', message: 'remove', data: word});
			});*/
		}
	}, 

	/*
	* @description bind pron event
	*/
	pronEvent: function(){
		var parent = $(this).parents('.item');
		var word = parent.attr('w');
		if(word){
			danciStorage.get(word, function(item){
				if(item.value.fanyi.pron)
					$.playAudio(item.value.fanyi.pron).play();
			});
		}
	},

	/*
	* @description search
	*/
	searchEvent: function () {
		
	}
};

$(function(){
	popup.init();
});