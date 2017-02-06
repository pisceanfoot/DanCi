/*
* 查询 bing dict
*/
var bingDict = {
	query : function (arg, callback) {
		
		log.debug("bing 字典查询参数：");
		log.debug(arg);

		// example
		// http://dict.bing.com.cn/io.aspx?&t=dict&ut=default&ulang=ZH-CN&tlang=EN-US&q=manager 
		//result: {word:, tt:[fanyi], ps:'pronounce', pron:'mp3'}
		// tt: {acceptation: ,pos:}

		$.get("https://cn.bing.com/dict/search",
			{
				q:arg.word
			},
			function(result){

				log.debug("bing 查询返回结果:");
				// log.debug(result);

				var obj = bingDict._parseHtml(result);
				arg.callback(obj);
			});
	},

	_parseHtml: function(content){
		var html = $(content);

		var word = html.find('#headword h1 strong').text();
		var ps = html.find('.hd_p1_1 .hd_prUS').text();
		if(ps){
			ps = ps.replace('美', '');
		}else{
			ps = html.find('.hd_p1_1').text();
		}
		if(ps){
			ps = ps.replace(/\[/g, '');
			ps = ps.replace(/\]/g, '');	
		}

		var posList = html.find('li .pos');
		var defList = html.find('li .def');

		var p = html.find('.hd_p1_1 .hd_tf a');
		p = p.attr('onclick');

		var pv = bingDict._find(p, 'BilingualDict', 'https:', '.mp3');
		if(pv){
			pv = 'https:' + pv + '.mp3'
		}else{
			pv = null;
		}

		// {
		// 		"pron":"http://media.engkoo.com:8129/en-us/54A17585AAA89B4DCF8AC87173E33D4A.mp3",
		// 		"ps":"ək'septəns",
		// 		"tt":[
		// 			{
		// 				"acceptation":"接受;验收,接受,接纳,承受,答应,承认;(政党候选人)接受提名,认可,容纳","pos":"n."},
		// 				{"acceptation":"接受,承兑,接纳,验收,承诺","pos":"web."}
		// 		],
		// 		"word":"Acceptance"}
		
		var wordObj = {
			word: word,
			pron: pv,
			ps: ps.trim()
		};

		var tt = [];
		posList.each(function(i){
			var pos = posList.eq(i);
			var def = defList.eq(i);

			var tmp = {};
			tmp.acceptation = def.text();
			tmp.pos = pos.text();

			log.debug("bing 翻译结果:", tmp);
			tt.push(tmp);
		});

		wordObj.tt = tt;

		// console.log(wordObj);
		// console.log(ps);
		// console.log(p);
		// console.log(pv);
		return wordObj;
	},

	_find: function(content, start, find, end){
		if(!content){
			return;
		}

		var tmp = null;
		if(start){
			var index = content.indexOf(start);
			if(index == -1){
				return;
			}

			tmp = content.substr(index + start.length);
		}else{
			tmp = content;
		}

		var firstIndex = tmp.indexOf(find);
		if(firstIndex == -1){
			return;
		}

		var lastIndex = tmp.indexOf(end, firstIndex + find.length);
		if(lastIndex == -1){
			return;
		}

		return tmp.substr(firstIndex + find.length, lastIndex - firstIndex - find.length);
	}
}
