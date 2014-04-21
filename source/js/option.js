var option = {
	init: function () {

		danciStorage.init();
		
		function setOptionItem(id, group, active){
	 		$('.option_col a').each(function(i, e){
	 			e = $(e);
	 			var tmpgroup = e.attr('name');
	 			if(tmpgroup != group){
	 				return;
	 			}
	 			var tmpid = e.attr('id');
	 			if(tmpid == id){
	 				if(active){
				 		e.removeClass('dis');
				 		e.addClass('green');
				 	}else{
						e.addClass('dis')
						e.removeClass('green');
				 	}
	 				return;
	 			}

	 			if(!active){
			 		e.removeClass('dis');
			 		e.addClass('green');
			 	}else{
					e.addClass('dis')
					e.removeClass('green');
			 	}

	 		});
	 	}

		danciStorage.get(resource.CONFIG_SETTING_KEY, function (result) {
			if(result){
				var value = result.value;
				for(var key in value){
					setOptionItem(value[key], key, true);
				}
			}

			$(".option_col a").click(option.clickSetting);
			defaultText();
		});		
	},

	 clickSetting: function () {
	 	var _this = $(this);
	 	var active = _this.hasClass('green');

	 	active = !active;
	 	if(active){
	 		_this.removeClass('dis');
	 		_this.addClass('green');
	 	}else{
			_this.addClass('dis')
			_this.removeClass('green');
	 	}

	 	var id = _this.attr('id');
	 	var group = _this.attr('name');	

	 	setOthers(id, group, !active)

	 	danciStorage.get(resource.CONFIG_SETTING_KEY, function (result) {
	 		var value;
			if(result){
				value = result.value;
			}else{
				value = {};
			}

			$('.option_col a').each(function(i, e){
	 			e = $(e);
	 			var xgroup = e.attr('name');
	 			var xid = e.attr('id');

	 			if(e.hasClass('green')){
	 				value[xgroup] = xid;
	 			}
	 		});

			danciStorage.add(resource.CONFIG_SETTING_KEY, value);
		});	

	 	function setOthers(id, group, active){
	 		$('.option_col a').each(function(i, e){
	 			e = $(e);
	 			var tmpgroup = e.attr('name');
	 			if(tmpgroup != group){
	 				return;
	 			}
	 			var tmpid = e.attr('id');
	 			if(tmpid == id){
	 				return;
	 			}

	 			if(active){
			 		e.removeClass('dis');
			 		e.addClass('green');
			 	}else{
					e.addClass('dis')
					e.removeClass('green');
			 	}

	 		});
	 	}
	 }
}



$(function(){
	option.init();
});