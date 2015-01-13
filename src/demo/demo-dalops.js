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

// demo-dalops.js

var messages = new MessageLogger();

function initDalopTests() {
    $("#execute").click(doDalCommand);
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function handleGenericCommandResponse(response) {

    var errmsg = response.getResponseErrorMessage();
    if (errmsg!=null) {
	alert(errmsg);
    }
    else {
	var error = null;
	var results = {};
	response.visitResults(function(tagname, rowdata) {
	    if (tagname==null) {
		error = rowdata[DALUtil.TAG_ERROR];
		return false;
	    }
	    var list = results[tagname];
	    if (list==null) {
		list = [];
		results[tagname] = list;
	    }
	    list.push(rowdata);
	    return true;
	});

	if (error) {
	    alert(error);
	}
	else {
	    if (_.size(results)<=0) {
		alert("No results");
	    }
	    else {
		messages.emitMessage(response.url, "Results:", results);

		console.log("Results for "+response.url);
		_.each(results,
		       function(list, key) {
			   console.log(key+": "+list.length+" results");
		       });
	    }
	}
    }
};

// For later
function handleAddOrUpdateResponse(response) {
	var errmsg = response.getResponseErrorMessage();
	if (errmsg!=null) {
	    alert(errmsg);
	}
	else {
	    var msg = response.getRecordFieldValue(DALUtil.TAG_INFO, DALUtil.ATTR_MESSAGE);
	    var id  = response.getRecordFieldValue(DALUtil.TAG_RETURN_ID, DALUtil.ATTR_VALUE);
	    if (id!=null) {
		msg += "\nid="+id;
	    }
	    alert("Success:\n"+msg);
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function doDalCommand() {
    var cmd = $("#dal-operation").val().trim();
    if (cmd=="") {
	alert("No command");
    }
    else {
	dalClient.performQuery(cmd, handleGenericCommandResponse);
    }
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

$(document).ready(initDalopTests);
