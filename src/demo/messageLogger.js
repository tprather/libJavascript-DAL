//
// dalclient library - provides utilities to assist in using KDDart-DAL servers
// Copyright (C) 2015  Diversity Arrays Technology
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// messageLogger.js

function MessageLogger() {

    var initialised = false;

    var $messageList = null;

    var nMessages = 0;

    var minResizableHeight = 60;
    var maxMessageHeight = 400;
    var messageZ = 10;

    var previousTopMessage = null;

    var closeResultMessage = function() {
	$(this).parent().parent().remove();
    };

    var messageToTop = function() {
	if (previousTopMessage!=null) {
	    $(previousTopMessage).css("z-index", messageZ);
	}
	$(this).css("z-index", messageZ+1);

	previousTopMessage = this;
    };

    var collectMessage = function(name, obj) {
	var s = "";
	if ($.isArray(obj)) {
	    s += "<b>"+_.escape(name||"")+"</b>";
	    s += " [array.len="+obj.length+"]";
	    s += "<ol>";
	    $.each(obj,function(idx,elt) {
		s += "<li>";
		s += collectMessage(null, elt);
		s += "</li>";
	    });
	    s += "</ol>";
	}
	else if (typeof obj=="object") {
	    // TODO: insert the 'class' of the object
	    s += (name||"") + "{<ul>";
	    for (k in obj) {
		if (obj.hasOwnProperty(k)) {
		    s += "<li>"+collectMessage(k, obj[k])+"</li>";
		}
	    }
	    s += "</ul>}";
	}
	else {
	    if (name) {
		s = _.escape(name)+": ";
	    }
	    s += _.escape(JSON.stringify(obj));
	}
	return s;
    };

    this.collectMessage = collectMessage;

    this.emitMessage = function(title, text, obj) {

	if (! initialised) {
	    _initialise();
	}

	if ($messageList==null) {
	    var $li, s;
	    if (typeof obj=="object") {
		s = collectMessage(text, obj);
	    }
	    else {
		s = "<div>"+text+"</div>";
	    }

	    ++nMessages;

	    var msgid = "msg-"+nMessages;
	    var $msgtitle = $("<div class='title-resultMessage ui-widget-header'>"+
			      "<button class='close-resultMessage' id='"+msgid+"'>x</button>"+
			      nMessages+": "+title+"</div>");

	    var $msg = $("<div class='resultMessage ui-widget-content'></div>");
	    $msg.append($msgtitle);

	    var $msgbody = $("<div class='body-resultMessage'/>");
	    $msg.append($msgbody);

	    $msgbody.append(s);

	    var x = ((nMessages % 10) + 1) * 20;
	    var y = ((nMessages % 10) + 1) * 40;

	    y += $(window).scrollTop();

	    $msg.css("left", x+"px");
	    $msg.css("top",  y+"px");
	    $msg.css("z-index", messageZ);

	    try {
		$("body").append($msg);
	    }
	    catch (ex) {
		console.log(ex);
	    }

	    var msghyt = $msg.height();
	    var titlehyt = $msgtitle.outerHeight();

	    var bodyhyt = $msgbody.height();
	    //console.log("heights: msg="+msghyt+"  title="+titlehyt+"  body="+bodyhyt);

	    if (msghyt > maxMessageHeight) {
		msghyt = maxMessageHeight;
		$msg.css("height", msghyt+"px");
	    }

	    bodyhyt = msghyt - titlehyt;
	    if (bodyhyt > maxMessageHeight) {
		bodyhyt = maxMessageHeight;
	    }
	    //console.log("      : msg="+msghyt+"  title="+titlehyt+"  body="+bodyhyt);
	    $msgbody.css("height", bodyhyt+"px");

	    $("#"+msgid).click(closeResultMessage);
	    $msg.click(messageToTop);

	    $msg.draggable({handle: "div.ui-widget-header" });

	    if (bodyhyt >= minResizableHeight) {
		$msg.resizable();
		var rfunc = function(th, $mbody) {
		    return function() {
			var thishyt = $(this).height();
			$mbody.css("height", (thishyt - th)+"px");
		    };
		}(titlehyt, $msgbody);

		$msg.resize(rfunc);
	    }
	}
	else {
	    if (obj==null) {
		$li = $("<li><b>"+_.escape(title)+"</b>:"+_.escape(text)+"</li>");
	    }
	    else if (typeof obj=="object") {
		var s = collectMessage(text, obj);
		// TODO: insert the 'class' of the object
		$li = $("<li><b>"+title+":</b><br/>"+s+"</li>");
	    }
	    else {
		$li = $("<li><b>"+_.escape(title)+"</b>:"+_.escape(text)+"<br/>"+obj+"</li>");
	    }
	    $messageList.append($li);
	}
    };

    var _initialise = function(messageListDiv) {

	initialised = true;

	if (messageListDiv!=null) {
	    var $clearButton = $("<button>Clear</button>");
	    $(messageListDiv).append($clearButton);
	    $messageList = $("<ul></ul>");
	    $(messageListDiv).append($messageList);

	    $clearButton.bind("click", function(){$messageList.empty();});
	}
	else {
	    var lines = [];
	    lines.push(".resultMessage {");
	    lines.push("   position: absolute;");
	    lines.push("   border: 4px solid brown;");
	    lines.push("   background: #ccffff;");
	    lines.push("}");
	    lines.push(".title-resultMessage {");
	    lines.push("   display: inline-block;");
	    lines.push("   margin-top: 0;");
	    lines.push("   width: 100%;");
	    lines.push("   background: #44f0f0;");
	    lines.push("   border-bottom: 3px double black;");
	    lines.push("   cursor: move;");
	    lines.push("}");
	    lines.push(".body-resultMessage {");
	    lines.push("   overflow: scroll;");
	    lines.push("}");
	    lines.push(".close-resultMessage {");
	    lines.push("   display: inline-block;");
	    lines.push("   color: red;");
	    lines.push("   text-align: center;");
	    lines.push("}");

	    var style = "<style>\n" + lines.join("\n") + "</style>";
	    $("head").append(style);
	}
	initialised = true;
    };

    this.initialise = _initialise;

};
