$(document).ready(function() {
	$('.delta').hide();

	function alternateColor () {
		var curDate;
		var lb = true;
		var i = 0;
		$('.date').each (function (){
			$this = $(this);

			if (i === 0){
				curDate = $this.text();
				$this.removeClass("lp");
				$this.addClass("lb");
			}
			else if ($this.text() !== curDate)
			{
				if (lb)
					{
						$this.removeClass("lb");
						$this.addClass("lp");
					}
				else
					{
						$this.removeClass("lp");
						$this.addClass("lb");
					}
				lb = !lb;
				curDate = $this.text();
			}
			else if (lb) {
				$this.removeClass("lp");
				$this.addClass("lb");
			}
			else {
				$this.removeClass("lb");
				$this.addClass("lp");
			}
			i++;
		})
		return false;
	}

	alternateColor();

	function makeHtml(result1, result2) {
		console.log ("here")
		html = "<span style='font-size:24px;'>"

		if (result1 !== 0) {
				console.log ("hi")
		html += "<span class='white'>" + result1 + '</span>'
		}
		else {
			html += result1
		}

		html +=" - "

		if (result2 !== 0) {
		html += "<span class='white'>" + result2 + '</span>'
		}
		else {
			html += result2
		}

		html += "</span>"

		return html;
	}

    $('.scoreswitch').click(function() {

        var $this = $(this)
		var result1 = $this.data('result1');
		var result2 = $this.data('result2');
		$this.parent().parent().find('.delta').show();
        $this.html(makeHtml(result1,result2))

        return false;
    });

        $('.team1switch').click(function() {

        var $this = $(this)
		var realTeam = $this.parent().parent().find('.teamhide');
		var teamLogo = $this.parent().parent().parent().find('.team1hideimg')
		var newSrc = teamLogo.data('timg');

		teamLogo.css("background-image", "url("+newSrc+")")
		$this.hide()
		realTeam.show()
        return false;
    });

    $('.team2switch').click(function() {

        var $this = $(this)
		var realTeam = $this.parent().parent().find('.teamhide');
		var teamLogo = $this.parent().parent().parent().find('.team2hideimg')
		var newSrc = teamLogo.data('timg');

		teamLogo.css("background-image", "url("+newSrc+")")
		$this.hide()
		realTeam.show()
        return false;
    });

    $('.allspoilers').click(function() {


		$('.team2switch').each (function (){
			var $this = $(this)
			var realTeam = $this.parent().parent().find('.teamhide');
			var teamLogo = $this.parent().parent().parent().find('.team2hideimg')
			var newSrc = teamLogo.data('timg');

			teamLogo.css("background-image", "url("+newSrc+")")
			$this.hide()
			realTeam.show()
		});

		$('.team1switch').each (function (){ 
			var $this = $(this)
			var realTeam = $this.parent().parent().find('.teamhide');
			var teamLogo = $this.parent().parent().parent().find('.team1hideimg')
			var newSrc = teamLogo.data('timg');

			teamLogo.css("background-image", "url("+newSrc+")")
			$this.hide()
			realTeam.show()
		});


    	$('.scoreswitch').each (function (){

	        var $this = $(this)
			var result1 = $this.data('result1');
			var result2 = $this.data('result2');
			$this.parent().parent().find('.delta').show();
	        $this.html(makeHtml(result1,result2));

	        
       	});
       	$(this).remove();
       	return false;
    });
});
