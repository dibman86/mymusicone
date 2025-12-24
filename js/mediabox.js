(function(root, factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.MediaBox = factory();
	}
}(this, function() {
	"use strict";
	
	addCss(['css/mediabox.css', 'https://unpkg.com/splitting/dist/splitting.css', 'https://unpkg.com/splitting/dist/splitting-cells.css']);
	
	function addCss(links){
		Array.prototype.forEach.call(links, function(el) {
			const giftofspeed = document.createElement('link');
			giftofspeed.rel = 'stylesheet';
			giftofspeed.href = el;
			giftofspeed.media = 'screen';
			document.head.appendChild(giftofspeed);
		});
	}
	
	window.mediaboxopen = false;
	window.mediaboxPlayer = null;
	window.globalvolume = 100;
	window.globalmute = false;
	var noMobile = document.documentElement.classList.contains('no-mobile');
	window.isFullScreen = false;
	window.isMinimised = false;
	var wrapper = null;
	var cell = null;
	var MediaBox = function(element, params) {
		var default_params = {
				enablejsapi: '1',
				showinfo: '0',
				cc_load_policy: '0',
				iv_load_policy: '3',
				modestbranding: '1',
				rel: '0',
				controls: '0',
				fs:'0',
				disablekb: '1',
				autoplay: '0',
				loop: '1'
			}
			
			params = params || 0;
			
		if (!this || !(this instanceof MediaBox)) {
			return new MediaBox(element, params);
		}

		if (!element) {
			return false;
		}
		
		this.params = Object.assign(default_params, params);
		this.selector = element instanceof NodeList ? element : document.querySelectorAll(element);
		this.root = document.body;
		this.carousel = this.root.querySelector('.carousel');
		this.video = this.root.querySelector('#bg-video');
		this.navclavier = this.root.querySelector('.open-nav-clavier');
		this.timererror,this.intervalId,this.currenttime,this.stylescene,this.keyupExecute,this.toggleMiniLecteure,this.radius;
		this.pattern = /translateZ\(([^\)]+)\)/;
		this.run();
	};

	MediaBox.prototype = {
		run: function() {
			var scrollorswipe = document.querySelector('.scrollorswipe');
			var openLightbox = function(el) {
				if (!el.classList.contains('cell-center') || (window.mediaboxopen && !window.isMinimised)) return;
				
				var elcell = el.querySelector('.cell');
				var iframe = el.querySelector('#cellplayer');
				if(elcell) elcell.classList.remove('player-ready')
				if(iframe && window.playercell !== null){
					window.playercell.destroy();
					window.playercell = null;
				}  
				
				if (el.classList.contains('en_lecture') && window.isMinimised){
					this.toggleMiniLecteure();
					return;
				}
				
				var nbr;
				if(window.isMinimised){
					if(this.timererror) clearTimeout(this.timererror);
					if(wrapper) this.close();
					nbr = 550;
				}else{
					nbr = 0;
				}
				setTimeout(function(){
					scrollorswipe.classList.add('hide-nav');
					var tab = this.initElement(el);
					this.render(tab[0], tab[1],tab[2]);
					this.events(tab[0]);
				}.bind(this),nbr)
				window.mediaboxopen = true;
			}.bind(this);
			Array.prototype.forEach.call(this.selector, function(el) {
				if (el.dataset.click === 'false') {
					el.dataset.click = 'true';
					el.addEventListener('click', function(e) {
						e.preventDefault();
						e.stopPropagation();
						openLightbox(el);
					}, false);
				}
			});
		},
		template: function(s, d) {
			for (var p in d) {
				if (d.hasOwnProperty(p)) {
					s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
				}
			}
			return s;
		},
		parseUrl: function(url) {
			var service = {},
				matches;

			if (matches = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)) {
				service.provider = "youtube";
				service.id = matches[2];
			} else {
				service.provider = "Unknown";
				service.id = '';
			}

			return service;
		},
		render: function(service,img,title) {
			
			var embedLink,volumelevel;
			if (service.provider === 'youtube') {
				embedLink = 'https://www.youtube-nocookie.com/embed/' + service.id;
			} else {
				throw new Error("Invalid video URL");
			}

			if (window.globalvolume === 0) {
				volumelevel = "muted";
			} else if (window.globalvolume >= 50) {
				volumelevel = "high";
			} else {
				volumelevel = "low";
			}

			var urlParams = this.serialize(this.params);
			var lightbox = this.template(
				'<div class="mediabox-wrap stopanime" role="dialog" aria-hidden="false"><div class="mediabox-overlay-all" ><div class="grid mediabox-bg" style ="background-image:url({background})"></div><div class="mediabox-bg-overlay overlay-one-bg"></div><div class="mediabox-bg-overlay overlay-two-bg"></div><div class="mediabox-bg-overlay overlay-one"></div><div class="mediabox-bg-overlay overlay-two" ></div></div><div class="mediabox-content" role="document"><div class="mediabox-video-filler"></div><div class="button-setting"><button id="mediabox-esc" class="mediabox-close default-click" aria-label="Fermer"  title="Fermer (Esc)"><i class="fa fa-times"></i></button></div><button class="mini-lecteur default-click" title="Réduire le lecteur (i)"><svg width="24px" height="24px" aria-hidden="true" focusable="false" class="reduire-icon" viewBox="0 0 24 24" fill="currentcolor"><g stroke-width="0"></g><g stroke-linecap="round" stroke-linejoin="round"></g><g><g><path fill="none" d="M0 0h24v24H0z"></path> <path fill-rule="nonzero" d="M21 3a1 1 0 0 1 1 1v7h-2V5H4v14h6v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18zm0 10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h8zm-1 2h-6v4h6v-4zM6.707 6.293l2.25 2.25L11 6.5V12H5.5l2.043-2.043-2.25-2.25 1.414-1.414z"></path></g></g></svg><svg width="24px" height="24px" aria-hidden="true" focusable="false" class="agrandir-icon" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g transform="translate(12.000000, 12.000000) scale(-1, 1) translate(-12.000000, -12.000000) "><path d="M19,19 L5,19 L5,5 L12,5 L12,3 L5,3 C3.89,3 3,3.9 3,5 L3,19 C3,20.1 3.89,21 5,21 L19,21 C20.1,21 21,20.1 21,19 L21,12 L19,12 L19,19 Z M14,3 L14,5 L17.59,5 L7.76,14.83 L9.17,16.24 L19,6.41 L19,10 L21,10 L21,3 L14,3 Z" fill="currentcolor" fill-rule="nonzero"></path></g></g></svg></button><div class="video-container paused" data-volume-level="{volumelevel}"><iframe id="ytplayer" src="{embed}{params}" frameborder="0"  allowfullscreen="1" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" title="YouTube video player" tabindex="-1"></iframe><div class="ytplayer-message"></div><div class="ytplayer-cache"><div class="video-title"><a href="https://www.youtube.com/watch?v={id}" target="_blank" title="Ouvrir sur Youtube"><span>{title}</span></a></div><div class="skip-container"><button class="revenir default-click"><svg width="24px" height="24px" aria-hidden="true" focusable="false" viewBox="0 0 47 24"><path fill="currentColor" fill-rule="evenodd" d="M12.57 18.306c.605.606.722 1.593.181 2.256a1.63 1.63 0 0 1-2.422.125l-7.516-7.53a1.638 1.638 0 0 1 0-2.314l7.516-7.53a1.628 1.628 0 0 1 2.397.095c.566.663.455 1.675-.16 2.291l-5.91 5.923a.536.536 0 0 0 0 .757l5.915 5.927zm5.042-6.685a.538.538 0 0 0 0 .758l3.77 3.777a1.638 1.638 0 0 1-.125 2.427c-.662.542-1.647.426-2.251-.179l-5.237-5.247a1.638 1.638 0 0 1 0-2.313l5.303-5.314a1.629 1.629 0 0 1 2.23-.076c.72.633.685 1.784.007 2.463l-3.697 3.704zm15.839-5.3v11.282h-2.044V8.702l-2.705 1.686V8.122l2.804-1.801h1.945zm6.868 11.497c-2.722 0-4.347-2.149-4.347-5.845.006-3.685 1.636-5.806 4.347-5.806 2.71 0 4.346 2.126 4.346 5.806 0 3.702-1.625 5.85-4.346 5.845zm0-2.01c1.41 0 2.286-1.312 2.286-3.835-.006-2.502-.882-3.82-2.286-3.82-1.4 0-2.276 1.318-2.281 3.82-.006 2.523.876 3.836 2.28 3.836z"></path></svg></button><button class="big-playpause default-click"><svg width="24px" height="24px" aria-hidden="true" focusable="false" class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentcolor" stroke="currentcolor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg><svg width="24px" height="24px" aria-hidden="true" focusable="false"class="pause-icon" viewBox="0 0 24 24"><rect x="6" y="4" width="6" height="16" fill="currentcolor" rx="2"/><rect x="14" y="4" width="6" height="16" fill="currentcolor" rx="2"/></svg></button><button class="avancer default-click"><svg  width="24px" height="24px" aria-hidden="true" focusable="false" viewBox="0 0 47 24"><path fill="currentColor" fill-rule="evenodd" d="M34.347 18.306l5.915-5.927a.536.536 0 0 0 0-.757l-5.91-5.923c-.615-.616-.726-1.628-.16-2.291a1.628 1.628 0 0 1 2.397-.095l7.515 7.53a1.638 1.638 0 0 1 0 2.314l-7.515 7.53a1.63 1.63 0 0 1-2.423-.125c-.54-.663-.424-1.65.18-2.256zm-5.041-6.685l-3.698-3.704c-.677-.679-.713-1.83.008-2.463a1.629 1.629 0 0 1 2.23.076l5.302 5.314a1.638 1.638 0 0 1 0 2.313l-5.236 5.247c-.605.605-1.59.721-2.251.18a1.638 1.638 0 0 1-.125-2.428l3.77-3.777a.538.538 0 0 0 0-.758zm-22.14-5.3v11.282H5.122V8.702l-2.704 1.686V8.122L5.22 6.321h1.945zm6.868 11.497c-2.722 0-4.347-2.149-4.347-5.845.006-3.685 1.637-5.806 4.347-5.806 2.71 0 4.346 2.126 4.346 5.806 0 3.702-1.625 5.85-4.346 5.845zm0-2.01c1.41 0 2.286-1.312 2.286-3.835-.006-2.502-.881-3.82-2.286-3.82-1.4 0-2.275 1.318-2.28 3.82-.006 2.523.875 3.836 2.28 3.836z"></path></svg></button></div></div><div class="video-controls-container"><div class="timeline-container"><div class="timeline"><div class="current-time-slider"></div><a href="#" class="thumb-indicator default-click" role="slider" ></a></div></div><div class="controls"><div class="controls-left"><div class="volume-container"><button class="mute-btn default-click" title= "Désactiver le son (s)"><svg width="24px" height="24px" aria-hidden="true" focusable="false" class="volume-high-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" /></svg><svg width="24px" height="24px" aria-hidden="true" focusable="false" class="volume-low-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z" /></svg><svg width="24px" height="24px" aria-hidden="true" focusable="false" class="volume-muted-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z" /></svg></button><div class="volume-slider-container"><input class="volume-slider default-click" type="range" min="0" max="100" step="any" value="{window.globalvolume}" style="background-size:{window.globalvolume}% 100%"></div></div><div class="duration-container"><div class="current-time">0:00</div>/<div class="total-time">0:00</div></div></div><div class="controls-center"><button class="previous-btn default-click" Title="Vidéo précédente (&#8592;)"><svg width="24px" height="24px" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill="currentColor" d="M16.0841 17.92C16.2745 18.0285 16.5076 18.0268 16.6955 17.9141C16.8843 17.8015 17 17.5962 17 17.3742L17 6.62588C17 6.40307 16.8843 6.19778 16.6955 6.08512C16.5995 6.02837 16.492 6 16.3845 6C16.2811 6 16.1769 6.0267 16.0841 6.07928L7.81514 11.4534C7.62064 11.5644 7.5 11.7731 7.5 12C7.5 12.2262 7.62064 12.4357 7.81514 12.5458L16.0841 17.92Z"></path><path fill="currentColor" d="M8.5 17C8.5 17.5523 8.05229 18 7.5 18C6.94772 18 6.5 17.5523 6.5 17L6.5 7C6.5 6.44772 6.94772 6 7.5 6C8.05228 6 8.5 6.44772 8.5 7L8.5 17Z"></path></svg></button><button class="play-pause-btn  default-click" title="Lire (k)"><svg width="24px" height="24px" aria-hidden="true" focusable="false" class="play-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg><svg width="24px" height="24px" aria-hidden="true" focusable="false" class="pause-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" /></svg></button><button class="next-btn default-click" title="Vidéo suivante (&#8594;)"><svg  width="24px" height="24px" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill="currentColor" d="M7.91586 6.08003C7.72547 5.97155 7.4924 5.97322 7.30447 6.08587C7.11571 6.19853 7 6.40382 7 6.6258L7 17.3741C7 17.5969 7.11571 17.8022 7.30447 17.9149C7.40048 17.9716 7.50799 18 7.6155 18C7.7189 18 7.82313 17.9733 7.91586 17.9207L16.1849 12.5466C16.3794 12.4356 16.5 12.2269 16.5 12C16.5 11.7738 16.3794 11.5643 16.1849 11.4542L7.91586 6.08003Z"></path><path fill="currentColor" d="M15.5 7C15.5 6.44772 15.9477 6 16.5 6C17.0523 6 17.5 6.44772 17.5 7V17C17.5 17.5523 17.0523 18 16.5 18C15.9477 18 15.5 17.5523 15.5 17L15.5 7Z"></path></svg></button></div><div class="controls-right"><button class="video-setting default-click" aria-label="Options" title="Ouvrir options (o)"><svg width="24px" height="24px" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path fill="currentColor" d="M12.59 4.00002L12.86 5.31002C12.9214 5.5905 13.0426 5.85446 13.2151 6.08396C13.3877 6.31345 13.6076 6.50311 13.86 6.64002L15.86 7.82002C16.1627 7.99899 16.5084 8.09232 16.86 8.09002C17.0738 8.08761 17.286 8.05392 17.49 7.99002L18.88 7.53002L19.42 8.45002L18.42 9.28002C18.2005 9.46779 18.0242 9.7009 17.9034 9.96329C17.7825 10.2257 17.72 10.5111 17.72 10.8V13.2C17.72 13.4889 17.7825 13.7744 17.9034 14.0368C18.0242 14.2991 18.2005 14.5322 18.42 14.72L19.42 15.55L18.88 16.47L17.49 16C17.286 15.9361 17.0738 15.9024 16.86 15.9C16.5084 15.8977 16.1627 15.9911 15.86 16.17L13.86 17.35C13.6076 17.4869 13.3877 17.6766 13.2151 17.9061C13.0426 18.1356 12.9214 18.3995 12.86 18.68L12.59 20H11.41L11.14 18.69C11.0786 18.4095 10.9574 18.1456 10.7849 17.9161C10.6123 17.6866 10.3924 17.4969 10.14 17.36L8.14 16.18C7.8373 16.0011 7.49164 15.9077 7.14 15.91C6.92625 15.9124 6.71399 15.9461 6.51 16.01L5.12 16.47L4.58 15.55L5.58 14.72C5.79953 14.5322 5.97578 14.2991 6.09662 14.0368C6.21746 13.7744 6.28002 13.4889 6.28 13.2L6.28 10.8C6.28002 10.5111 6.21746 10.2257 6.09662 9.96329C5.97578 9.7009 5.79953 9.46779 5.58 9.28002L4.58 8.45002L5.12 7.53002L6.51 8.00002C6.71399 8.06392 6.92625 8.09761 7.14 8.10002C7.49164 8.10232 7.8373 8.00899 8.14 7.83002L10.14 6.65002C10.3924 6.51311 10.6123 6.32345 10.7849 6.09396C10.9574 5.86446 11.0786 5.6005 11.14 5.32002L11.41 4.00002H12.59ZM13.4 2.00002L10.6 2.00002C10.3661 1.9953 10.1379 2.07277 9.95514 2.21895C9.77242 2.36512 9.64675 2.57074 9.6 2.80002L9.19 4.91002L7.19 6.09002L5 5.38002C4.89427 5.36 4.78573 5.36 4.68 5.38002C4.50646 5.38005 4.33591 5.42524 4.18512 5.51116C4.03434 5.59707 3.90851 5.72074 3.82 5.87002L2.43 8.15002C2.30987 8.35255 2.26507 8.59098 2.30349 8.8233C2.3419 9.05562 2.46107 9.26694 2.64 9.42002L4.25 10.8L4.25 13.2L2.64 14.58C2.46107 14.7331 2.3419 14.9444 2.30349 15.1767C2.26507 15.4091 2.30987 15.6475 2.43 15.85L3.81 18.18C3.89851 18.3293 4.02434 18.453 4.17512 18.5389C4.32591 18.6248 4.49646 18.67 4.67 18.67C4.78221 18.6751 4.89432 18.6581 5 18.62L7.15 17.91L9.2 19.09L9.62 21.2C9.66675 21.4293 9.79243 21.6349 9.97514 21.7811C10.1579 21.9273 10.3861 22.0047 10.62 22H13.42C13.6539 22.0047 13.8821 21.9273 14.0649 21.7811C14.2476 21.6349 14.3733 21.4293 14.42 21.2L14.84 19.09L16.84 17.91L18.99 18.62C19.0925 18.6568 19.2011 18.6738 19.31 18.67C19.4835 18.67 19.6541 18.6248 19.8049 18.5389C19.9557 18.453 20.0815 18.3293 20.17 18.18L21.55 15.85C21.6701 15.6475 21.7149 15.4091 21.6765 15.1767C21.6381 14.9444 21.5189 14.7331 21.34 14.58L19.75 13.2V10.8L21.36 9.42002C21.5389 9.26694 21.6581 9.05562 21.6965 8.8233C21.7349 8.59098 21.6901 8.35255 21.57 8.15002L20.19 5.82002C20.1015 5.67074 19.9757 5.54707 19.8249 5.46116C19.6741 5.37524 19.5035 5.33005 19.33 5.33002C19.2243 5.31 19.1157 5.31 19.01 5.33002L16.86 6.04002L14.86 4.86002L14.39 2.80002C14.3433 2.57074 14.2176 2.36512 14.0349 2.21895C13.8521 2.07277 13.6239 1.9953 13.39 2.00002H13.4Z"></path><path fill="currentColor" d="M12 9.00002C11.4067 9.00002 10.8266 9.17597 10.3333 9.50561C9.83994 9.83526 9.45542 10.3038 9.22836 10.852C9.0013 11.4001 8.94189 12.0033 9.05764 12.5853C9.1734 13.1672 9.45912 13.7018 9.87868 14.1213C10.2982 14.5409 10.8328 14.8266 11.4147 14.9424C11.9967 15.0581 12.5999 14.9987 13.1481 14.7717C13.6962 14.5446 14.1648 14.1601 14.4944 13.6667C14.8241 13.1734 15 12.5934 15 12C15 11.2044 14.6839 10.4413 14.1213 9.8787C13.5587 9.31609 12.7956 9.00002 12 9.00002ZM12 13C11.8022 13 11.6089 12.9414 11.4444 12.8315C11.28 12.7216 11.1518 12.5654 11.0761 12.3827C11.0004 12.2 10.9806 11.9989 11.0192 11.8049C11.0578 11.6109 11.153 11.4328 11.2929 11.2929C11.4327 11.1531 11.6109 11.0578 11.8049 11.0192C11.9989 10.9806 12.2 11.0005 12.3827 11.0761C12.5654 11.1518 12.7216 11.28 12.8315 11.4444C12.9414 11.6089 13 11.8022 13 12C13 12.2652 12.8946 12.5196 12.7071 12.7071C12.5196 12.8947 12.2652 13 12 13Z"></path></svg></button><div class="options-playlist"><div class="item-option"><input class="default-click" type="checkbox" id="loop-video" name="options"><label for="loop-video" aria-label="Répéter la video désactivée" title="Répéter la video (r) désactivée">Répéter la video<span class="ui"></span></label></div><div class="item-option"><input class="default-click" type="checkbox" id="loop-playlist" name="options" ><label for="loop-playlist" aria-label="Playlist automatique désactivée" title="Playlist automatique (p) désactivée">Playlist automatique<span class="ui"></span></label></div><div class="item-option"><input class="default-click" type="checkbox" id="shuffle-playlist" name="options" ><label for="shuffle-playlist" aria-label="Lecture aléatoire désactivée" title="Lecture aléatoire (l) désactivée">Lecture aléatoire<span class="ui"></span></label></div></div><button class="full-screen-btn default-click" title="Plein écran (f)"><svg width="24px" height="24px" aria-hidden="true" focusable="false" class="fs-icone-open" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M16 5L17.5858 5L14.2929 8.29292C13.9024 8.68345 13.9024 9.31661 14.2929 9.70714C14.6834 10.0977 15.3166 10.0977 15.7071 9.70714L19 6.41426V8C19 8.55228 19.4477 9 20 9C20.5523 9 21 8.55228 21 8V4C21 3.73478 20.8946 3.48043 20.7071 3.29289C20.5196 3.10536 20.2652 3 20 3H16C15.4477 3 15 3.44772 15 4C15 4.55228 15.4477 5 16 5ZM5 8.00002V6.4142L8.29292 9.70712C8.68345 10.0976 9.31661 10.0976 9.70714 9.70712C10.0977 9.3166 10.0977 8.68343 9.70714 8.29291L6.41424 5.00001L8 5.00002C8.55228 5.00002 9 4.5523 9 4.00002C9 3.44773 8.55228 3.00002 8 3.00002H4C3.73478 3.00002 3.48043 3.10537 3.29289 3.29291C3.10536 3.48044 3 3.7348 3 4.00002V8.00002C3 8.5523 3.44772 9.00001 4 9.00001C4.55228 9.00001 5 8.5523 5 8.00002ZM8.00002 19H6.4142L9.70712 15.7071C10.0976 15.3166 10.0976 14.6834 9.70712 14.2929C9.3166 13.9024 8.68343 13.9024 8.29291 14.2929L5.00001 17.5858V16C5.00001 15.4477 4.5523 15 4.00001 15C3.44773 15 3.00002 15.4477 3.00002 16L3.00002 20C3.00002 20.2652 3.10537 20.5196 3.29291 20.7071C3.48044 20.8947 3.7348 21 4.00002 21H8.00002C8.5523 21 9.00001 20.5523 9.00001 20C9.00001 19.4477 8.5523 19 8.00002 19ZM19 17.5858V16C19 15.4477 19.4477 15 20 15C20.5523 15 21 15.4477 21 16V20C21 20.2652 20.8946 20.5196 20.7071 20.7071C20.5196 20.8947 20.2652 21 20 21H16C15.4477 21 15 20.5523 15 20C15 19.4477 15.4477 19 16 19H17.5858L14.2929 15.7071C13.9023 15.3166 13.9023 14.6834 14.2929 14.2929C14.6834 13.9024 15.3166 13.9024 15.7071 14.2929L19 17.5858Z"></path></svg><svg width="24px" height="24px" aria-hidden="true" focusable="false" class="fs-icone-close" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M8.41425 7.00003L8.41425 4.41425L10.4142 4.41425L10.4142 9.41425C10.4142 9.67946 10.3089 9.93382 10.1214 10.1214C9.93382 10.3089 9.67946 10.4142 9.41425 10.4142L4.41425 10.4142L4.41425 8.41425L7.00003 8.41425L3 4.41422L4.41422 3L8.41425 7.00003Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M17.0097 8.41425L21 4.42398L19.5858 3.00977L15.5858 7.0098L15.5858 4.42401L13.5858 4.42401L13.5858 9.41424C13.5858 9.67946 13.6911 9.93382 13.8787 10.1214C14.0662 10.3089 14.3205 10.4142 14.5858 10.4142L19.5858 10.4142L19.5858 8.41425L17.0097 8.41425Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M8.41419 17L4.41421 21L3 19.5858L6.99997 15.5858L4.41419 15.5858L4.41419 13.5858L9.41419 13.5858C9.96647 13.5858 10.4142 14.0335 10.4142 14.5858L10.4142 19.5858L8.41419 19.5858L8.41419 17Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M15.5858 16.9986L19.5855 21L21 19.5861L17.0015 15.5858L19.5813 15.5858L19.5813 13.5858L14.5858 13.5858C14.3206 13.5858 14.0662 13.6912 13.8787 13.8787C13.6912 14.0662 13.5858 14.3206 13.5858 14.5858L13.5858 19.5858L15.5858 19.5858L15.5858 16.9986Z"></path></svg></button></div></div></div></div></div></div>', {
					background: img,
					embed: embedLink,
					params: urlParams,
					globalvolume: window.globalvolume,
					volumelevel: volumelevel,
					title: title,
					id: service.id
				});
			this.root.insertAdjacentHTML('beforeend', lightbox);
			this.root.classList.add('stop-scroll');
			if(!window.isMinimised) document.querySelector('.mediabox-close').focus();
		},
		events: function(service) {
			wrapper = document.querySelector('.mediabox-wrap');
			var mediaboxbgoverlay = wrapper.querySelectorAll('.no-mobile .mediabox-bg-overlay');
			var content = wrapper.querySelector('.mediabox-content');
			var mediaboxclose = content.querySelector('.mediabox-close');
			var lecteurMini = content.querySelector('.mini-lecteur');
			var setting = content.querySelector('.video-setting');
			var checkbox = content.querySelectorAll('[type="checkbox"][name="options"]');
			var videoContainer = document.querySelector(".video-container");
			var bigplayPauseBtn = videoContainer.querySelector(".ytplayer-cache");
			var skipContainer = bigplayPauseBtn.querySelector(".skip-container");
			var playPausebtncenter = skipContainer.querySelector(".big-playpause");
			var revenir = skipContainer.querySelector(".revenir");
			var avancer = videoContainer.querySelector(".avancer");
			var videoContrels = videoContainer.querySelector(".video-controls-container");
			var playPauseBtn = videoContainer.querySelector(".play-pause-btn");
			var nextvideo = videoContainer.querySelector('.next-btn');
			var previousvideo = videoContainer.querySelector('.previous-btn');
			var fullScreenBtn = videoContainer.querySelector(".full-screen-btn");
			var muteBtn = videoContainer.querySelector(".mute-btn");
			var currentTimeElem = videoContainer.querySelector(".current-time");
			var totalTimeElem = videoContainer.querySelector(".total-time");
			var volumeSlider = videoContainer.querySelector(".volume-slider");
			var timelineContainer = videoContainer.querySelector(".timeline-container");
			var thumbIndicator = videoContainer.querySelector(".thumb-indicator");
			var currentTimeSlider = timelineContainer.querySelector(".current-time-slider");
			var player,intervalId,wasPaused;
			var playerready = false;
			var sautvolume = 5;
			var timercursor,timeclickout,startY;
			var distance = 100;
			var isScrubbing = false;
			var isClicked = false;
			var isHolding = false;
			var isCloseHover = false;
			var toogleclick = false;
			var resultsplit = null;
			var nextvaluesplit= -1;
			var keyCodes = {96: 0,97: 1,98: 2,99: 3,100: 4,101: 5,102: 6,103: 7,104: 8,105: 9};
			
			function wheelvolume(e) {
				if (playerready) {
					var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
					if (delta) {
						if (delta < 0) {
							volumeChange(-1);
						} else {
							volumeChange(1);
						}
					}
				}
			};

			if (window.addEventListener) {
				wrapper.addEventListener(wheelEvt(), wheelvolume, false);
			} else {
				wrapper.attachEvent('onmousewheel', wheelvolume);
			}
			
			function replaceFirstOccurrence(str, search, replacement) {
				return str.replace(new RegExp(`\\b${search}\\b`), replacement);
			}
			
			function addAttributeCheched(el,val) {
				var label = document.querySelector(`label[For="${el.id}"]`);
				var title = label.title;
				var ariatitle = label.getAttribute("aria-label");
				if(val === '1'){
					el.setAttribute("checked","");
					title = replaceFirstOccurrence(title,'désactivée', 'activée');
					ariatitle = replaceFirstOccurrence(ariatitle,'désactivée', 'activée');
				} else {
					el.removeAttribute("checked");
					title = replaceFirstOccurrence(title,'activée', 'désactivée');
					ariatitle = replaceFirstOccurrence(ariatitle,'activée', 'désactivée');
				}

				updateTitle(label,title);
				label.setAttribute("aria-label",ariatitle);
			}

			(function initcheckbox() {
				var checkcookie = checkCookie('valuecheckbox');
				if (checkcookie.length === 0) checkcookie = '000';
				for (var i = 0; i < checkbox.length; i++) {
					if (checkcookie[i] === '0') {
						checkbox[i].checked = false;
					} else {
						checkbox[i].checked = true;
					}
					addAttributeCheched(checkbox[i],checkcookie[i])
				}
			})();

			function verifcheck(v, b) {
				var valuecheck = '',
					valuecb,
					valuenotif,
					text;
				for (var i = 0; i < checkbox.length; i++) {
					if (checkbox[i].checked) {
						valuecb = '1';
					} else {
						valuecb = '0';
					}
					addAttributeCheched(checkbox[i],valuecb)
					valuecheck = valuecheck + valuecb;
				}
				
				setCookie("valuecheckbox", valuecheck);

				if (v === 'video') {
					text = 'Répéter la video: ';
					valuenotif = valuecheck[0];
				} else if (v === 'playlist') {
					text = 'Playlist automatique: ';
					valuenotif = valuecheck[1];
				} else if (v === 'shuffle') {
					text = 'Lecture aléatoire: ';
					valuenotif = valuecheck[2];
				}

				if (b && !content.classList.contains('open-setting')) {
					Notification(text, valuenotif);
				}
			};

			function tooglecheckbox(n) {
				if (checkbox[n].checked) {
					checkbox[n].checked = false;
				} else {
					checkbox[n].checked = true;
				}
			};

			function cbvideoClick(b) {
				if (checkbox[0].checked) {
					checkbox[1].checked = false;
					checkbox[2].checked = false;
				}
				verifcheck('video', b);
			};

			function cbplaylistClick(b) {
				if (checkbox[1].checked) {
					checkbox[0].checked = false;
				} else {
					checkbox[2].checked = false;
				}
				verifcheck('playlist', b);
			};

			function cbshuffleClick(b) {
				if (checkbox[2].checked) {
					checkbox[0].checked = false;
					checkbox[1].checked = true;
				}
				verifcheck('shuffle', b);
			};

			function addListenerCheckbox(el,func) {
				el.addEventListener('click', function(e) {
					e.stopPropagation();
					func(false);
					el.focus();
				}, false);
			};
			addListenerCheckbox(checkbox[0],cbvideoClick)
			addListenerCheckbox(checkbox[1],cbplaylistClick)
			addListenerCheckbox(checkbox[2],cbshuffleClick)
			
			var playTofs = function() {
				var timer = null;
				if (timer) clearTimeout(timer);
				timer = setTimeout(function() {
					cell.classList.remove('en_lecture');
					if(window.isMinimised){
						var el = document.querySelector('a.active_mini');
						var elclass = 'mini';
					}else{
						el = document.querySelector('a.cell-center');
					}
					
					if(!el) return;
					var tab = this.initElement(el,elclass);
					document.querySelector('.mediabox-bg').style.backgroundImage = "url(" + tab[1] + ")";
					videoContainer.querySelector('.video-title').textContent = tab[2];
					player.loadVideoById(tab[0].id);
					player.playVideo();
					triggerEvent(content,"pointerup");
				}.bind(this), 10);
			}.bind(this);

			var gestionError = function(event) {
				if (playerready) {
					if (!window.mediaboxopen) return
					if(isClicked) return;
					if(content.classList.contains('open-setting') || isScrubbing || isCloseHover) {
						setTimeout(function(){
							if(window.mediaboxopen) gestionError();
						},500);
					}else{
						if (checkbox[1].checked) {
							triggerEvent(nextvideo, 'click');
						} else {
							this.close();
						}
					}
				}
			}.bind(this);
			
			var onPlayerError = function() {
				if(this.timererror) clearTimeout(this.timererror);
				videoContainer.classList.add("playererror");
				videoContainer.classList.remove("playerstop");
				videoContainer.classList.remove("paused");
				wrapper.classList.add("mute");
				this.timererror = setTimeout(function(){
					gestionError();
				}.bind(this),2000);
			}.bind(this);

			var onPlayerStateChange = function(event) {
				if (playerready) {
					if(event.data !== -1) if(this.timererror) clearTimeout(this.timererror);
					if (event.data === 0) {
						updateTitle(playPauseBtn,'Lire (k)');
						videoContainer.classList.add("playerstop");
						clearInterval(this.intervalId);
						if(cell !== null) cell.dataset.currenttime = '0';
						if (checkbox[0].checked) {
							event.target.playVideo();
							triggerEvent(wrapper,"pointerup");
						} else {
							stopAnime();
							gestionError();
						}
					}else if(event.data === 1){
						mouseHideelement();
						updateTitle(playPauseBtn,'Pause (k)');
						videoContainer.classList.replace("paused","playing");
						videoContainer.classList.remove("playerstop");
						videoContainer.classList.remove("playererror");
						runAnime();
						var duration = event.target.getDuration();
						this.intervalId = setInterval(function() { 
							if(event.target.getPlayerState() === 1) {
								var currenttime = event.target.getCurrentTime();
								var diff = parseFloat((currenttime/duration));
								currentTimeElem.textContent = formatDuration(currenttime);
								timelineContainer.style.setProperty("--progress-position", diff);
								if(cell !== null) cell.dataset.currenttime = currenttime;
								changeOverlay(diff);
							}else{
								clearInterval(this.intervalId);
							}
						}.bind(this), 250);
					}else if(event.data === 2){
						videoContainer.classList.replace("playing","paused");
						stopAnime();
					}
				}
			}.bind(this);

			var onPlayerReady = function(event) {
				window.mediaboxPlayer = player;
				event.target.setVolume(window.globalvolume);
				var duration = event.target.getDuration();
				if (parseFloat(this.currenttime) <= 0 || parseFloat(this.currenttime) >= (duration - 5)){
					this.currenttime = '0';
				}else {
					this.currenttime -= 0.5;
				}
				totalTimeElem.textContent = formatDuration(duration);
				
				if(window.globalmute){
					changeIconeMute();
				}else{
					event.target.setVolume(window.globalvolume);
					toogleIconVolume();
				}
				event.target.seekTo(this.currenttime);
				event.target.playVideo();
				resultsplit = Splitting({
					target: ".grid",
					by: "cells",
					columns: 15 * Math.round(wrapper.offsetWidth/wrapper.offsetHeight),
					rows: 15
				})
				var holdTimeout = null;
				var endHolding = function(e){
					e.preventDefault();
					e.stopPropagation();
					if (e.target.parentElement.classList.contains('default-click')) return;
					clearTimeout(holdTimeout);
					let endholdTimeout = setTimeout(function(){
						if (isHolding){
							if(window.isplayerpaused) event.target.pauseVideo();
							event.target.setPlaybackRate(1);
							isHolding = false;
							Notification("Vitesse: ","x1");
						}
					}, 200); 
					if (isScrubbing) toggleScrubbing(e);
				}
				videoContainer.addEventListener("focusin", mouseHideelement);
				videoContainer.addEventListener('pointerenter', mouseHideelement)
				videoContainer.addEventListener('pointermove', mouseHideelement);
				videoContainer.addEventListener('mouseleave', function(e) {
					focusedControls(true);
				});
				videoContainer.addEventListener('pointerdown',function(e) {
					e.preventDefault();
					e.stopPropagation();
					if (e.target.parentElement.classList.contains('default-click')) return;
					isHolding = false;
					holdTimeout = setTimeout(function(){
						isHolding = true;
						if(window.isplayerpaused) event.target.playVideo();
						event.target.setPlaybackRate(2);
						Notification("Vitesse: ","x2",true);
					}, 200); 
				});
				videoContainer.addEventListener('pointerup',function(e) {endHolding(e)});
				videoContainer.addEventListener('pointercancel',function(e) {endHolding(e)});videoContainer.addEventListener('pointerleave',function(e) {endHolding(e)});
				
				timelineContainer.addEventListener("pointermove", handleTimelineUpdate);
				timelineContainer.addEventListener("pointerdown", toggleScrubbing);
				
				wrapper.addEventListener("pointerup", function(e) {
					e.preventDefault();
					e.stopPropagation();
					if (isScrubbing) toggleScrubbing(e);
				});
				
				wrapper.addEventListener("pointermove", function(e) {
					e.preventDefault();
					e.stopPropagation();
					if (isScrubbing) handleTimelineUpdate(e);
				});
				
				videoContainer.classList.add("playerready");
				playerready = true;
				triggerEvent(wrapper,"pointerup");
			}.bind(this);
			
			var createplayer = function() {
				content.addEventListener(animationEvent, function(){					
					player = new YT.Player('ytplayer', {
						events: {
							'onReady': onPlayerReady,
							'onStateChange': onPlayerStateChange,
							'onError': onPlayerError
						}
					})
				});
			};
			
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
			
			var playAndpause = function(e) {
				if (playerready) {
					var title;
					if (player.getPlayerState() === 1) {
						player.pauseVideo();
						title = 'Lire (k)';
						stopAnime();
					} else {
						player.playVideo();
						title = 'Pause (k)';
						runAnime();
					}
					updateTitle(playPauseBtn,title);
					mouseHideelement();
				}
			};
			
			var volumeChange = function(val) {
				if (playerready) {
					var volumeactuel = player.getVolume();
					val = val * sautvolume;
					if ((val < 0 && volumeactuel === 0) || (val > 0 && volumeactuel === 100)) {
						val = 0;
					} 
					var volume = volumeactuel + val;
					player.setVolume(volume);
					Notification("Volume: ", volume + "%");
					toogleIconVolume();
				}
			};
			
			function mouseHideelement() {
				if(timercursor) clearTimeout(timercursor);
				if(toogleclick) return;
				var nb;
				noMobile ? nb = 0 : nb = 200;
				setTimeout(function(){
					content.classList.remove('autohide');
				},nb);
				timercursor = setTimeout(function(){
					focusedControls(true);
				},2000);
			}
			
			var focusedControls = function(b){
				var focused = document.activeElement;
				if ((videoContainer.classList.contains('paused') && b) || (content.classList.contains('open-setting') && focused === setting) || ( focused.tagName === "INPUT" && focused.name === "options")) return;
				content.classList.add('autohide')
			};
			
			var handleTimelineUpdate = function(e) {
				e.preventDefault();
				e.stopPropagation();
				var rect = timelineContainer.getBoundingClientRect();
				var percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
				var nbr = 0;
				if (percent < 0.1) {
					nbr = 0.02;
				}else if (percent > 0.90) {
					nbr = - 0.02;
				}
				timelineContainer.style.setProperty("--preview-position", percent);
				var currenttime = percent * player.getDuration();
				currentTimeSlider.textContent = formatDuration(currenttime);
				if (isScrubbing) {
					e.preventDefault();
					timelineContainer.style.setProperty("--progress-position", percent);
					clearInterval(this.intervalId);
					player.seekTo(currenttime);
					if(cell !== null) cell.dataset.currenttime = currenttime;
					changeOverlay(percent);
				}
				timelineContainer.style.setProperty("--position-timeline", percent + nbr);
				mouseHideelement();
			}.bind(this);
			
			var toggleScrubbing = function(e) {
				var rect = timelineContainer.getBoundingClientRect();
				var percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
				var currenttime = percent * player.getDuration();
				isScrubbing = (e.buttons & 1) === 1;
				videoContainer.classList.add("scrubbing");
				if (isScrubbing) {
					clearInterval(this.intervalId);
					player.seekTo(currenttime);
					if(cell !== null) cell.dataset.currenttime = currenttime;
				} else {
					videoContainer.classList.remove("scrubbing");
				}
				handleTimelineUpdate(e);
			}.bind(this);
			
			function changeOverlay(val){
				if(resultsplit){
					var bgoverlaydiff = Math.round(val * resultsplit[0].cells.length);
					var invisiblecelllenght = wrapper.querySelectorAll('.grid .cell-grid .cell.invisible').length;
					if(bgoverlaydiff !== nextvaluesplit){
						for (var i = 0; i < invisiblecelllenght ; i++) {
							if(resultsplit[0].cells[i]) resultsplit[0].cells[i].classList.remove('invisible');
						}
						for (var i = 0; i < bgoverlaydiff; i++) {
							if(resultsplit[0].cells[i]) resultsplit[0].cells[i].classList.add('invisible');
						}
						nextvaluesplit = bgoverlaydiff;
					}
				}
			};
			
			revenir.addEventListener("click",function(e){
				e.preventDefault();
				e.stopPropagation();
				skip(-10);
			});
			
			avancer.addEventListener("click", function(e){
				e.preventDefault();
				e.stopPropagation();
				skip(10);
			});
			
			function skip(durer) {
				if (playerready){
					if(timercursor) clearTimeout(timercursor);
					var duration = player.getDuration();
					var currenttime = player.getCurrentTime() + durer;
					var diff = parseFloat((currenttime/duration));
					player.seekTo(currenttime);
					timelineContainer.style.setProperty("--progress-position", diff);
					changeOverlay(diff);
					var t;
					durer >= 0 ? t='Avancer de' : t = 'Revenir de';
					Notification(t,`${durer} secondes`);
					mouseHideelement();
				}
			}
			
			function setVideoTime(num) {
				if (playerready){
					if(timercursor) clearTimeout(timercursor);
					num = num / 10;
					var duration = player.getDuration();
					var currenttime = duration * num;
					player.seekTo(currenttime);
					timelineContainer.style.setProperty("--progress-position", num);
					Notification('Emplacement de lecture',`${num * 100}%`);
				}
			}
			
			function addlistenClickPlayPause(el){
				el.addEventListener("click",function(e){
					e.preventDefault();
					e.stopPropagation();
					playAndpause(e);
				});
			}
			
			addlistenClickPlayPause(playPauseBtn);
			addlistenClickPlayPause(playPausebtncenter);
			
			function handleSingleClick(e) {
				if(isHolding) return;
				if(noMobile) {
					mediaboxclose.focus();
					if (isScrubbing) return;
					playAndpause(e);
				}else{
					if(toogleclick){
						focusedControls(false);
					}else{
						mouseHideelement();
					}
					toogleclick = !toogleclick;
				}
			}
			
			bigplayPauseBtn.addEventListener('click', handleSingleClick);
			
			bigplayPauseBtn.addEventListener('dblclick',function(e) {
				if(e.target !== bigplayPauseBtn) return;
				if(window.isMinimised) this.toggleMiniLecteure();
				toggleFullScreenMode();
			}.bind(this));
		
			fullScreenBtn.addEventListener("click",function(){
				if(window.isMinimised) this.toggleMiniLecteure();
				toggleFullScreenMode();
			}.bind(this));
			
			document.addEventListener("fullscreenchange",function() {
				document.body.classList.toggle("full-screen", document.fullscreenElement);
				var title;
				var btnsetting = content.querySelector('.button-setting');
				if(this.root.classList.contains("full-screen")){
					bigplayPauseBtn.insertBefore(mediaboxclose,skipContainer);
					window.isFullScreen = true;
					title = 'Quitter le plein écran (f)';
				}else{
					btnsetting.appendChild(mediaboxclose);
					window.isFullScreen = false;
					title = 'Plein écran (f)';
				}
				updateTitle(fullScreenBtn,title)
			}.bind(this));
			
			function toggleFullScreenMode() {
				if (playerready){
					if (fsChange() == null) {
						if (document.body.requestFullscreen) {
							document.body.requestFullscreen();
						} else if (document.body.mozRequestFullScreen) {
							document.body.mozRequestFullScreen();
						} else if (document.body.webkitRequestFullscreen) {
							document.body.webkitRequestFullscreen();
						}else if (document.body.msRequestFullscreen) {
							document.body.msRequestFullscreen();
						}
					} else {
						if (document.exitFullscreen) {
							document.exitFullscreen();
						} else if (document.mozCancelFullScreen) {
							document.mozCancelFullScreen();
						} else if (document.webkitExitFullscreen) {
							document.webkitExitFullscreen();
						} else if (document.msExitFullscreen) {
							document.msExitFullscreen();
						}
					}
				}
			}
			
			this.toggleMiniLecteure = function() {
				var title,title1,title2;
				if(window.isMinimised){
					this.root.classList.add('biglecteur');
					this.root.classList.remove('minilecteur');
					title = 'Agrandir le lecteur (i)';
					title1 = 'Vidéo suivante (↓)';
					title2 = 'Vidéo précédente (↑)';
					window.isMinimised = false;
					this.carousel.style[transformProperty] = this.carousel.style[transformProperty].replace(this.pattern, 'translateZ(-150px)');
					if (this.video.played) this.video.pause();
				}else{
					this.root.classList.add('minilecteur');
					this.root.classList.remove('biglecteur');
					title = 'Réduire le lecteur (i)';
					title1 = 'Vidéo suivante (Ctrl + ↓)';
					title2 = 'Vidéo précédente (Ctrl + ↑)';
					window.isMinimised = true;
					this.carousel.style[transformProperty] = this.carousel.style[transformProperty].replace(this.pattern, 'translateZ('+ this.radius +'px)');
					if (this.video.paused) this.video.play();
				}
				updateTitle(lecteurMini,title)
				updateTitle(nextvideo,title1);
				updateTitle(previousvideo,title2);
			}.bind(this);
			
			lecteurMini.addEventListener("click",this.toggleMiniLecteure)
			
			var toggleMute = function() {	
				if (playerready){
					var title;
					if(player.isMuted()){
						player.unMute();
						if (window.globalvolume === 0) window.globalvolume = 100;
						volumeSlider.value = window.globalvolume;
						player.setVolume(window.globalvolume);
						volumeSlider.style.backgroundSize = window.globalvolume + '% 100%';
						if (window.globalvolume >= 50) {
							videoContainer.dataset.volumeLevel = "high";
						} else {
							videoContainer.dataset.volumeLevel = "low";
						}
						title = 'Désactiver le son (s)';
						Notification("Volume: ", window.globalvolume + "%");
						window.globalmute = false;
						updateTitle(muteBtn,title);
					}else{
						changeIconeMute();
					}
				}
			};
			
			function changeIconeMute(){
				player.mute();
				volumeSlider.value = 0;
				player.setVolume(0);
				volumeSlider.style.backgroundSize = '0% 100%';
				videoContainer.dataset.volumeLevel = "muted";
				var title = 'Activer le son (s)';
				Notification("Volume: ", "0%");
				window.globalmute = true;
				updateTitle(muteBtn,title);
			}
			
			var toogleIconVolume = debounce(function() {
				var ytvolume = player.getVolume();
				volumeSlider.value = ytvolume;
				volumeSlider.style.backgroundSize = ytvolume + '% 100%';
				window.globalvolume = ytvolume;
				var volumeLevel;
				if (window.globalvolume === 0) {
					volumeLevel = "muted";
					return;
				} else if (window.globalvolume >= 50) {
					volumeLevel = "high";
				} else {
					volumeLevel = "low";
				}
				
				videoContainer.dataset.volumeLevel = volumeLevel;
				if(player.isMuted() && window.globalvolume > 0 ){
					player.unMute();
					window.globalmute = false;
				}
				videoContainer.dataset.volumeLevel = volumeLevel;
			},100);
			
			muteBtn.addEventListener("click", toggleMute);
			
			volumeSlider.addEventListener("input", function(e) {
				player.setVolume(e.target.value);
				toogleIconVolume();
				mouseHideelement();
			})
			
			function addlistnerNextPrevious(el,selector) {
				el.addEventListener('click', function(e) {
					e.stopPropagation();
					isClicked = true;
					if(this.timererror) clearTimeout(this.timererror)
					triggerEvent(document.querySelector(`#carousel-wrapper ${selector}`), 'mouseup');
					if ((fsChange() || window.isMinimised) && window.mediaboxPlayer) {
						playTofs()
					}
					setTimeout(function(){isClicked = false;},200)
				},false);
			}
			
			addlistnerNextPrevious(nextvideo,'.next-button')
			addlistnerNextPrevious(previousvideo,'.previous-button')
			
			mediaboxclose.addEventListener('click', function() {
				setTimeout(function(){
					this.root.classList.remove('minilecteur');
					window.isMinimised = false;
				}.bind(this),510)
				this.close();
			}.bind(this), false);
			
			mediaboxclose.addEventListener('mouseover', () => {
				isCloseHover = true;
				content.classList.add('hover');
			});

			mediaboxclose.addEventListener('mouseout', () => {
				isCloseHover = false;
				content.classList.remove('hover');
			});
			
			wrapper.addEventListener('click', function(e) {
				if(e.target.parentElement !== wrapper) return;
				if (document.activeElement === this.root) mediaboxclose.focus();
			}.bind(this), false);
			
			var toogleSetting = function(b) {
				var title;
				if (!content.classList.contains("open-setting")) {
					if (content.classList.contains("autohide")) content.classList.remove("autohide");
					content.classList.add("open-setting");
					title = 'Fermer options (o)';
					if(b) setting.focus();
				} else {
					content.classList.remove("open-setting");
					title = 'Ouvrir options (o)';
					var focused = document.activeElement;
					if (focused === setting || focused.tagName === "INPUT" && focused.name === "options"){
						if(b) focused.blur();
					}
					mouseHideelement();
				}
				updateTitle(setting,title)
			};

			setting.addEventListener('click', function(e) {
				e.stopPropagation();
				toogleSetting(false);
			}, false);
			
			var handlerBlur = function() {
				var timer;
				if (timer) clearTimeout(timer);
				if (content.classList.contains("open-setting")){
					timer = setTimeout(function(){
						var focused = document.activeElement;
						if (focused.tagName === "INPUT" && focused.name === "options") return;
						content.classList.remove("open-setting");
						updateTitle(setting,'Ouvrir options (o)');
						mouseHideelement();
					},250)
				}
			}
			
			setting.addEventListener('blur',handlerBlur);
			
			for(var el of checkbox){
				el.addEventListener('blur',handlerBlur);
			}
			
			content.addEventListener("touchstart", function(e) {
				if (e.touches.length !== 1) return;
				const touches = e.changedTouches[0];
				startY = touches.pageY;
			}, false);
			content.addEventListener("touchmove", function(e) {
				e.preventDefault();
				e.stopPropagation();
			}, false);
			content.addEventListener("touchend", function(e) {
				const touches = e.changedTouches[0];
				const betweenY = touches.pageY - startY;
				if (betweenY === 0) return;
				let orientation,orientationY;
				if (betweenY > 0) {
					orientationY = "dwn";
				} else {
					orientationY = "top";
				}
				if (Math.abs(betweenY) >= distance) {
					orientation = orientationY;
				}else{
					return;
				}
				if (orientation === "top" && !window.isMinimised) {
					return;
				} else if (orientation ==="dwn" & window.isMinimised) {
					return;
				}
				this.toggleMiniLecteure();
			}.bind(this), false);
			
			let holdTimerKey = null;
			let isHoldingKey = false;
			
			this.keydownExecute = function(e) {
				var codekey = e.keyCode || e.which;
				var duration;
				var focused = document.activeElement;
				focused === thumbIndicator? duration = 1 : duration = 10;
				if (focused !== thumbIndicator && !document.querySelector('#contain-pl.pl-active')) {
					if (codekey === 40) {
						skip(-duration);
					} else if (codekey === 38) {
						skip(duration);
					}
				}
				if(fsChange()){
					if (codekey === 37) {
						triggerEvent(previousvideo, 'click');
					} else if (codekey === 39) {
						triggerEvent(nextvideo, 'click');
					}
				}
				if (codekey === 109) {
					volumeChange(-1);
				} else if (codekey === 107) {
					volumeChange(1);
				}
				if (codekey === 32 && !e.repeat){
					isHoldingKey = false;
					holdTimerKey = setTimeout(function(){
						isHoldingKey = true;
						if(window.isplayerpaused) player.playVideo();
						player.setPlaybackRate(2);
						Notification("Vitesse: ","x2",true);
					}, 300);
				}
			};
			
			this.keyupExecute = function(e) {
				e.preventDefault();
				var codekey = e.keyCode || e.which;
				var percentage = keyCodes[codekey];
				if (codekey === 13) {
					var activefocus = document.activeElement;
					if (activefocus.type === "checkbox") {
						if (activefocus.id === "loop-video") {
							tooglecheckbox(0);
							cbvideoClick(true);
						} else if (activefocus.id === "loop-playlist") {
							tooglecheckbox(1);
							cbplaylistClick(true);
						} else if (activefocus.id === "shuffle-playlist") {
							tooglecheckbox(2);
							cbshuffleClick(true);
						}
					}
				} else if (codekey === 75) {
					playAndpause(e);
				} else if (codekey === 79) {
					toogleSetting(true);
				} else if (codekey === 70) {
					if(window.isMinimised) this.toggleMiniLecteure();
					toggleFullScreenMode();
				} else if (codekey === 83) {
					toggleMute();
				} else if (codekey === 76) {
					tooglecheckbox(2);
					cbshuffleClick(true);
				} else if (codekey === 80) {
					tooglecheckbox(1);
					cbplaylistClick(true);
				} else if (codekey === 82) {
					tooglecheckbox(0);
					cbvideoClick(true);
				} else if (percentage !== undefined){
					setVideoTime(percentage);
				} else if (codekey === 73){
					if(window.isFullScreen) toggleFullScreenMode();
					this.toggleMiniLecteure();
				} else if (codekey === 32){
					clearTimeout(holdTimerKey);
					if (isHoldingKey) {
						if(window.isplayerpaused) player.pauseVideo();
							player.setPlaybackRate(1);
							isHoldingKey = false;
							Notification("Vitesse: ","x1");
					} else {
						playAndpause();
					}
				}
			}.bind(this);

			this.root.addEventListener('keydown', this.keydownExecute, false);
			this.root.addEventListener('keyup', this.keyupExecute, false);
			
			var leadingZeroFormatter = new Intl.NumberFormat(undefined, {
				minimumIntegerDigits: 2,
			})
			function formatDuration(time) {
				var seconds = Math.floor(time % 60);
				var minutes = Math.floor(time / 60) % 60;
				var hours = Math.floor(time / 3600);
				if (hours === 0) {
					return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
				} else {
					return `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`;
				}
			}
			
			function runAnime(){
				if(wrapper) wrapper.classList.replace("stopanime","runanime");
			};
			
			function stopAnime(){
				if(wrapper) wrapper.classList.replace("runanime","stopanime");
			};
		},
		initElement: function(el,str) {
			if(typeof str == "undefined") str = 'box-center';
			cell = el;
			const parent = getClosest(cell,'.' + str);
			cell.classList.add('en_lecture');
			const index = Array.from(document.querySelectorAll('.carousel__cell')).indexOf(parent)
			window.oldcellcellIndex = index;
			this.radius = this.carousel.getAttribute('data-radius');
			if(!window.isMinimised){
				this.carousel.style[transformProperty] = this.carousel.style[transformProperty].replace(this.pattern, 'translateZ(-150px)');
				if (this.video.played) this.video.pause();
			}
			var link = this.parseUrl(el.getAttribute('href'));
			var imagelink = el.dataset.img;
			var title = el.querySelector('.yttitle').textContent;
			this.currenttime = el.dataset.currenttime;
			var globalid = el.dataset.globalid;
			var globalidsplit = globalid.split(',');
			var lastpid = globalidsplit[0];
			var lastvid = globalidsplit[1];
			setCookie("lastposition",globalid);
			setCookie(lastpid,lastvid);
			return [link, imagelink,title];
		},
		close: function() {
			if (wrapper === null) return;
			var timer = null;
			if (timer) clearTimeout(timer);
			if (window.mediaboxPlayer){
				cell.dataset.currenttime = '0';
			}
			if(this.intervalId) clearInterval(this.intervalId);
			this.root.classList.remove('biglecteur');
			wrapper.classList.add('mediabox-hide');
			this.root.classList.add('hide-box');
			window.mediaboxPlayer = null;
			if(!window.isMinimised){
				this.root.classList.remove('minilecteur');
				window.isMinimised = false;
				cell.focus({preventScroll:true});
				if (this.video.paused) this.video.play();
			}
			timer = setTimeout(function() {
				if (wrapper === null) return;
				if(fsChange()){
					if (document.exitFullscreen) {
						document.exitFullscreen();
					} else if (document.mozCancelFullScreen) {
						document.mozCancelFullScreen();
					} else if (document.webkitExitFullscreen) {
						document.webkitExitFullscreen();
					} else if (document.msExitFullscreen) {
						document.msExitFullscreen();
					}	
				}
				cell.classList.remove('en_lecture');
				this.root.classList.remove('stop-scroll', 'hide-box');
				window.mediaboxopen = false;
				if(wrapper.parentElement) this.root.removeChild(wrapper);
				this.root.removeEventListener('keydown', this.keydownExecute, false);
				this.root.removeEventListener('keyup', this.keyupExecute, false);
				this.navclavier.tabIndex = 0;
				wrapper = null;
				cell = null;
				var event = document.createEvent('Event');
				event.initEvent('popupClosed', true, true);
				document.dispatchEvent(event);
			}.bind(this), 500);
			this.carousel.style[transformProperty] = this.carousel.style[transformProperty].replace(this.pattern, 'translateZ('+ this.radius +'px)');
		},
		serialize: function(obj) {
			return '?' + Object.keys(obj).reduce(function(a, k) {
				a.push(k + '=' + encodeURIComponent(obj[k]));
				return a
			}, []).join('&')
		}
	};

	return MediaBox;
}));



/**
 * Object.assign polyfill for IE support
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
 */
if (typeof Object.assign != 'function') {
	Object.defineProperty(Object, "assign", {
		value: function assign(target, varArgs) {
			'use strict';
			if (target === null) {
				throw new TypeError('Cannot convert undefined or null to object');
			}

			var to = Object(target);

			for (var index = 1; index < arguments.length; index++) {
				var nextSource = arguments[index];

				if (nextSource != null) {
					for (var nextKey in nextSource) {
						if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
			}
			return to;
		},
		writable: true,
		configurable: true
	});
}