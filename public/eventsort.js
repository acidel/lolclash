$(document).ready(function() {


    $('.matchfilter a').click(function() {

        var $this = $(this);
        var sub = $this.data('sub');


        	$('table#matchtable').each (function (){

				if ($(this).data("sub") === sub) {
					$(this).toggle();
				}
			});


			$('.spacerswitch').each (function (){

				if ($(this).data("sub") === sub) {
					$(this).toggle();
				}

        	});

			switchplus = $this.find(".switchplus").text()
			showhide = $this.find(".showhide").text()

			if (switchplus[0] === "+") {
				$this.find(".switchplus").text("- ")
				$this.find(".showhide").text("Click to Hide")
			}

			else {
				$this.find(".switchplus").text("+ ")
				$this.find(".showhide").text("Click to Show")
			}


        return false;
    });
});