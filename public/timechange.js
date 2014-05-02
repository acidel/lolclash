$(document).ready(function() {


	var d = new Date();
	var off = d.getTimezoneOffset();

	$('.datetime').each (function (){
		
		$this = $(this)
		matchDate = new Date(
			Date.parse(
				$this.find('.month').text()
				+' '
				+$this.find('.date').text()
				+', '
				+d.getFullYear()
				)
			);
		matchDate.setHours($this.find('.hours').text())

		if ($this.find('.ampm').text() === " AM" && matchDate.getHours() === 12) {
			matchDate.setHours(0)
		}
		if ($this.find('.ampm').text() === " PM") {
			matchDate.setHours(matchDate.getHours() + 12)
		}

		//go to UTC first
		matchDate.setHours(matchDate.getHours() + 4)
		//offset
		matchDate.setHours(matchDate.getHours() - (off/60))

		$this.find('.month').text(matchDate.toDateString().slice(4,7));
		$this.find('.date').text(matchDate.getDate());


		if (matchDate.getHours() === 0) {
			$this.find('.hours').text('12');
		}
		else if (matchDate.getHours() <= 12) {
			$this.find('.hours').text(matchDate.getHours());
		}
		else {
			$this.find('.hours').text(matchDate.getHours()-12);
		}
		
		if (matchDate.getHours() < 12) {
			$this.find('.ampm').text(' AM');
		}
		else {
			$this.find('.ampm').text(' PM');
		}
	});
});