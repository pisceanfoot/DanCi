/*
 * @description popup
 */
var popup = {
  container: "#dict_word",

  /*
   * @description condition
   */
  condition: { pageIndex: 1, namespace: "word" },

  /*
   * @description init function
   */
  init: function () {
    danciStorage.init();
    popup.list();

    $("#pagepre").click(function () {
      if (popup.condition.pageIndex > 1) {
        popup.condition.pageIndex--;
        popup.list();
      }
    });
    $("#pagenext").click(function () {
      popup.condition.pageIndex++;
      popup.list();
    });

    $("#keyword").keydown(function (e) {
      if (e.which == 13) {
        popup.searchEvent();
      }
    });
    $("#searchAction").click(popup.searchEvent);
    $("#searchActionD").click(popup.searchEvent);

    defaultText();
  },

  /*
   * @description list all
   */
  list: function () {
    danciStorage.getall(
      popup.condition,
      function (result, count, pageIndex, pages) {
        log.debug(result);

        if (!result || !result.length) {
          $(popup.container).html("");
          $("#w_count").html("0");
          //$('.navi').hide();
          return;
        }

        var all = [];
        for (var tmpKey in result) {
          var value = result[tmpKey].value;
          if (!value) continue;

          var item = value.fanyi;

          var array = [];
          var strLi =
            '<li><div class="tip_title">{0}</div> <div class="tip_content">{1}</div></li>';
          if (item.tt) {
            $.each(item.tt, function (i, e) {
              var tmp = $.framework.format(
                strLi,
                decodeURIComponent(e.pos),
                decodeURIComponent(e.acceptation)
              );
              array.push(tmp);
            });
          }

          var str =
            '<div class="item" w="{0}">\
					        <div class="word"><h4>{0}{1}</h4><a href="#" class="pron"></a>\
					            <div class="right">\
					                <span></span><a class="del" href="#"></a>\
					            </div>\
					        </div>\
					        <ul>\
					            {2}\
					        </ul>\
					    </div>';

          var ps = item.ps;
          if (ps) {
            ps = " [" + ps + "]";
          }
          str = $.framework.format(
            str,
            item.word,
            decodeURIComponent(ps),
            array.join("")
          );
          all.push(str);
        }

        $(popup.container).html("");
        $(popup.container).append(all.join(""));
        $("#w_count").html(count);
        $("#w_page").html(pageIndex + "/" + pages);

        $(popup.container + " .del").click(popup.removeEvent);
        $(popup.container + " .pron").click(popup.pronEvent);

        popup.condition.pageIndex = pageIndex;
      }
    );
  },

  /*
   * @description bind remove event
   */
  removeEvent: function () {
    event.preventDefault();
    // .item
    // remove .item
    var parent = $(this).parents(".item");
    var word = parent.attr("w");
    if (word) {
      // delete
      danciStorage.remove(word);

      // reload
      popup.list();

      // call content
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { from: "popup", action: "delete", word: word },
          function (response) {}
        );
      });
    }
  },

  /*
   * @description bind pron event
   */
  pronEvent: function () {
    event.preventDefault();

    var parent = $(this).parents(".item");
    var word = parent.attr("w");
    if (word) {
      danciStorage.get(word, function (item) {
        if (item.value.fanyi.pron) $.playAudio(item.value.fanyi.pron).play();
      });
    }
  },

  /*
   * @description search
   */
  searchEvent: function () {
    event.preventDefault();

    var keywordInput = $("#keyword");
    var keyword = keywordInput.val();
    var defaultValue = keywordInput.attr("defaultValue");
    if (keyword == defaultValue) return;

    // http://cn.bing.com/dict/search?q=word
    var searchUrl =
      "http://cn.bing.com/dict/search?q=" + encodeURIComponent(keyword);
    chrome.tabs.create({ url: searchUrl });
  },
};

/*
 * @description popupUI
 */
var popupUI = {
  /*
   * @description init
   */
  init: function () {
    $("#options").click(function (event) {
      chrome.tabs.create({ url: "html/option.html" });
    });
  },
};

$(function () {
  popupUI.init();
  popup.init();
});
