var SaveHandler = {};
SaveHandler.runner = {};

SaveHandler.script_wraper = function() {
	this.content = "";
	this.write = function(text) {
		this.content = this.content + text;
		return this;
	};
	this.line = function() {
		this.content = this.content + "\n";
		return this;
	};
	this.writeln = function(text) {
		this.write(text);
		this.line();
		return this;
	}
};