/*
* 查询 bing dict
*/
var bingDict = {
	query : function (arg) {
		
		log.debug("bing 字典查询参数：");
		log.debug(arg);

		// example
		// http://dict.bing.com.cn/io.aspx?&t=dict&ut=default&ulang=ZH-CN&tlang=EN-US&q=manager 
		$.getJSON("http://dict.bing.com.cn/io.aspx?",
			{
				t:"dict",
				ut:"default",
				ulang:"ZH-CN",
				tlang:"EN-US",
				q:arg.word
			},
			function(result){

				log.debug("bing 查询返回结果:");
				log.debug(result);

				result = bingDict._getResult(arg.word, result);
				if(arg.callback){
					arg.callback(result);
				}
			});
	},

	_getResult: function(word, a){
		var b, c = {}, d, e, f, g, h;
		c.word = word;
	    c.tt = [];
	    var i, j, k = a.ROOT;
	    return k.DEF && (c.ps = k.PROS.PRO ? k.PROS.PRO.length ? k.PROS.PRO[0].$ : k.PROS.PRO.$ : "", c.pron = k.AH ? "http://media.engkoo.com:8129/en-us/" + k.AH.$ + ".mp3" : "", d = k.DEF[0].SENS, d && (d.length || (d = [d]), $.each(d, function (a, b) {
	        var d;
	        if (b.SEN.length) {
	            d = [];
	            for (var e = 0; e < b.SEN.length; e += 1) d.push(b.SEN[e].D.$);
	            d = d.join(",")
	        } else d = b.SEN.D.$;
	        c.tt.push({
	            pos: b.$POS + ".",
	            acceptation: d
	        })
	    }))), c
		
	}
}