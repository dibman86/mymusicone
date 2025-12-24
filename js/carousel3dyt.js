/**carousel3dYtv1mp**/

function Carousel3Dspirale() {

	var xhr, oldplayid, playid, datatoken, plitems, cellCount, cells, cellWidth, cellHeight, radius, theta, angleRotate, verif, menuplaylist;
	var valtimer = 0;
	var cellIndex = 0;
	var minilecteurindex = 0;
	var totalcellCount = 0;
	var cellDivision = 10; // minimum 3 et modifier translateZ de la DIV.carousel dans le css
	var centercellrotatecarousel = 7.5;
	var border = 2;
	var arraycells = [];
	var droot = document.body;
	var scene = document.querySelector('.scene');
	var carousel = document.querySelector('.carousel');
	var loader = document.querySelector('.loader');
	var bouton = document.querySelector('.button-nav');
	var prevButton = document.querySelector('.previous-button');
	var nextButton = document.querySelector('.next-button');
	var scrollorswipe = document.querySelector('.scrollorswipe');
	const uptotop = document.querySelector('.btn-up');
	var indexid = 0;
	var videovue = [];
	var ctp = 0;
	var shuffle = false;
	var changetotal = false;
	var blockindex = false;
	var cumulcells='';
	var iframeparent;
	var timeoutplayer = null;
	var timeoutchangeplayer = null;
	var timeoutcreat = null;
	let isclicked = false;
	let timerclick = null;
	var noMobile = document.documentElement.classList.contains('no-mobile');
	window.playercell = null;
	window.oldcellcellIndex = 0;
	
	function removecells() {
		prevButton.style.left = '-100%';
		nextButton.style.right = '-100%';
		loader.style.display = 'block';
		droot.classList.remove('scene-loaded');
		if (typeof cells !== "undefined") {
			for (var i = 0; i < cells.length; i++) {
				if (cells[i].parentElement) carousel.removeChild(cells[i]);
			}
		}
	};

	function removepopup() {
		var popup = document.querySelector('.popup');
		if (popup !== null) {
			if (popup.parentElement) popup.parentElement.removeChild(popup);
		}
	};

	function popupgenerate(text, v) {
		if (v) text = text + '<button type="button" class="btn reessayer" tabindex="0">réessayer</button>';
		var createpopup = '<div class="popup"><button type="button" id="popup-esc" class="popup-close" aria-label="Fermer" title="Fermer (Esc)" tabindex="0"><i class="fas fa-times"></i></button><div class="popup_content"><p>' + text + '</p></div></div>';
		scene.insertAdjacentHTML('afterend', createpopup);
		loader.style.display = 'none';
		var popupClose = document.getElementById('popup-esc');
		popupClose.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			removepopup();
			var next = carousel.querySelector('.next_cells .btn');
			if (next !== null) next.classList.remove("click-plus");
		})
	};
	
	function nextButtomtrigger() {
		var btnnext = document.querySelector('.next_cells .btn-plus:not(.click-plus)');
		if (btnnext !== null) {
			triggerEvent(btnnext, 'click');
		}
	};
	
	function nextcellsLoad() {
		if (cellIndex <= totalcellCount && cellIndex >= totalcellCount - 10) {
			nextButtomtrigger();
		}
	};

	function loadVids(playlistId, token, videoid) {
		if (token === null) token = '';
		var url = 'https://www.googleapis.com/youtube/v3/playlistItems';
		var options = {
			part: 'snippet',
			key: addApiKey(),
			maxResults: 30,
			playlistId: playlistId,
			pageToken: token
		}
		if (xhr) xhr.abort();
		
		getJSON(url, options, function(err, data) {
			if (data) {
				var dataitems = data.items;
				var totalvideoplaylist = data.pageInfo.totalResults;
				if (typeof data.nextPageToken !== 'undefined') {
					var cellnext = data.nextPageToken;
				}
					
				var find;
				for(var i = 0; i < arraycells.length; i++) {
					if(arraycells[i].index === playlistId && arraycells[i].id < parseInt(indexid)){
						find = i;
					}
				}
					
				if (typeof find !== "undefined"){
					if (totalvideoplaylist !== arraycells[find].tvp){
						var newtotal = (totalvideoplaylist - arraycells[find].tvp);
						dataitems.splice(0,newtotal);
						changetotal = true;
					}
				}
					
				if(changetotal){
					for(var i = 0; i < arraycells.length; i++) {
						if(arraycells[i].index === playlistId){
							arraycells.splice(i,1);
						}
					}
				}else{
					arraycells.push({
						'id': indexid,
						'index': playlistId,
						'nexttoken': cellnext,
						'cells': dataitems,
						'tvp': totalvideoplaylist
					})
				}
					
				addCells(dataitems, playlistId, cellnext, indexid, videoid);
				indexid++;
			} else {
				console.error('Augh, there was an error!', err);
				removepopup();
				if (err === 0) {
					popupgenerate('Veuillez vérifier votre connexion réseau et réessayer.', true);
					var reessayer = document.querySelector('.reessayer');
					var reload = function(e) {
						e.preventDefault();
						e.stopPropagation();
						if (typeof datatoken === 'undefined') {
							removecells();
						}
						loadVids(playid,datatoken);
					};
					window.addEventListener('online', reload);
					if (reessayer !== null) {
						reessayer.focus();
						reessayer.addEventListener('click', reload);
					}
				} else if (err === 404) {
					popupgenerate('Cette ressource n\'est plus disponible , veuillez sélectionner une autre playlist.');
				} else {
					popupgenerate('Un probleme est survenue , veuillez verifier votre connection ou essayer une autre playlist.');
				}
			}
		});
	};

	function getJSON(url, qs_params, callback) {
		function buildQueryString(params) {
			return Object.entries(params)
				.map(function(d) {
					return d[0] + '=' + d[1];
				})
				.join('&');
		}

		var qs = qs_params ? '?' + buildQueryString(qs_params) + '&nocache' : '?nocache';
		var xhr = new XMLHttpRequest();

		xhr.onload = function() {
			if (this.status >= 200 && this.status < 300) {
				callback(null, JSON.parse(this.responseText));
			} else {
				callback(this.status);
			}
		};

		xhr.onerror = function() {
			callback(this.status);
		};

		xhr.open('GET', url + qs);
		xhr.send(null);
	}


	function addCells(data, playlistId, cellnext, idindex, videoid) {
		if (xhr) xhr.abort();
		removepopup();
		if (typeof videoid === "undefined") videoid = '';
		var nextc = carousel.querySelector('.next_cells');
		if (nextc !== null) carousel.removeChild(nextc);
		var newcellindex;
		var html = '';
		for (var i = 0; i < data.length; i++) {
			var title = data[i].snippet.title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
			var vid = data[i].snippet.resourceId.videoId;
			if (videoid !== '') {
				if (videoid === vid) {
					newcellindex = i;
				}
			}
			if (!isEmpty(data[i].snippet.thumbnails)) {
				if (data[i].snippet.thumbnails.hasOwnProperty('standard')) {
					var thumb = data[i].snippet.thumbnails.standard.url;
				} else if (data[i].snippet.thumbnails.hasOwnProperty('medium')) {
					var thumb = data[i].snippet.thumbnails.medium.url;
				} else {
					var thumb = data[i].snippet.thumbnails.default.url;
				}
			} else {
				data.splice(i, 1);
				i--;
				continue;
			}
			var div =
				'<div class="carousel__cell" style="border-width:' + border + 'px;" data-style="false"><div class="carousel-overlay"></div><a class="ytlink mediabox" data-click="false" data-img="' + thumb + '" data-globalid="' + (playlistId + ',' + vid) + '"  href="https://www.youtube-nocookie.com/embed/' + vid + '" rel="noopener noreferrer nofollow" target="_blank" ondragstart="return false;" title="' + title + '"><div class="cell loading_img"><img src="' + thumb + '" alt=""><div class="cachecolor"><div class="imgcolor" style="background-image:url(' + thumb + ');"></div></div></div><div class="yttitle" translate="no"><span>' + title + '</span></div></a><div class="blockqr"><button type="button" class="btn btn_qr fa fa-times default-click"  title="Afficher QR Code">QR</button><div class="container_qr default-click"><div class="container_imgqr loading_img"><img class="video_qr" src="https://quickchart.io/qr?text=https%3A%2F%2Fyoutu.be%2F' + vid + 'DPxL7dO5XPc&light=ff0000&dark=ffffff&margin=6&size=140&format=svg" alt="QR CODE"></div><div class="text_qr">SCANNE MOI</div></div></div></div>';
			html = html + div;
		}
		
		cellCount = data.length;
		totalcellCount += cellCount;
		
		if (!shuffle && !blockindex) {
			cellIndex = totalcellCount - cellCount;
		}
		
		if(blockindex) blockindex = false;

		if (videoid !== '') {
			if (typeof newcellindex !== 'undefined' ) {
				cellIndex = totalcellCount -  (cellCount - newcellindex);
			}else{
				if(typeof cellnext !== 'undefined'){
					cumulcells = cumulcells + html;
					var check = checkIndex(playlistId,cellnext,idindex);
					if (typeof check !== "undefined") {
						addCells(check.cells, check.index, check.nexttoken, check.id, videoid);
					} else {
						loadVids(playlistId, cellnext , videoid);
					}
					return;
				}else{
					cellIndex = 0;
					setCookie("lastposition", '');
					setCookie(playlistId, '');
				}
			}
		}
		
		minilecteurindex = cellIndex;
		
		if(cumulcells !== ''){
			html = cumulcells + html;
			cumulcells = '';
		} 
			
		if (typeof cellnext !== 'undefined') {
			html = html + '<div class="carousel__cell next_cells" data-style="false"><button type="button" data-id="' + idindex + '" data-playlistid="' + playlistId + '" data-token="' + cellnext + '"class="ytlink btn btn-plus" title="Voir plus"><div class="entoure"></div><i class="fa fa-plus"></i></button></div>'
		} else {
			if (totalcellCount >= 3) {
				html = html + '<div class="carousel__cell end_cells" data-style="false"><button type="button" class="ytlink btn btn-debut" title="Revenir au début"><div class="entoure"></div><i class="fa fa-angle-double-up"></i></button></div>'
			} 
		}
		
		carousel.insertAdjacentHTML('beforeend', html);
		cells = carousel.querySelectorAll('.carousel__cell');
		var nextcells = carousel.querySelector('.next_cells .btn');
		var endcells = carousel.querySelector('.end_cells .btn');
		var images = document.querySelectorAll('.carousel__cell .loading_img img');
		
		function imgOK(img) {
			if (!img.complete) {
				return false;
			}
			if (typeof img.naturalWidth != "undefined" && img.naturalWidth === 0) {
				return false;
			}
			return true;
		};
		
		Array.prototype.forEach.call(images, function(el) {
			el.addEventListener("load", function(e) {
				var isLoaded = imgOK(el);
				if ( isLoaded === true) {
					this.classList.add('loaded');
					this.parentElement.classList.remove('loading_img');
				}
			});
		});

		if (nextcells !== null) {
			nextcells.addEventListener('click', function() {
				nextcells.classList.add("click-plus");
				var dataplaylistid = nextcells.getAttribute('data-playlistid');
				datatoken = nextcells.getAttribute('data-token');
				var dataindexid = nextcells.getAttribute('data-id');
				var check = checkIndex(dataplaylistid,cellnext,dataindexid);
				setTimeout(function() {
					if (typeof check !== "undefined") {
						addCells(check.cells, check.index, check.nexttoken, check.id);
					} else {
						loadVids(dataplaylistid, datatoken);
					}
				}, valtimer);
				blockindex = true;
			});
		}
		if (endcells !== null) {
			endcells.addEventListener('click', debounce(function() {
				cellIndex = 0;
				minilecteurindex = 0;
				rotateCarousel(cellIndex);
				endcells.parentElement.classList.remove('box-center');
				endcells.parentElement.style[transformProperty] = endcells.parentElement.style[transformProperty].replace('scale(1.3)', '');
				endcells.blur();
			}, 150));
		}
		
		changeCarousel();
	};

	function changeCarousel(resize) {
		if (typeof resize === "undefined") resize=false;
		cellWidth = carousel.offsetWidth;
		cellHeight = carousel.offsetHeight;
		var cellH = cellHeight / centercellrotatecarousel;
		theta = 360 / cellDivision;
		radius = Math.round((cellWidth / 2) / Math.tan(Math.PI / cellDivision));
		angleRotate = Math.round(Math.atan(cellH / cellWidth) * (180 / Math.PI));
		var imgWidth = cells[0].offsetWidth;
		var imgHeight = cells[0].offsetHeight;
		var cacheWidth = imgWidth - (border * 2);
		var cacheHeight = imgHeight - (border * 2);

		Array.prototype.forEach.call(cells, function(el, index) {
			if (el.getAttribute('data-style') === 'false' || resize) {
				el.style[transformProperty] = 'rotateY(' + theta * index + 'deg) translateZ(' + radius + 'px) translateY(' + Math.ceil(cellH * index) + 'px) rotate(' + angleRotate + 'deg) rotateX(30deg)';

				var imgColor = el.querySelector('.imgcolor');
				if (imgColor !== null){
					imgColor.style.width = cacheWidth.toString() + "px";
					imgColor.style.height = cacheHeight.toString() + "px";
				}
				
				if(resize) return;
				
				el.setAttribute('data-style', 'true');
				el.style.opacity = '1';
				
				var elchild = el.querySelector('.ytlink');
				if (elchild !== null) {
					elchild.addEventListener('focus', debounce(function() {
						if (index === cellIndex) return;
						cellIndex = index;
						scene.scrollTo(0, 0);
						rotateCarousel(cellIndex);
						hide(scrollorswipe);
						hide(bouton);
					}, 150));
				}
				var blockqr  = el.querySelector('.blockqr');
				if (blockqr !== null){
					blockqr.addEventListener('click',function(e){
						if(!this.classList.contains("btnqrclose")){
							this.classList.add("btnqrclose","visibleqr");
						}else{
							this.classList.remove("btnqrclose","visibleqr");
							this.firstElementChild.focus();
						}
					});
				}
			}
		});
		
		if (totalcellCount > 0) {
			prevButton.style.left = '0px';
			nextButton.style.right = '0px';
		}
		loader.style.display = 'none';
		droot.classList.add('scene-loaded');
		MediaBox('.mediabox');
		
		rotateCarousel(cellIndex);
	};

	function rotateCarousel(index) {
		if (totalcellCount === 0) return;
		var angle = Math.round(theta * index);
		var carouselH = Math.ceil(cellHeight / centercellrotatecarousel * index);
		var initstr = 'rotate(' + angleRotate + 'deg) rotateX(30deg)'
		var changestr = 'scale(1.3) rotate(0deg) rotateX(0deg)';
		
		carousel.style[transformProperty] = 'translateZ(' + -radius + 'px) translateY(' + -carouselH + 'px) rotateY(' + -angle + 'deg)';
		carousel.setAttribute('data-radius', -radius);
		
		var cell_center = carousel.querySelector('.box-center');
		
		if (cell_center !== null) {
			var blockqr = cell_center.querySelector('.blockqr');
			cell_center.classList.remove('box-center');
			cell_center.querySelector('.ytlink').classList.remove('cell-center');
			cell_center.style[transformProperty] = cell_center.style[transformProperty].replace(changestr, initstr);
			if (blockqr !== null){ 
				if (blockqr.classList.contains("visibleqr")) blockqr.classList.remove("btnqrclose","visibleqr");
			}
		}

		if (typeof cells[index] !== "undefined") {
			cells[index].classList.add('box-center');
			const ytlink = cells[index].querySelector('.ytlink');
			ytlink.classList.add('cell-center');
			cells[index].style[transformProperty] = cells[index].style[transformProperty].replace(initstr, changestr);
			creatIframeyt(ytlink);
		}
		
		if (cellIndex < 2){
			uptotop.classList.remove('totop');
			uptotop.setAttribute('tabIndex','-1');
		} else {
			uptotop.classList.add('totop');
			uptotop.removeAttribute('tabIndex');
		}
		
		verif = true;
		nextcellsLoad();
	};
	
	function hide(el) {
		if (!el.classList.contains('hide-nav')) {
			setTimeout(function() {
				el.classList.add('hide-nav');
			}, 500);
		}
	};
	
	function creatIframeyt(link) {
		if(timeoutplayer) clearTimeout(timeoutplayer);
		if(timeoutcreat) clearTimeout(timeoutcreat);
		if(iframeparent) iframeparent.classList.remove('player-ready');
		if(window.playercell !== null){
			window.playercell.destroy();
			window.playercell = null;
		} 
			
		timeoutcreat = setTimeout(function(){
			if((link && link.classList.contains('en_lecture')) || !noMobile) return;
			iframeparent = link.querySelector('.cell');
			var source = link.getAttribute('href');
			if(!source) return;
			source += '?enablejsapi=1&amp;controls=0&amp;showinfo=0&amp;cc_load_policy=0&amp;iv_load_policy=3&amp;modestbranding=1&amp;rel=0&amp;autoplay=0&amp;loop=0&amp;disablekb=1&amp;autohide:0&amp;mute=1&amp;fa=0';
			var iframe = '<iframe id="cellplayer" src="' + source + '" allowfullscreen="1" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" title="YouTube video player"  frameborder="0" tabindex="-1"></iframe>';
			iframeparent.insertAdjacentHTML('beforeend', iframe);
			
			if (typeof(YT) === 'undefined' || typeof(YT.Player) === 'undefined') {	
				setTimeout( function() {
					if ( typeof window.onYouTubePlayerAPIReady !== 'undefined' ) {
						if ( typeof window.gambitOtherYTAPIReady === 'undefined' ) {
							window.gambitOtherYTAPIReady = [];
						}
						window.gambitOtherYTAPIReady.push( window.onYouTubePlayerAPIReady );
					}
					window.onYouTubePlayerAPIReady = function() {
						createplayer();
						if ( typeof window.gambitOtherYTAPIReady !== 'undefined' ) {
							if ( window.gambitOtherYTAPIReady.length ) {
								window.gambitOtherYTAPIReady.pop()();
							}
						}
					};
				}, 2);
			} else {
					createplayer();
			}
			
			function onPlayerError (event) {
				if(window.playercell !== null){
					 window.playercell.destroy();
					 window.playercell = null;
				} 
			}
			
			function onPlayerStateChange(event) {
				if (event.data === 1) {
					iframeparent.classList.add('player-ready');
					timeoutchangeplayer = setTimeout(function(){
						if (window.playercell !== null && typeof window.playercell.pauseVideo === "function") window.playercell.pauseVideo();
						onPlayerReady();
					}, 10000);
				}
			}
			
			function onPlayerReady() {
				if(timeoutchangeplayer) clearTimeout(timeoutchangeplayer);
				if(timeoutplayer) clearTimeout(timeoutplayer);
				iframeparent.classList.remove('player-ready');
				timeoutplayer = setTimeout(function(){
					if (window.playercell !== null && typeof window.playercell.getDuration === "function") var seek = window.playercell.getDuration()/2;
					if (window.playercell !== null && typeof window.playercell.seekTo === "function") window.playercell.seekTo(seek);
					if (window.playercell !== null && typeof window.playercell.playVideo === "function") window.playercell.playVideo();
				},1500);
			};
				
			function createplayer() {
					window.playercell = new YT.Player('cellplayer', {
						events: {
							'onReady': onPlayerReady,
							'onStateChange': onPlayerStateChange,
							'onError' : onPlayerError
						}
					})
				
			};
		},300);
	};
	
	function reCreatIframeyt() {
		var ytlink = document.querySelector('.cell-center:not(en_lecture)');
		setTimeout(function() {
			if(ytlink) creatIframeyt(ytlink);
		}, 100);
	}
	
	function changementVisibilite() {
		if(document[hidden]){
			if(timeoutplayer) clearTimeout(timeoutplayer);
			if(iframeparent) iframeparent.classList.remove('player-ready');
			if(window.playercell !== null){
				window.playercell.destroy();
				window.playercell = null;
			} 
		}else{
			reCreatIframeyt();
		}
	};
	
	document.addEventListener(visibilityChange, changementVisibilite, false);
	
	document.addEventListener('popupClosed', function() {
		reCreatIframeyt();
	});
	
	function checkIndex(pl,cn,id) {
		return arraycells.find(function(el) {
			return el.index === pl && el.nexttoken !== cn && el.id > parseInt(id);
		});
	};

	function controle() {
		
		var a11y = document.querySelectorAll(".a11y-nav a");
		var opennavclavier = document.querySelector('.open-nav-clavier');
		var wrapperraccourcie = document.querySelector('.wrapper-raccourcie');
		var raccourcieesc = document.getElementById('raccourcie-esc');
		var overlayplaylist = document.querySelector('.playlist-overlay');
		var titleplaylistleft = document.querySelector('.title-left');
		var titleplaylistright = document.querySelector('.title-right');
		var parent = getClosest(titleplaylistleft, '#contain-pl');
		var endfocus = document.getElementById('endfocus');
		var verifpopup = false;
		var numitem = -1;
		var focuced;
		var startX = 0;
		var startY = 0;
		var distance = 50;
		var keys={};
		
		function waitcellcharging(el){
			if(!document.activeElement.classList.contains('nav-link')) return;
			if (window.mediaboxopen && !window.isMinimised) {
				document.getElementById('mediabox-esc').focus();
			}else{
				const cc = document.querySelector('.cell-center');
				if(cc !== null){
					cc.focus({preventScroll:true});
				}else{
					setTimeout(function() {
						waitcellcharging(el);
					}, 200);
				}
			}
		};
		
		function waitplaylistscharging(el){
			if(!document.activeElement.classList.contains('nav-link')) return;
			if(titleplaylistleft !== null){
				if(!parent.classList.contains("pl-active")) {
					toogleMenuplaylist(event,true);
				}
				titleplaylistleft.focus();
			}else{
				setTimeout(function() {
					waitplaylistscharging(el);
				}, 200);
			}
		};
		
		Array.prototype.forEach.call(a11y, function(el) {
			el.addEventListener('click', function(e) {
				e.preventDefault();
				el.classList.add('activelink');
				if(el.classList.contains('v-last')){
					waitcellcharging(el);
				}else if(el.classList.contains('m-playlist')){
					waitplaylistscharging(el);
				}else if(el.classList.contains('r-clavier')){
						toggleRaccourciClavier();
				}
				el.classList.remove('activelink');
			});
		});
		
		Array.prototype.forEach.call(plitems, function(el) {
			el.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				cumulcells='';
				changetotal = false;
				removecells();
				cellIndex = 0;
				minilecteurindex = 0;
				totalcellCount = 0;
				videovue.length = 0;
				ctp = 0;
				var n = 0;
				if (window.mediaboxopen && !window.isMinimised) {
					triggerEvent(document.querySelector('.mediabox-wrap .mini-lecteur'), 'click');
					n = 500;
				} else {
					n = 0;
				}
				
				setTimeout(function() {
					var matches = el.getAttribute('href').match(/^.*(youtu.be\/|v\/|u\/\w\/|playlist\?list=)([^#\&\?]*).*/);
					playid = matches[2];
					carousel.style[transformProperty] = 'translateZ(' + -radius + 'px)';
					document.querySelector('.list-scroll li.active').classList.remove("active");
					el.parentElement.classList.add("active");
					var checkcookie = checkCookie(playid);
					if (checkcookie.length !== 0) {
						var video = checkcookie;
					} 
					if (typeof video === "undefined") video = '';
					setCookie("lastposition",playid + ',' + video);
					var found = arraycells.find(function(el) {
						return el.index === playid;
					});
					if (typeof found === "undefined") {
						loadVids(playid,null,video);
					} else {
						setTimeout(function() {
							addCells(found.cells, found.index, found.nexttoken, found.id,video);
						}, 200);
					}
				}, n);
			});
		});
		
		window.addEventListener('blur', function(e) {
			focuced = document.activeElement;
			if(focuced.classList.contains("ytlink")) focuced.blur();
		});
		
		window.addEventListener('focus', function(e) {
			var mediaboxwrap = document.querySelector('.mediabox-wrap');
			if (mediaboxwrap !== null) {
				mediaboxwrap.focus();
			}
		});

		window.addEventListener('resize', debounce(function() {
			if (typeof cells !== "undefined") {
				var newcellWidth = carousel.offsetWidth;
				var newcellHeight = carousel.offsetHeight;
				if (newcellWidth !== cellWidth || newcellHeight !== cellHeight) {
					cellWidth = newcellWidth;
					cellHeight = newcellHeight;
					changeCarousel(true);
				}
			}
		}, 300));

		(function start() {
			var timer = null;
			if (timer) clearInterval(timer);
			timer = setInterval(function() {
				if (verif) {
					verif = false;
				} else {
					if (bouton.classList.contains('hide-nav')) bouton.classList.remove('hide-nav');
				}
			}, 500);
		})();
		
		uptotop.addEventListener('click', function(){
			hide(scrollorswipe);
			cellIndex = 0;
			minilecteurindex = 0;
			rotateCarousel(cellIndex);
			uptotop.blur();
		});
		
		opennavclavier.addEventListener('click', toggleRaccourciClavier, false);
		raccourcieesc.addEventListener('click', function(e){
			e.preventDefault();
			toggleRaccourciClavier();
			setTimeout(function() {
				raccourcieesc.blur();
				if (window.mediaboxopen) {
					var mediaboxclose = document.getElementById('mediabox-esc');
					if (mediaboxclose !== null) mediaboxclose.focus();
				}
			}, 100);
		});
		
		function toggleRaccourciClavier() {
			var title;
			if(!wrapperraccourcie.classList.contains("visibleraccourcie")){
				wrapperraccourcie.classList.add("visibleraccourcie");
				title = 'Fermer raccourcis clavier (c)';
			}else{
				wrapperraccourcie.classList.remove("visibleraccourcie");
				title = 'Ouvrir raccourcis clavier (c)';
			}
			raccourcieesc.focus({preventScroll:true});
			updateTitle(opennavclavier,title)
		};
		
		function addlistnerButtom(el,func,str) {
			el.addEventListener('mousedown', function() {
				isclicked = true;
				if(!verifpopup) func();
				timerclick = setInterval(function(){
					if(isclicked){
						if(!verifpopup) func();
					}
				},250);
				
			});
			el.addEventListener('mouseup', function() {
				isclicked = false;
				if (timerclick) clearInterval(timerclick);
				if (window.mediaboxopen || window.isMinimised) {
					if(!verifpopup){
						verifpopup = true;
						toogleNextPreviousVideo(str);
					}
				}
			});
			el.addEventListener('mouseleave', function(e) {
				isclicked = false;
				if (timerclick) clearInterval(timerclick);
			});
		};
		
		addlistnerButtom(nextButton,next,'next');
		addlistnerButtom(prevButton,previous,'previous');
		
		function raccourciecheckbox(str) {
			var valuecookie = checkCookie('valuecheckbox');
			if (valuecookie.length === 0) valuecookie = '000';
			var valuecb0 = valuecookie[0];
			var valuecb1 = valuecookie[1];
			var valuecb2 = valuecookie[2];

			if (str === 'video') {
				var text = 'Répéter la video: ';
				if (valuecb0 === '0') {
					valuecb0 = '1';
					valuecb1 = '0';
					valuecb2 = '0';
					var valuenotif = '1';
				} else {
					valuecb0 = '0';
					valuecb1 = '0';
					valuecb2 = '0';
					var valuenotif = '0';
				}
			} else if (str === 'playlist') {
				var text = 'Playlist automatique: ';
				if (valuecb1 === '0') {
					valuecb0 = '0';
					valuecb1 = '1';
					var valuenotif = '1';
				} else {
					valuecb0 = '0';
					valuecb1 = '0';
					valuecb2 = '0';
					var valuenotif = '0';
				}
			} else if (str === 'shuffle') {
				var text = 'Lecture aléatoire: ';
				if (valuecb2 === '0') {
					valuecb0 = '0';
					valuecb1 = '1';
					valuecb2 = '1';
					var valuenotif = '1';
				} else {
					valuecb0 = '0';
					valuecb2 = '0';
					var valuenotif = '0';
				}
			}

			valuecookie = valuecb0 + valuecb1 + valuecb2;
			setCookie("valuecheckbox", valuecookie);
			Notification(text, valuenotif);
		};
		
		var keys={};

		document.addEventListener('keydown', function(e) {
			var codekey = e.keyCode || e.which;
			keys[codekey] = e.type === 'keydown';
			focuced = document.activeElement;
			if (!window.mediaboxopen || window.isMinimised) {
				if (codekey === 9) {
					if (verifpopup) {
						e.preventDefault();
					}
				}
				if (!keys[17] && codekey === 37  || codekey === 33) {
					e.preventDefault();
					if (!verifpopup){
						previous();
					}
				} else if (!keys[17] && codekey === 39  || codekey === 34) {
					e.preventDefault();
					if (!verifpopup){
						next();
					}
				} else if (codekey === 36) {
					if (!verifpopup) triggerEvent(uptotop, 'click');
				} else if (codekey === 35){
					if (!verifpopup){
						hide(scrollorswipe);
						cellIndex = totalcellCount;
						rotateCarousel(cellIndex);
					}
				}
			}
			if (parent.classList.contains('pl-active') && focuced.scrollHeight <= focuced.offsetHeight) {
				if (codekey === 38) {
					e.preventDefault();
					if (numitem === -1) numitem = 0;
					numitem--;
					if (numitem < 0 || !focuced.classList.contains('plitem')) numitem = plitems.length - 1;
				} else if (codekey === 40) {
					e.preventDefault();
					numitem++;
					if (numitem > plitems.length - 1) numitem = 0;
				}
				if(plitems[numitem]) plitems[numitem].focus();
			}
			if (codekey === 27) {
				if (wrapperraccourcie.classList.contains('visibleraccourcie')) {
					wrapperraccourcie.classList.remove('visibleraccourcie');
				}else if(document.querySelector('.popup')) {
					removepopup();
				}else if(parent.classList.contains('pl-active')) {
					toogleMenuplaylist(event,true);
				}else if(document.querySelector('.mediabox-wrap')) {
					triggerEvent(document.querySelector('.mediabox-close'), 'click');
				}
			}
		});

		document.addEventListener('keyup', function(e) {
			e.preventDefault();
			var codekey = e.keyCode || e.which;
			if(codekey === 17) keys = {};
			if (!window.mediaboxopen || window.isMinimised) {
				if (codekey === 13) {
					if (!focuced.classList.contains('default-click') && !focuced.classList.contains('cell-center')) {
						triggerEvent(document.querySelector('.cell-center'), 'click');
					}
				}
				if (!window.isMinimised){
					if (codekey === 76) {
						raccourciecheckbox('shuffle');
					} else if (codekey === 80) {
						raccourciecheckbox('playlist');
					} else if (codekey === 82) {
						raccourciecheckbox('video');
					}
				}
				if (focuced !== document.querySelector('.thumb-indicator')) {
					if (keys[17] && codekey === 37) {
						var previousbtnvideo = document.querySelector('.video-container .previous-btn')
						if(previousbtnvideo) triggerEvent(previousbtnvideo, 'click');
						
					} else if (keys[17] && codekey === 39) {
						var nextbtnvideo = document.querySelector('.video-container .next-btn')
						if(nextbtnvideo) triggerEvent(nextbtnvideo, 'click');
					}
				}
				
			} else {
				if (focuced !== document.querySelector('.thumb-indicator')) {
					if (codekey === 37) {
						if (!verifpopup) {
							verifpopup = true;
							toogleNextPreviousVideo('previous');
						}
					} else if (codekey === 39) {
						if (!verifpopup) {
							verifpopup = true;
							toogleNextPreviousVideo('next');
						}
					}
				}
			}
			if (codekey === 77) {
				toogleMenuplaylist(event,true);
			} else if (codekey === 67){
				toggleRaccourciClavier();
			} 
		});

		function wheel(e) {
			var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
			if (delta) {
				if (delta < 0) {
					if(!verifpopup) next();
				} else {
					if(!verifpopup) previous();
				}
			}
		};

		if (window.addEventListener) {
			scene.addEventListener(wheelEvt(), wheel, false);
		} else {
			scene.attachEvent('onmousewheel', wheel);
		}
			
		window.addEventListener("touchstart", function(e) {
			if (e.touches.length !== 1) return;
			const touches = e.changedTouches[0];
			startX = touches.pageX;
			startY = touches.pageY;
		}, false);
		window.addEventListener("touchmove", function(e) {
			e.preventDefault();
			e.stopPropagation();
		}, false);
		window.addEventListener("touchend", function(e) {
			if (e.target && getClosest(e.target, '.playlist') || getClosest(e.target, '.mediabox-content')) return;
			var touches = e.changedTouches[0];
			var betweenX = touches.pageX - startX;
			var betweenY = touches.pageY - startY;
			if (betweenX > 0) {
				var orientationX = "rtl";
			} else {
				var orientationX = "ltr";
			}
			if (betweenY > 0) {
				var orientationY = "dwn";
			} else {
				var orientationY = "top";
			}
			if (Math.abs(betweenY) >= distance && Math.abs(betweenX) <= distance) {
				var orientation = orientationY;
			} else if (Math.abs(betweenX) >= distance && Math.abs(betweenY) <= distance) {
				var orientation = orientationX;
			}
			if (orientation === "ltr" || orientation === "top") {
				if (!window.mediaboxopen || window.isMinimised) {
					if(!verifpopup) next();
				} else {
					if(!verifpopup){
						verifpopup = true;
						toogleNextPreviousVideo('next');
					}
				}
			} else if (orientation === "rtl" || orientation =="dwn") {
				if (!window.mediaboxopen || window.isMinimised) {
					if(!verifpopup) previous();
				} else {
					if(!verifpopup){
						verifpopup = true;
						toogleNextPreviousVideo('previous');
					}
				}
			}                
		}, false);
		

		function verifShuffle() {
			var valuecookie = checkCookie('valuecheckbox');
			if (valuecookie[2] === '1') {
				return true;
			} else {
				return false;
			}
		};
		
		function toogleNextPreviousVideo(str) {
			var mediaclose = document.querySelector('.mediabox-close');
			if (oldplayid !== playid){
				oldplayid = playid;
				verifpopup = false;
				triggerEvent(mediaclose, 'click');
				return;
			} 
			shuffle = verifShuffle();
			if (shuffle) {
				if (!videovue.includes(cellIndex) && totalcellCount > 1) {
					videovue.push(cellIndex)
				} 
							
				if(videovue.length === totalcellCount){
					videovue.splice(0, videovue.length - 1);
					ctp = 0;
				}
				nextButtomtrigger();
			}
			if (fsChange() || window.isMinimised) {
				var n = 0;
			} else {
				triggerEvent(mediaclose, 'click');
				var n = 1000;
			}
			setTimeout(function() {
				if (oldplayid !== playid){
					oldplayid = playid;
					verifpopup = false;
					triggerEvent(mediaclose, 'click');
					return;
				} 
				
				window.isMinimised ? minilecteurindex = window.oldcellcellIndex : cellIndex = window.oldcellcellIndex;
				
				if (str === 'next') {
					window.isMinimised ? nextVideo(shuffle) : next(shuffle);
				} else {
					window.isMinimised ? previousVideo(shuffle) : previous(shuffle);
				}
				
				var btns = document.querySelector('.carousel__cell .btn.cell-center');
				if (btns !== null) {
					triggerEvent(btns, 'click');
				}
				setTimeout(function() {
					if (oldplayid !== playid){
						oldplayid = playid;
						verifpopup = false;
						triggerEvent(mediaclose, 'click');
						return;
					} 
					if (fsChange() || window.isMinimised){
						verifpopup = false;
						return;
					}
					triggerEvent(document.querySelector('.cell-center'), 'click');
					verifpopup = false;
				}, n + 300);
			}, n);
		};

		function changeposition() {
			if (ctp >= videovue.length || ctp < 0) {
				do {
					var cellNew = random([0, totalcellCount]);
				} while (videovue.includes(cellNew));
				if (ctp < 0) {
					ctp = videovue.length;
				} else if (ctp > videovue.length) {
					ctp = 0;
				}
			} else {
				cellNew = videovue[ctp];
			}
			return cellNew;
		};

		function next(shuf) {
			var nbr = 0;;
			if(totalcellCount < 3) nbr = -1; 
			if (cellIndex < (totalcellCount + nbr) || shuf) {
				cellIndex++;
				toogleNextPrevious(shuf,cellIndex,1);
			}
		};

		function previous(shuf) {
			if(!shuf) shuf = false;
			if (cellIndex > 0 || shuf) {
				cellIndex--;	
				toogleNextPrevious(shuf,cellIndex,-1); 
			}
		};
		
		function toogleNextPrevious(s,ci,c) {
			cellIndex = initNextPrevious(s,ci,c);
			rotateCarousel(cellIndex);
			if(!isclicked  && typeof s == 'undefined'){
				hide(bouton);
			} 
		};
		
		function nextVideo(shuf) {
			var nbr = 0;;
			if(carousel.querySelector('.end_cells') || totalcellCount < 3) nbr = -1; 
			if (minilecteurindex < (totalcellCount + nbr) || shuf) {
				minilecteurindex++;
			}else{
				minilecteurindex = 0;
			}
						
			NextPreviousVideo(shuf,minilecteurindex,1);
		};

		function previousVideo(shuf) {
			if (minilecteurindex > 0 || shuf) {
				minilecteurindex--;	
				NextPreviousVideo(shuf,minilecteurindex,-1); 
			}
		};

		function NextPreviousVideo(s,ci,c) {
			minilecteurindex = initNextPrevious(s,ci,c);
			var activemini = carousel.querySelector('.mini');
			if (activemini) {
				var ytlink = activemini.querySelector('.ytlink');
				activemini.classList.remove('mini');
				ytlink.classList.remove('active_mini');
			}
			if (typeof cells[minilecteurindex] !== "undefined") {
				cells[minilecteurindex].classList.add('mini');
				var ytlink = cells[minilecteurindex].querySelector('.ytlink');
				ytlink.classList.add('active_mini');
			}
		};
		
		function initNextPrevious(shuf,numindex,num){
			focuced = document.activeElement;
			hide(scrollorswipe);
			droot.classList.remove('hovercell');
			if (focuced.classList.contains("default-click")) {
				focuced.blur();
			}
			if (!shuf) {
				var nindex = numindex;
			} else {
				ctp = ctp + num;
				var nindex = changeposition();
			}
			return nindex;
		}

		titleplaylistleft.addEventListener('click', toogleMenuplaylist, false);
		titleplaylistright.addEventListener('click', toogleMenuplaylist, false);

		function toogleMenuplaylist(e,b) {
			e.preventDefault();
			e.stopPropagation();
			var title;
			if(typeof b === "undefined") b=false;
			numitem = -1;
			if(!parent.classList.contains("pl-active")){
				parent.classList.add("pl-active");
				titleplaylistleft.focus();
				title = 'Fermer liste playlists (m)';
			}else{
				parent.classList.remove("pl-active");
				title = 'Ouvrir liste playlists (m)'
				if(b){
					let mediaboxclose = document.querySelector('.mediabox-close');
					if(mediaboxclose){
						mediaboxclose.focus();
					}else{
						document.activeElement.blur();
					}
				}
			}
			updateTitle(titleplaylistleft,title)
		};

		parent.addEventListener('click', function(e) {
			e.preventDefault();
			if (e.target.nodeName === "LI") return;
			parent.classList.remove("pl-active");
			updateTitle(titleplaylistleft,'Ouvrir liste playlists (m)')
		});
	};

	(function playList() {
		var carouselwrapper = document.getElementById('carousel-wrapper');
		var htmlpl = '';
		var dataplaylist = addPlaylist();
		if (dataplaylist.length > 1) {
			for (var i = 0; i < dataplaylist.length; i++) {
				var title = dataplaylist[i].name;
				var plelement =
					'<li><a href="https://www.youtube.com/playlist?list=' + dataplaylist[i].idplaylist + '" class="plitem default-click" target="_blank" rel="noopener" rel="noreferrer" title="' + title +'">' + title + '</a></li>';
				htmlpl = htmlpl + plelement;
			}
			htmlpl = '<div id="contain-pl"><div class="playlist-overlay"></div><div role="button" class="title-playlist title-right default-click" aria-label="Liste playlists" title="liste playlists (m)"><div class="icon-playlist"><svg width="24px" height="24px" viewBox="0 0 24 24" focusable="false" data-prefix="fab" aria-hidden="true" role="img" class="svg-inline--fa"><path fill="currentcolor" d="M20,7H4V6h16V7z M22,9v12H2V9H22z M15,15l-5-3v6L15,15z M17,3H7v1h10V3z"></path></svg></div></div><div class="playlist" ><button class="btn title-playlist title-left default-click" title="Ouvrir liste playlists (m)">Liste playlists<div class="icon-playlist"><svg viewBox="0 0 24 24" focusable="false" data-prefix="fab" aria-hidden="true" role="img" class="svg-inline--fa"><path fill="currentcolor" d="M20,7H4V6h16V7z M22,9v12H2V9H22z M15,15l-5-3v6L15,15z M17,3H7v1h10V3z"></path></svg></div></button><div class="list-scroll"><ul>' + htmlpl + '</ul></div></div></div>';
			carouselwrapper.insertAdjacentHTML('afterbegin', htmlpl);
		}
		plitems = document.querySelectorAll('.plitem');
		function selectplayList(item,id) {
			item.parentElement.classList.add("active");
			playid = id;
		}
		var checkcookie = checkCookie('lastposition');
		if (checkcookie.length === 0) {
			selectplayList(plitems[0],dataplaylist[0].idplaylist)
		} else {
			checkcookie = checkcookie.split(',');
			playid = checkcookie[0];
			var video = checkcookie[1];
			var valmatch;
			Array.prototype.forEach.call(plitems, function(el) {
				var matches = el.getAttribute('href').match(/^.*(youtu.be\/|v\/|u\/\w\/|playlist\?list=)([^#\&\?]*).*/);
				if (playid === matches[2]) {
					valmatch = el;
					return;
				}
			});
			if (valmatch) {
				valmatch.parentElement.classList.add("active");
			}else{
				selectplayList(plitems[0],dataplaylist[0].idplaylist)
			}
		}
		oldplayid = playid;
		loadVids(playid,null,video);
		controle();
	})();
};

var prefix = "issamennajihv1";
function setCookie(name, value, daysToLive) {
	var cookie = prefix + name + "=" + encodeURIComponent(value);
	if (typeof daysToLive === "number") {
		cookie += "; max-age=" + (daysToLive * 24 * 60 * 60);
	}
	document.cookie = cookie;
};

function getCookie(name) {
	var cookieArr = document.cookie.split(";");
	for (var i = 0; i < cookieArr.length; i++) {
		var cookiePair = cookieArr[i].split("=");
		if (prefix + name === cookiePair[0].trim()) {
			return decodeURIComponent(cookiePair[1]);
		}
	}
	return null;
};

function checkCookie(value) {
	var valuecookie = getCookie(value);
	if (!valuecookie) {
		valuecookie = "";
	}
	return valuecookie;
};

function removeNotification() {
	var notif = document.querySelector('.notification');
	if (notif !== null) {
		setTimeout(function(){
			if(notif.parentElement) notif.parentElement.removeChild(notif);
		},1000);
	}
};

function Notification(text, val,bool) {
	var val1 = '';
	var style = 'invisiblenotif';
	var notif = document.querySelector('.notification');
	
	if (val === '0') {
		val = 'désactivée';
		val1 = 'red';
	} else if (val === '1') {
		val = 'activée';
		val1 = 'green';
	}
	
	if (notif !== null) notif.parentElement.removeChild(notif);
	if(bool) style = 'visiblenotif';
	
	var creatNotification = '<div class="notification '+ style +'""><div class="notif-text notif-text1">' + text + '</div><div class="notif-text notif-text2 ' + val1 + '">' + ' ' + val + '</div></div>';
	if(window.isMinimised){
		document.querySelector('.mediabox-wrap').insertAdjacentHTML('beforeend', creatNotification);
	}else{
		document.body.insertAdjacentHTML('beforeend', creatNotification);
	}

	if(!bool) removeNotification();
};

function getClosest(elem, selector) {

	// Element.matches() polyfill
	if (!Element.prototype.matches) {
		Element.prototype.matches =
			Element.prototype.matchesSelector ||
			Element.prototype.mozMatchesSelector ||
			Element.prototype.msMatchesSelector ||
			Element.prototype.oMatchesSelector ||
			Element.prototype.webkitMatchesSelector ||
			function(s) {
				var matches = (this.document || this.ownerDocument).querySelectorAll(s),
					i = matches.length;
				while (--i >= 0 && matches.item(i) !== this) {}
				return i > -1;
			};
	}

	// Get the closest matching element
	for (; elem && elem !== document; elem = elem.parentNode) {
		if (elem.matches(selector)) return elem;
	}
	return null;
};

function isEmpty(obj) {
	for (var x in obj) {
		if (obj.hasOwnProperty(x)) return false;
	}
	return true;
};

var propertiestransform = ["transform", "msTransform", "webkitTransform", "mozTransform", "oTransform"];
var propertiesborderRadius = ["borderRadius", "MozBorderRadius", "webkitBorderRadius"];
function getSupportedPropertyName(properties) {
	for (var i = 0; i < properties.length; i++) {
		if (typeof document.body.style[properties[i]] != "undefined") return properties[i];
	}
	return null;
};
var transformProperty = getSupportedPropertyName(propertiestransform);
var borderRadiusProperty = getSupportedPropertyName(propertiesborderRadius);

function whichAnimationEvent(){
  var t,el = document.createElement("fakeelement");
  var animations = {
    "animation"      : "animationend",
    "OAnimation"     : "oAnimationEnd",
    "MozAnimation"   : "mozAnimationEnd",
    "WebkitAnimation": "webkitAnimationEnd",
	"MSAnimation"	 : "MSAnimationEnd"
  }

  for (var t in animations){
    if (el.style[t] !== undefined){
      return animations[t];
    }
  } 
};
var animationEvent = whichAnimationEvent();

function triggerEvent(el, type) {
	if (el === null) return;
	if ('createEvent' in document) {
		var e = document.createEvent('HTMLEvents');
		e.initEvent(type, false, true);
		el.dispatchEvent(e);
	} else {
		var e = document.createEventObject();
		e.eventType = type;
		el.fireEvent('on' + e.eventType, e);
	}
};

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this,
			args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function random(range) {
	var max = Math.max(range[0], range[1]);
	var min = Math.min(range[0], range[1]);
	var diff = max - min;
	var number = Math.floor(Math.random() * diff + min);
	return number;
};

function fsChange() {
	return document.fullscreenElement || document.webkitFullscreenElementt || document.webkitCurrentFullScreenElement || document.mozFullscreenElement || document.msFullscreenElement;
};

function wheelEvt() {
	return "onwheel" in document.createElement("div") ? "wheel" : document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll"; 
};

function updateTitle(el,title){
	el.title = title;
}

var hidden,visibilityChange;
if (typeof document.hidden !== "undefined") {
	hidden = "hidden";
	visibilityChange = "visibilitychange";
} else if (typeof document.mozHidden !== "undefined") {
	hidden = "mozHidden";
	visibilityChange = "mozvisibilitychange";
} else if (typeof document.msHidden !== "undefined") {
	hidden = "msHidden";
	visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
	hidden = "webkitHidden";
	visibilityChange = "webkitvisibilitychange";
}

(function() {
	const tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	const firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);		
})();