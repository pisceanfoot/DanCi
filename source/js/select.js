/*
* 选择选择的文字
*/
var selectWord = {

	enabled: true,

	ctrlkey: false,

	setting: null,

	huaci: false,

	/*
	* @description init
	*/
	init : function (config) {
		// TODO

		selectWord._selectWord();

		if(config){
			if(config.onSelect){
				selectWord.onSelect = config.onSelect;

				selectWord.setting = config.setting;
				if(selectWord.setting){
					selectWord.ctrlkey = config.setting.quci_method == "quci_ctrl_dblclick";
					selectWord.enabled = config.setting.open;

					selectWord.huaci = config.setting.quci_huaci == "quci_huaci_open";
				}
			}
		}
	},

	/*
	* @description callback function
	*/
	onSelect: function(word, node){

	},

	/*
	* @private
	* @description select word
	*/
	_selectWord: function(){

		$('body').dblclick(selectNode);

		function selectNode (event) {
			if(!selectWord.enabled){
				selectWord.enabled = true;
				return;
			}

			// ctrl key pressed
			if(selectWord.ctrlkey && 
				(!event.originalEvent.ctrlKey && !event.originalEvent.metaKey)){
				return;
			}

			var selection = selectWord._getSelectContext();
			if(!selection) return;
			// None/Cart/Range
			if(selection.type != "Range") return;

			var selectValue = selection.toString();
			var selectNode = selection.anchorNode.parentNode;
			selectValue = $.trim(selectValue);

			if(selectValue && selectWord.onSelect){
				selectWord.onSelect(selectValue, selectNode);
			}
		}

		var onMouseDown = false;
		var onMouseMove = false;
		$('body').mousedown(function(){
			onMouseDown = true;
		});

		$('body').mousemove(function(){
			if(onMouseDown){
				onMouseMove = true;
			}
		});

		$('body').mouseup(function () {
			if(onMouseDown && onMouseMove){
				onMouseDown = false;
				onMouseMove = false;

				if(!selectWord.enabled){
					selectWord.enabled = true;
					return;
				}

				if(!selectWord.huaci){
					return;
				}

				var selection = selectWord._getSelectContext();
				if(!selection) return;
				// None/Cart/Range
				if(selection.type != "Range") return;

				var selectValue = selection.toString();
				var selectNode = selection.anchorNode.parentNode;
				selectValue = $.trim(selectValue);

				if(selectValue && selectWord.onSelect){
					selectWord.onSelect(selectValue, selectNode, 'huaci');
				}
			}

			onMouseDown = false;
			onMouseMove = false;
		});
	},

	/*
	* @private
	* @description select word method
	*/
	_getSelectContext: function () {
		return window.getSelection();
	}
}