$(document).ready( function() {
	songFilterer.init();
});

//var songs = data.songs;
var songs = [];
var notmissing = [];
var localApiData;
var whichAction = 1;

var songFilterer = {

	init:function() {

		var self = this;

		// this.songs = [];
		// this.notmissing = data.singers;
		// this.localApiData;

		$.get("https://api.myjson.com/bins/19lrg", $.proxy(this.handleDataLoaded, this));

	},

	handleDataLoaded: function(apidata, textStatus, jqXHR) {

		for (var i = 0; i < apidata.singers.length; i++) { // Eventually only call this when the 'edit singer' form is loaded
			var singer = apidata.singers[i];
			$('#chooseSinger').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');
		}
		for (var i = 0; i < apidata.songs.length; i++) { // Eventually only call this when the 'edit song' form is loaded
			var song = apidata.songs[i];
			$('#chooseSong').append('<option>' + song.title + '</option>');
		}
		localApiData = apidata;
		notmissing = localApiData.singers;

		for (var i = 0; i < localApiData.singers.length; i++) { // Populating dropdowns in forms with singers pulled from db
			var singer = localApiData.singers[i];
			var lastInitial = singer.lastname.charAt(0) + '.';
			$('#singerform ul').append('<li><div class="checkbox" id="' + singer.firstname + singer.lastname + '"></div>' +
				'<input type="checkbox" value="' + singer.firstname + ' ' + singer.lastname + '">' + singer.firstname + ' ' + lastInitial + '</input></li>');

			$('#addSoloist').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');
			$('#addUnderstudy').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');
			$('#addDuetist').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');
			$('#addDuetUnderstudy').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');
			$('#addBeatboxer').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');
			$('#addBeatboxUnderstudy').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');

			$('#editSoloist').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');
			$('#editUnderstudy').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');
			$('#editDuetist').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');
			$('#editDuetUnderstudy').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');
			$('#editBeatboxer').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');
			$('#editBeatboxUnderstudy').append('<option>' + singer.firstname + ' ' + singer.lastname + '</option>');
		}
		for (var i = 0; i < localApiData.songs.length; i++) {
			var song = localApiData.songs[i];
			songs.push(song);
		}

		this.eventBinder();

		this.songFilter();

	},

	eventBinder: function() {

		var self = this;

		$('#singerform input:checkbox').on('change', $.proxy(this.songFilter, this));

		$('li div').on('click', function() {
			if ($(this).next().prop('checked') == false) {
				$(this).next().prop('checked', true).change();
				if ($(this).closest('form').attr('id') == 'singerform') { $(this).parent().css('opacity', '0.4'); }
				$(this).addClass('checked');
			} else {
				$(this).next().prop('checked', false).change();
				$(this).parent().css('opacity', '1');
				$(this).removeClass('checked');
			}
		});

		$('.form .checkbox').on('click', function() {
			if ($(this).next().prop('checked') == false) {
				$(this).next().prop('checked', true);
				$(this).addClass('checked');
			} else {
				$(this).next().prop('checked', false);
				$(this).removeClass('checked');
			}
		})

		$('#factorform input:checkbox').on('change', $.proxy(this.songFilter, this));

		$('#help').on('click', function() {
			$('#helpText').toggleClass('none');
		})

		$('.launch').on('click', $.proxy(this.displayForm, this));

		$('#addSongBtn').on('click', function() {
			var songProps = {};
			// add to songProps as we move along these assignments
			var title = $('#addSongTitle').val();
			var arranger = $('#addArranger').val();
			var key = $('#addKey').val();
			var firstchord = $('#addFirstChord').val();
			var soloist, soloistVal = $('#addSoloist').val();
				if (soloistVal != '') { soloist = soloistVal; } else { soloist = null }
			var understudy, understudyVal = $('#addUnderstudy').val();
				if (understudyVal != '') { understudy = soloistVal; } else { understudy = null }
			var duetist, duetistVal = $('#addDuetist').val();
				if (duetistVal != '') { duetist = duetistVal; } else { duetist = null }
			var duetunderstudy, duetunderstudyVal = $('#addDuetUnderstudy').val();
				if (duetunderstudyVal != '') { duetunderstudy = duetunderstudyVal; } else { duetunderstudy = null }
			var beatboxer, beatboxerVal = $('#addBeatboxer').val();
				if (beatboxerVal != '') { beatboxer = beatboxerVal; } else { beatboxer = null }
			var beatboxunderstudy, beatboxunderstudyVal = $('#addBeatboxUnderstudy').val();
				if (beatboxunderstudyVal != '') { beatboxunderstudy = beatboxunderstudyVal; } else { beatboxunderstudy = null }
			var isappropriate = true;
			//$('#addInappropriate').is(':checked') ? var isappropriate = false : var isappropriate = true;
			if ($('#addInappropriate').is(':checked')) { isappropriate = false; }
			var isgroup = false; if ($('#addGroup').is(':checked')) { isgroup = true; }
			var isxmas = false; if ($('#addXmas').is(':checked')) { isxmas = true; }

			self.addSongToApi(title, arranger, key, firstchord, soloist, understudy, duetist, duetunderstudy, beatboxer, beatboxunderstudy, isappropriate, isgroup, isxmas);
		});

		$('#chooseSong').on('change', $.proxy(this.populateSongForm, this));

		$('#editSongBtn').on('click', function() {
			var title = $('#chooseSong').val();
			self.editSongInApi(title);
		});

		$('#deleteSongBtn').on('click', $.proxy(this.removeSongFromApi, this));

		$('#addSingerBtn').on('click', function() {
			var firstname = $('#addFirstName').val();
			var lastname = $('#addLastName').val();
			var vocalpart = $('#addVocalPart').val();
			$.proxy(self.addSingerToApi(firstname, lastname, vocalpart), self)
		});

		$('#chooseSinger').on('change', $.proxy(this.populateSingerForm, this));

		$('#editSingerBtn').on('click', function() {
			var fullname = $('#chooseSinger').val();
			$.proxy(self.editSingerInApi(fullname), this);
		});

		$('#deleteSingerBtn').on('click', $.proxy(this.removeSingerFromApi, this));

		$('.formtext').focus( $.proxy(this.labelFloat, this) );
		$('.formtext').focusout( $.proxy(this.labelSink, this) );
		$('.formtext').change( $.proxy(this.labelFloat, this) );
		$('.formselect').change( $.proxy(this.labelFloat, this) );

	},

	displayForm: function(e) {

		var formId = e.target.id.substr(0, e.target.id.indexOf('L')); // Getting everything before 'Launch' in the ID so we can show/hide the corresponding form
		$('#' + formId).toggleClass('none').siblings().addClass('none');

	},

	labelFloat: function(e) {

		var inputId = e.target.id;
		$('#' + inputId + ' + label').animate({top: '-11px' }, { duration: 300, complete: function() {
			$('#' + inputId + ' + label').css('color', '#E7D5A5');
		}});

	},

	labelSink: function(e) {
		// use event.current target to find id here
		var inputId = e.target.id;
		if ($('#' + inputId).val() == '') {
			$('#' + inputId + ' + label').animate({top: '15px' }, { duration: 300 });
		} else { }
		$('#' + inputId + ' + label').css('color', '#59323C');

	},

	songFilter:function() {

		//var self = this;
		//if ($('input.sensitive').closest('div'))

		var possible = [];
		var impossible = [];


		var missing = {}; // Object that will contain all missing members
		$('#singerform input:checked').each(function() {
			value = $(this).val();
			missing[value] = true; // Add every checked member to 'missing'
		});

		this.vocalPartCheck();

		var sensitive = false;
		if ($('#sensitive').is(':checked')) {
			sensitive = true;
		}

		var xmas = false;
		if ($('#xmas').is(':checked')) {
			xmas = true;
		}

		for (var i = 0; i < songs.length; i++) { // Looping through every song in data.js

			var currentSong = songs[i];
			currentSong.understudyflag = false;
			currentSong.bbflag = false;

			if (!xmas) {
				if (currentSong.isxmas) {
					continue;
				}
			}
			if (currentSong.beatboxer && missing[currentSong.beatboxer] && missing[currentSong.beatboxunderstudy]) {
				currentSong.bbflag = true;
			}
			if (sensitive && !currentSong.isappropriate) {
				console.log(currentSong.title);
				continue;
			}
			if (currentSong.isgroup) { // If it's a group song
				possible.push(currentSong);
				// console.warn('thinks it is a group song');
				continue; // will immediately move to the next iteration of the loop, be careful if there's extra functionality at the bottom here
			} 
			else if (!currentSong.soloist) { // If soloist is null
				// console.warn('thinks soloist is null');
				// break;
			}
			else if (currentSong.soloist && !missing[currentSong.soloist]) { // If we aren't missing the soloist
				possible.push(currentSong);
				// console.warn('thinks we have the soloist');
			} 
			else if (currentSong.understudy && !missing[currentSong.understudy]) { // If we have the understudy
				currentSong.understudyflag = true;
				possible.push(currentSong);
				// console.warn('thinks we have the understudy');
			}

		}

		this.resultsRender(possible);
		//console.log('Final possible', possible);
	},

	resultsRender: function(possible) {
		//console.log('render called');
		var self = this;
		var song;
		var html = [];
		for (var i = 0; i < possible.length; i++) {
			song = possible[i];
			
			// if (song.title.length > 10) {
			//  	var shortTitle = song.title.substring(0, 10); 
			//  	shortTitle = $.trim(shortTitle) + '...';
			// 	console.log(shortTitle);
			// }

			// if (shortTitle) {
			// 	var $song = $('<div class="result"><h1>' + shortTitle + '</h1>' + song.key + '</div>');
			// } else {
				var $song = $('<div class="result"><h1>' + song.title + '</h1> ' + song.key + '</div>');
			// }
			
			if (song.understudyflag) {
				$song.addClass('us');
				$song.append(' - (' + song.understudy + ')');
			}
			if (song.bbflag) {
				$song.addClass('bb');
				var shortenFlag = true;
			}
			html.push($song);

		}

		$('#results').html(html);

		$('.result').on('click', function() {
			var label = $(this).text();
			var newlabel = label.replace(/[^\s]+$/, ''); // Turn the song card text into a string and pop off the key at the end to get just the title
			newlabel = $.trim(newlabel);
			var thisSong = self.getSongByTitle(newlabel);
			$('.songInfo').html(
				'<h3>' + thisSong.title + '</h3><table>' +
				'<tr><td>Arranged by: </td><td>' + thisSong.arranger + '</td></tr>' + 
				'<tr><td>Key: </td><td>' + thisSong.key + '</td></tr>' +
				'<tr><td>First chord: </td><td>' + thisSong.firstchord + '</td></tr>' +
				'<tr><td>Group song: </td><td>' + thisSong.isgroup + '</td></tr>' + 
				'<tr><td>Soloist: </td><td>' + thisSong.soloist + '</td></tr>' + 
				'<tr><td>Understudy: </td><td>' + thisSong.understudy + '</td></tr>' +
				'<tr><td>2nd soloist: </td><td>' + thisSong.duetist + '</td></tr>' +
				'<tr><td>Beatbox: </td><td>' + thisSong.beatboxer + '</td></tr>' +
				'<tr><td>Backup beatbox: </td><td>' + thisSong.beatboxunderstudy + '</td></tr>' +
				'<tr><td>Appropriate for all audiences: </td><td>' + thisSong.isappropriate + '</td></tr></table>'
			).removeClass('none');
		});

		//console.log($('.result').length);
		for (var i = 0; i < $('.result').length; i++) {
			var thisResult = $('.result')[i];
			self.overflowFix(thisResult);
		}

	},

	overflowFix: function(element) {

		if (element.offsetHeight < element.scrollHeight || element.offsetWidth < element.scrollWidth) {
		    console.log('overflows');
		    $(element).css('font-size', '14px');
		} else {
		    // your element doesn't have overflow
		}

	},

	vocalPartCheck: function() {

		var t1 = 0; var t2 = 0; var br = 0; var bs = 0;

		$('#singerform input:not(:checked)').each(function() {
			value = $(this).val();
			// console.log(value);
			for (var i = 0; i < self.localApiData.singers.length; i++) { // Go through all unchecked members (members that WILL be at the show)
				thisSinger = self.localApiData.singers[i];
				if (thisSinger.firstname + ' ' + thisSinger.lastname == value) { // Add to variables based on how many of each vocal part we have
					if (thisSinger.vocalpart == 'Tenor I') { t1 += 1; }
					else if (thisSinger.vocalpart == 'Tenor II') { t2 += 1; }
					else if (thisSinger.vocalpart == 'Baritone') { br += 1; }
					else if (thisSinger.vocalpart == 'Bass') { bs += 1; }
				}
			}
		});

		console.log(t1, t2, br, bs);
		$('#singerform input:not(:checked)').each(function() {
			value = $(this).val();
			var newSelf = this;
			for (var i = 0; i < self.localApiData.singers.length; i++) { // Go through all unchecked members (members that WILL be at the show)
				thisSinger = self.localApiData.singers[i];
				if (t1 == 1 && value == thisSinger.firstname + ' ' + thisSinger.lastname && thisSinger.vocalpart == 'Tenor I') { console.log('last t1 left'); }
				// else { $(newSelf).prev().css('background', 'none'); }
			}
		});

		if (!t1 || !t2 || !br || !bs) {
			$('#warn').removeClass('none');
		} else {
			$('#warn').addClass('none');
		}
	},

	getData: function() {

		return $.get("https://api.myjson.com/bins/19lrg", function(apidata, textStatus, jqXHR) {
			console.warn('Success!', apidata);
			var newestdata = apidata;
			var self = this;
		});
		// console.log('still in getdata,', data);
	},

	getSongByTitle: function(title) {
		for (var i = 0; i < localApiData.songs.length; i++) {
			var song = localApiData.songs[i];
			if (title == song.title) {
				return song;
			}
		}
	},

	getSingerByName: function(fullname) {
		for (var i = 0; i < localApiData.singers.length; i++) {
			var singer = localApiData.singers[i];
			if (fullname == singer.firstname + ' ' + singer.lastname) {
				return singer;
			}
		}
	},

	addSongToApi: function(title, arranger, key, firstchord, soloist, understudy, duetist, duetunderstudy, beatboxer, beatboxunderstudy, isappropriate, isgroup, isxmas) {

		// this.getData().success( function() {
		// });

		localApiData.songs.push( // Adding in the new singer object
			{"title": title, "arranger": arranger, "key": key, "firstchord": firstchord, "soloist": soloist, "understudy": understudy,
			"duetist": duetist, "duetunderstudy": duetunderstudy, "beatboxer": beatboxer, "beatboxunderstudy": beatboxunderstudy,
			"isappropriate": isappropriate, "isgroup": isgroup, "isxmas": isxmas}
		);

		var jsonString = JSON.stringify(localApiData);
		$.ajax({
		    url: "https://api.myjson.com/bins/19lrg",
		    type: "PUT",
		    data: jsonString,
		    contentType: "application/json; charset=utf-8",
		    dataType: "json",
		    success: function(data, textStatus, jqXHR){
		    	console.log('Update complete, refreshing page');
		    }
		});

		setTimeout(function() {
			location.reload(); // Refresh page to reflect new changes
		}, 1000);

	},

	populateSongForm: function() {
		$('#editSongForm').removeClass('none');

		var song = this.getSongByTitle($('#chooseSong').val());
		$('#editSongTitle').val(song.title).change(); // Using .change here to trigger labelFloat
		$('#editArranger').val(song.arranger).change();
		$('#editKey').val(song.key).change();
		$('#editFirstChord').val(song.firstchord).change();
		$('#editSoloist').val(song.soloist).change();
		$('#editUnderstudy').val(song.understudy).change();
		$('#editDuetist').val(song.duetist).change();
		$('#editDuetUnderstudy').val(song.duetunderstudy).change();
		$('#editBeatboxer').val(song.beatboxer).change();
		$('#editBeatboxUnderstudy').val(song.beatboxunderstudy).change();
		if (!song.isappropriate) {
			$('#editInappropriate').prop('checked', true); $('#editInappropriate').prev().addClass('checked');
		} else {
			$('#editInappropriate').prop('checked', false); $('#editInappropriate').prev().removeClass('checked');
		}
		if (song.isgroup) {
			$('#editGroup').prop('checked', true); $('#editGroup').prev().addClass('checked');
		} else {
			$('#editGroup').prop('checked', false); $('#editGroup').prev().removeClass('checked');
		}
		if (song.isxmas) {
			$('#editXmas').prop('checked', true); $('#editXmas').prev().addClass('checked');
		} else {
			$('#editXmas').prop('checked', false); $('#editXmas').prev().removeClass('checked');
		}
		console.log(song.isgroup);

	},

	editSongInApi: function(title) {

		for (var i = 0; i < localApiData.songs.length; i++) {
			var song = localApiData.songs[i];
			if (song.title == title) {
				song.title = $('#editSongTitle').val();
				song.arranger = $('#editArranger').val();
				song.key = $('#editKey').val();
				song.firstchord = $('#editFirstChord').val();
				if ($('#editSoloist').val() != '') { song.soloist = $('#editSoloist').val(); } else { song.soloist = null; }
				if ($('#editUnderstudy').val() != '') { song.understudy = $('#editUnderstudy').val(); } else { song.understudy = null; }
				if ($('#editDuetist').val() != '') { song.duetist = $('#editDuetist').val(); } else { song.duetist = null; }
				if ($('#editDuetUnderstudy').val() != '') { song.duetunderstudy = $('#editDuetUnderstudy').val(); } else { song.duetunderstudy = null; }
				if ($('#editBeatboxer').val() != '') { song.beatboxer = $('#editBeatboxer').val(); } else { song.beatboxer = null; }
				if ($('#editBeatboxUnderstudy').val() != '') { song.beatboxunderstudy = $('#editBeatboxUnderstudy').val(); } else { song.beatboxunderstudy = null; }
				if ($('#editInappropriate').is(':checked')) { song.isappropriate = false; } else { song.isappropriate = true; }
				if ($('#editGroup').is(':checked')) { song.isgroup = true; } else { song.isgroup = false; }
				if ($('#editXmas').is(':checked')) { song.isxmas = true; } else { song.isxmas = false; }
			}
		}
		console.log(localApiData);

		var jsonString = JSON.stringify(localApiData);
		$.ajax({
		    url: "https://api.myjson.com/bins/19lrg",
		    type: "PUT",
		    data: jsonString,
		    contentType: "application/json; charset=utf-8",
		    dataType: "json",
		    success: function(data, textStatus, jqXHR){
		    	console.log('Update complete, refreshing page');
		    }
		});

		setTimeout(function() {
			location.reload(); // Refresh page to reflect new changes
		}, 1000);

	},

	removeSongFromApi: function() {

		var confirm = window.confirm('Are you sure you want to delete this song?\nPress "OK" or "Cancel"');
		if (confirm) {

			var chosenSong = $('#chooseSong').val();
			var self = this;

			var counter = -1;
			for (var i = 0; i < localApiData.songs.length; i++) { // Eventually only call this when the 'edit song' form is loaded
				
				var song = localApiData.songs[i];
				counter++;
				if (song.title == chosenSong) {
					console.log(counter);
					localApiData.songs.splice(counter, 1);
					console.log(localApiData.songs);
				}

			}

			var jsonString = JSON.stringify(localApiData);
			$.ajax({
			    url: "https://api.myjson.com/bins/19lrg",
			    type: "PUT",
			    data: jsonString,
			    contentType: "application/json; charset=utf-8",
			    dataType: "json",
			    success: function(data, textStatus, jqXHR){
			    	console.log('Update complete, refreshing page');
			    }
			});

			setTimeout(function() {
				location.reload(); // Refresh page to reflect new changes
			}, 1000);

		} else { return; }

	},

	addSingerToApi: function(firstname, lastname, vocalpart) {

		if (firstname == '' || lastname == '' || vocalpart == '') {
			alert('Please fill out each section before submitting.');
			return;
		}

		localApiData.singers.push( // Adding in the new singer object
			{"firstname": firstname, "lastname": lastname, "vocalpart": vocalpart}
		);

		var jsonString = JSON.stringify(localApiData);
		$.ajax({
		    url: "https://api.myjson.com/bins/19lrg",
		    type: "PUT",
		    data: jsonString,
		    contentType: "application/json; charset=utf-8",
		    dataType: "json",
		    success: function(data, textStatus, jqXHR){
		    	console.log('Update complete.');
		    	// alert('Update complete. Refresh the page to see new data.');
		    }
		});

		setTimeout(function() {
			location.reload(); // Refresh page to reflect new changes
		}, 1000);

	},

	populateSingerForm: function() {
		$('#editSingerForm').removeClass('none');

		var singer = this.getSingerByName($('#chooseSinger').val());
		$('#editFirstName').val(singer.firstname).change();
		$('#editLastName').val(singer.lastname).change();
		$('#editVocalPart').val(singer.vocalpart).change();
	},

	editSingerInApi: function(fullname) {

		for (var i = 0; i < localApiData.singers.length; i++) {
			var singer = localApiData.singers[i];
			if ($('#editFirstName').val() == '' || $('#editLastName').val() == '' || $('#editVocalPart').val() == '') {
				alert('Please fill out each section before submitting.');
				return;
			}
			if (fullname == singer.firstname + ' ' + singer.lastname) {
				singer.firstname = $('#editFirstName').val();
				singer.lastname = $('#editLastName').val();
				singer.vocalpart = $('#editVocalPart').val();
			}
		}
		console.log(localApiData);

		var jsonString = JSON.stringify(localApiData);
		$.ajax({
		    url: "https://api.myjson.com/bins/19lrg",
		    type: "PUT",
		    data: jsonString,
		    contentType: "application/json; charset=utf-8",
		    dataType: "json",
		    success: function(data, textStatus, jqXHR){
		    	console.log('Update complete, refreshing page');
		    }
		});

		setTimeout(function() {
			location.reload(); // Refresh page to reflect new changes
		}, 1000);

	},

	removeSingerFromApi: function() {

		var confirm = window.confirm('Are you sure you want to delete this singer?\nPress "ok" or "cancel"');
		if (confirm) {

			var chosenSinger = $('#chooseSinger').val();
			var self = this;

			var counter = -1;
			for (var i = 0; i < localApiData.singers.length; i++) { // Eventually only call this when the 'edit singer' form is loaded
				
				var singer = localApiData.singers[i];
				counter++;
				if (singer.firstname + ' ' + singer.lastname == chosenSinger) {
					console.log(counter);
					localApiData.singers.splice(counter, 1);
					console.log(localApiData.singers);
				}

			}

			var jsonString = JSON.stringify(localApiData);
			$.ajax({
			    url: "https://api.myjson.com/bins/19lrg",
			    type: "PUT",
			    data: jsonString,
			    contentType: "application/json; charset=utf-8",
			    dataType: "json",
			    success: function(data, textStatus, jqXHR){
			    	console.log('Update complete.');
			    	// alert('Update complete. Refresh the page to see new data.');
			    }
			});

			setTimeout(function() {
				location.reload(); // Refresh page to reflect new changes
			}, 1000);

		} else { return; }

	}

}







		// $.ajax({
		// 	type: 'GET',
		// 	url: 'https://api.myjson.com/bins/19lrg',
		// 	data: { sAMAccountName: firstname + "." + lastname },
		// 	dataType: 'json',
		// 	success: function(data) {
		// 	   console.log(data);
		// 	},
		// 	error: function(e) {
		// 	   console.error(data);
		// 	}
		// });
		
		
		// $.ajax({
		//     url: "https://api.myjson.com/bins/19lrg",
		//     type: "PUT",
		//     data: '{"singers": {"firstname": "Spence", "lastname": "Hood", "vocalpart": "Tenor I" }}',
		//     contentType: "application/json; charset=utf-8",
		//     dataType: "json",
		//     success: function(data, textStatus, jqXHR){
		//     	console.log(data);
		//     }
		// });

	//  $.ajax({
		// 	type: 'GET',
		// 	url: 'https://api.myjson.com/bins/19lrg',
		// 	data: { sAMAccountName: firstname + "." + lastname },
		// 	dataType: 'json',
		// 	success: function(data) {
		// 	   console.log(data);
		// 	},
		// 	error: function(e) {
		// 	   console.error(data);
		// 	}
		// });

		// $.ajax({
		// 	type: 'POST',
		// 	url: 'https://api.myjson.com/bins/19lrg',
		// 	data: '{ "firstname": "Bugs", "lastname": "Bunny", "vocalpart": "Bass" }',
		// 	contentType: "application/json; charset=utf-8",
		// 	dataType: 'json',
		// 	success: function(data) {
		// 	   console.log(data);
		// 	},
		// 	error: function(e) {
		// 	   console.error(data);
		// 	}
		// });
			 
// 	});

// });
