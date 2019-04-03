var SaveHandler = {};

SaveHandler.writer = function() {
	this.content = "";
	this.write = function(text) {
		this.content = this.content + text.toString();
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

SaveHandler.get_save_text = function() {
	let writer = new SaveHandler.writer();
    writer.writeln("MenuHandler.file_new();");

    // TODO:: create instruments.

    // correct bar number.
    writer.write("while (Editor.bars.length < ").write(Editor.bars.length).writeln(") Editor.create_bar();");
    writer.write("while (Editor.bars.length > ").write(Editor.bars.length).writeln(") Editor.remove_bar();");

	// create notes.
	for (let i in Editor.notes) {
		let note = Editor.notes[i];
		writer.
		write("Editor.create_note(InstrumentHandler.instruments[").
		write(InstrumentHandler.instruments.indexOf(note.instrument)).
		write("], new Fraction(").
        write(note.sx.u).
        write(", ").
        write(note.sx.d).
        write("), new Fraction(").
        write(note.ex.u).
        write(", ").
        write(note.ex.d).
        write("), new Fraction(").
        write(note.y.u).
        write(", ").
        write(note.y.d).
        write("), ").
        write(note.st_volume).
        write(", ").
        write(note.ed_volume).
        writeln(")");
	}

	return writer.content;
};

