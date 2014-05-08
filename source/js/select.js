/*
* 选择选择的文字
*/
var selectWord = {

	enabled: true,

	ctrlkey: false,

	setting: null,

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

			if(selectWord.ctrlkey && !event.originalEvent.ctrlKey){
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
	},

	/*
	* @private
	* @description select word method
	*/
	_getSelectContext: function () {
		return window.getSelection();
	}
}