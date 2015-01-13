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

// demo-loginout.js
// ----------------
// Support login usage for the DAL client

// ================================================================

var dalClient = new DALClient();

var disableWhenLoggedOut = [ "#logoutButton", "#dal-operation", "#execute" ];

var disableWhenLoggedIn  = [ "#loginButton", "#baseurl", "#username", "#password", "#autologout"  ];

function initLoginOut() {

    $("#loginButton").click(doLogin);
    $("#loginButton").submit(doLogin);

    $("#logoutButton").click(doLogout);

    $("input[name='responseType']").change(handleResponseTypeChanged);

    updateButtonStates();
}

function updateButtonStates() {

    var disable = function(id) { $(id).attr("disabled","disabled"); };
    var enable  = function(id) { $(id).removeAttr("disabled"); };

    if (dalClient!=null && dalClient.isLoggedIn()) {
	// logged-in
	_.each(disableWhenLoggedIn,  disable);
	_.each(disableWhenLoggedOut, enable);
    }
    else {
	// logged-out (or no dalClient)
	_.each(disableWhenLoggedIn,  enable);
	_.each(disableWhenLoggedOut, disable);
    }
}

function getResponseType() {
    return $("#rt-XML").is(":checked") ? "XML" : "JSON";
}

function doSwitchGroup(groupId) {
    var cb = function(response) {
	var errmsg = response.getResponseErrorMessage();
	if (errmsg==null) {
	    $("#groupId").text(dalClient.getGroupId());
	    $("#groupName").text(dalClient.getGroupName());
	    $("#isAdmin").text(dalClient.isInAdminGroup() ? "YES" : "NO");
	}
	else {
	    alert("Failed to switch/group/"+groupId+"\nError: "+errmsg);
	}
    };
    dalClient.switchGroup(groupId, cb);
}

function handleResponseTypeChanged() {
    if (dalClient!=null) {
	dalClient.setResponseType(getResponseType());
    }
}

function handleListGroupResponse(response) {
    var errmsg = response.getResponseErrorMessage();
    if (errmsg) {
	alert(errmsg);
    }
    else {
	var groups = [];
	response.visitResults(
	    function(tagname, rowdata) {
		groups.push(rowdata);
		return true;
	    },
	    DALUtil.TAG_SYSTEM_GROUP);

	if (groups.length<=0) {
	    alert("No groups listed");
	}
	else {
	    var group0 = groups[0];
	    var groupId = group0[DALUtil.ATTR_SYSTEM_GROUP_ID];
	    var groupName = group0[DALUtil.ATTR_SYSTEM_GROUP_NAME];

	    console.log("Switching to group#" + groupId + ", name=" + groupName);

	    doSwitchGroup(groupId);

	    if (groups.length>1) {
		var gnames = _.reduce(groups,
				  function(memo,ginfo) {
				      memo.push(ginfo[DALUtil.ATTR_SYSTEM_GROUP_NAME]);
				      return memo;
				  },
				  []);

		alert("Auto chose group '"+groupName+"("+groupId+") from Groups:\n\t"+gnames.join("\n\t"));
	    }
	}
    }
}

function createLoginCallback(uname, pword) {
    return function(response) {
	var errmsg = response.getResponseErrorMessage();
	if (errmsg) {
	    if (DALUtil.ERRMSG_ALREADY_LOGIN==errmsg) {
		dalClient.logout();

		console.log("Already logged in: auto-logout and re-login");

		dalClient.login(uname, pword, createLoginCallback(uname, pword));

		//alert("You were already logged in\nand are now logged out.\n\nPlease try again");
	    }
	    else {
		alert("URL:"+dalClient.getBaseUrl()+"\n"+errmsg);
	    }
	}
	else {
	    // Successful login
	    updateButtonStates();

	    $("#userId").text(dalClient.getUserId());
	    $("#writeToken").text(dalClient.getWriteToken());

	    dalClient.performQuery("list/group", handleListGroupResponse);
	}
    };
}


function doLogout() {
    dalClient.logout();

    updateButtonStates();

    $("#userId").text("");
    $("#writeToken").text("");

    $("#groupId").text("");
    $("#groupName").text("");
    $("#isAdmin").text("");

    return false;
}

function doLogin() {
    var responseType = getResponseType();

    var baseurl  = $("#baseurl").val().trim();
    var username = $("#username").val().trim();
    var password = $("#password").val().trim();

    var errmsg = null;
    if (baseurl.length<=0) {
	errmsg = "Please specify DAL URL";
    }
    else if (username.length<=0) {
	errmsg = "Username is required";
    }
    else if (password.length<=0) {
	errmsg = "Password is required";
    }

    if (errmsg) {
	alert(errmsg);
    }
    else {
	var autoLogout = $("#autologout").is(":checked");
	dalClient.setExplicitLogout(! autoLogout);

	dalClient.setBaseUrl(baseurl);
	dalClient.setResponseType(responseType);

	dalClient.login(username, password, createLoginCallback(username, password));
    }
    return false;
}

// ================================================================

$(document).ready(initLoginOut);

