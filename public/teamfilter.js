$(document).ready(function() {
	var i = 0;
	var hidden = 1;

	$('#teammatches table tr').each (function (){
		if (i >= 15) {
			$(this).hide();
		}
		i++;
	});

	$('.showmore').click(function() {
		i = 0;
		

			if (hidden === 1) {

				$('#teammatches table tr').each (function () { 
					$(this).show();
				});

				$(this).text('Hide Results')
				hidden = 0;
			}
			else {
				i = 0;
				$('#teammatches table tr').each (function () { 
					if (i >= 15) {
						$(this).hide();
					}
					i++;
				});
				$(this).text('Show All Results')
				hidden = 1;
			}


		return false;
	});

});