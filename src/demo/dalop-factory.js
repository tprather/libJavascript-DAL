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

function DalOperationFactory() {

    var verbs = "add,change,delete,export,get,import,list,log,logout,map,register,remove,switch,update".split(",");

    // regex, entity, verb
    var patternEntityVerb = [
	[ new RegExp("update/trial/unit/specimen/[\\d]+"), "trialunitspecimen:update" ]
    ];


    var pathToEntityCommand = {
	"list/all/group": "group:list/all",

	"get/login/status": "SYSTEM:get/login/status",
	"logout": "SYSTEM:logout",
	"get/version": "SYSTEM:get/version",
	"list/operation": "SYSTEM:list/operation",
	"switch/group/_id": "SYSTEM:switch/group",
	"_tname/list/field": "SYSTEM:list/field",

	"map/deviceparameter": "device:map/deviceparameter",
	"list/deviceregistration": "device:list/deviceregistration",
	"delete/deviceregistration/_id": "device:delete/deviceregistration/_id",
	"update/deviceregistration/_id": "device:update/deviceregistration/_id"
    };

    var digits = new RegExp("[\\d]+");

    this.createOperation = function(path) {

	var fpathTokens = [];
	var parameters = [];
	var numerics = [];

	_.each(path.split("/"),
	       function(p) {
		   if (p.substring(0,1)=="_") {
		       parameters.push(p);
		   }
		   else if (digits.test(p)) {
		       numerics.push(p);
		   }
		   else {
		       fpathTokens.push(p);
		   }
	       });

	var fp_token1 = fpathTokens[0];
	var fp_token2 = fpathTokens.length>1 ? fpathTokens[1] : null;

	var token1_isVerb = _.contains(verbs, fp_token1);

	var overrideVerbSubject = pathToEntityCommand[path];

	var verb = null;
	var entity = null;

	var parts;

	if (overrideVerbSubject!=null) {
	    parts = overrideVerbSubject.split(":");
	    entity = parts[0];
	    verb = parts[1];
	}
	else {
	    var info = _.reduce(
		patternEntityVerb,
		function(result, pev) {
		    if (result==null) {
			var regex = pev[0];
			if (regex.test(path)) {
			    result = pev[1];
			}
		    }
		    return result;
		},
		null);

	    if (info!=null) {
		parts = info.split(":");
		entity = parts[0];
		verb = parts[1];
	    }

	    if (entity==null) {
		if (token1_isVerb) {
		    entity = fp_token2;
		    verb = fp_token1;
		}
		else {
		    entity = fp_token1;
		    verb = StringUtil.join("/",fpathTokens.subList(1, fpathTokens.size()));
		}
	    }
	}

	return {
	    "entity": entity,
	    "verb": verb,
	    "parameters": parameters,
	    "path": path
	};

    };
}


