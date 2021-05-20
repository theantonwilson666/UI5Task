// Copyright (c) 2009-2020 SAP SE, All Rights Reserved
sinaDefine(['./core'],function(c){"use strict";var D=c.Exception.derive({_init:function(p){p.message='Duplicate node';c.Exception.prototype._init.apply(this,arguments);this.node=p.node;}});var N=c.defineClass({_init:function(p,n,l){this.parent=p;this.nodeId=n;this.labelCalculator=l;this.childMap={};this.children=[];},insert:function(k,o){if(k.length===0){this.data=this.labelCalculator.options.data(o);this.obj=o;this.calculateLabel();return;}var a=k[0];var s=this.childMap[a];if(k.length===1&&s){throw new D({node:s});}if(!s){s=new N(this,a,this.labelCalculator);this.childMap[a]=s;this.children.push(s);if(this.children.length===2){this.children[0].recalculateLabels();}}s.insert(k.slice(1),o);},recalculateLabels:function(){var l=[];this.collectLeafs(l);for(var i=0;i<l.length;++i){l[i].calculateLabel();}},collectLeafs:function(l){if(this.isLeaf()){l.push(this);return;}for(var i=0;i<this.children.length;++i){this.children[i].collectLeafs(l);}},isLeaf:function(){return this.children.length===0;},hasSibling:function(){return this.parent&&this.parent.children.length>=2;},isChildOfRoot:function(){return this.parent&&this.parent.nodeId==='__ROOT';},collectPath:function(k,f){if(!this.parent){return;}if(f||this.hasSibling()||this.isChildOfRoot()){k.push(this.nodeId);f=true;}if(this.parent){this.parent.collectPath(k,f);}},calculateLabel:function(){var k=[];this.collectPath(k);k.reverse();this.labelCalculator.options.setLabel(this.obj,k,this.data);}});return c.defineClass({_init:function(o){this.options=o;this.rootNode=new N(null,'__ROOT',this);},calculateLabel:function(o){var k=this.options.key(o);try{this.rootNode.insert(k,o);}catch(e){if(e instanceof D){this.options.setFallbackLabel(e.node.obj,e.node.data);this.options.setFallbackLabel(o,this.options.data(o));return;}throw e;}}});});