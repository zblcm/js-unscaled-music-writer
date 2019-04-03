var FileHandler = {};

FileHandler.browse_folder = function(success_callback, failure_callback) {
	FileHandler.selector = document.createElement('input');
	FileHandler.selector.type = 'file';
	FileHandler.selector.onchange = function(result) {
		if (result && result.path[0] && result.path[0].files[0]) {
			let file = result.path[0].files[0];
			if (success_callback) success_callback(file);
		}
		else if (failure_callback) failure_callback(result);

	};
	FileHandler.selector.click();
};

FileHandler.get_file_url = function(file, callback) {
	let oFReader = new FileReader();
	oFReader.readAsDataURL(file);
	oFReader.onloadend = function (oFREvent) {
		let src = oFREvent.target.result;
		callback(src);
	};
};
FileHandler.read_string_from_file = function(file, callback) {
	if (file) {
		let reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function(event) {
			callback(event.target.result);
		};
	}
};
FileHandler.interpret = function(string) {
	let script = document.createElement("script");
	script.type = "text/javascript";
	try {
		script.appendChild(document.createTextNode(string));
	} catch (ex) {
		script.text(string);
	}
	document.body.appendChild(script);
};

FileHandler.save = function(value, type, name) {  
    let blob;  
    if (typeof window.Blob == "function") {  
        blob = new Blob([value], {type: type});  
    } else {  
        let BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;  
        let bb = new BlobBuilder();  
        bb.append(value);  
        blob = bb.getBlob(type);  
    }  
    let URL = window.URL || window.webkitURL;  
    let bloburl = URL.createObjectURL(blob);  
    let anchor = document.createElement("a");  
    if ('download' in anchor) {  
        anchor.style.visibility = "hidden";  
        anchor.href = bloburl;  
        anchor.download = name;  
        document.body.appendChild(anchor);  
        let evt = document.createEvent("MouseEvents");  
        evt.initEvent("click", true, true);  
        anchor.dispatchEvent(evt);  
        document.body.removeChild(anchor);  
    } else if (navigator.msSaveBlob) {  
        navigator.msSaveBlob(blob, name);  
    } else {  
        location.href = bloburl;  
    }  
};

/*
function Save(){  
    doSave(a, "text/latex", "hello.txt");   
}
*/