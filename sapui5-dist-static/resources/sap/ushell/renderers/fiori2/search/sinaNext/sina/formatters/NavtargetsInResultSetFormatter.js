// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sinaDefine(['../../core/core','./Formatter','../../core/util'],function(c,F,u){"use strict";return F.derive({initAsync:function(){},format:function(r){return r;},formatAsync:function(r){r=u.addPotentialNavTargetsToAttribute(r);return c.Promise.resolve(r);}});});
