$(document).ready(function() {
    $('.filtertable a').click(function() {

        var $this = $(this)
        var region = $this.data('region');
        var hotness = $this.data('hotness');

        if (hotness === 1) {
        	$('tr').hide();
        	$('tr[data-hotness=' + hotness + ']').show();

        	$('img.switch').each (function (){
				$(this).attr('src', $(this).attr('src').replace('h_', 'd_'));
				if ($(this).data("hotness") === hotness) {
					$(this).attr('src', $(this).attr('src').replace('d_', 'h_'));
				}

        	});

        }

        else {

        	$('img.switch').each (function (){
				$(this).attr('src', $(this).attr('src').replace('h_', 'd_'));
				if ($(this).data("region") === region) {
					$(this).attr('src', $(this).attr('src').replace('d_', 'h_'));
				}

        	});

        
	        if (region === 'all') {
	        	$('tr').show();
	        }
	        else {
			    $('tr[data-region=' + region + ']').show();
			    $('tr[data-region!=' + region + ']').hide();
	    	}

	   	}
	   	return false;
	   	alternateColor();
    });
});