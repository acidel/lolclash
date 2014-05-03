
$(document).ready(function() {
	
	var d = new Date();
	var off = d.getTimezoneOffset();
	var loadUrl = "/ajax/loadcalendar/" + off;

	$.get( loadUrl, function( data ) {
		$( "#lolcalendar" ).html( data );
	});

})