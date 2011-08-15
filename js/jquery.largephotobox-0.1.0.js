/**
 * jQuery largePhotoBox plugin
 * This jQuery plugin was inspired and based on lightBox by Leandro Vieira (http://leandrovieira.com/projects/jquery/lightbox/)
 * and the Parallax effect of Danilo (http://www.tidbits.com.br/myparallax-parallax-com-javascript-com-jquery)
 * and modified by me.
 * @name jquery-largephotobox-0.1.0.js
 * @author Acaz Souza Pereira - acazsouza@gmail.com
 * @version 0.1.0
 * @date August 07, 2009
 * @category jQuery plugin
 * @copyright (c) 2009 Acaz Souza Pereira (acazsouza@gmail.com)
 * @license CC Attribution-No Derivative Works 2.5 Brazil - http://creativecommons.org/licenses/by-nd/2.5/br/deed.en_US
 * @example Visit http://code.google.com/p/jquery-largephotobox/ for more informations about this jQuery plugin
 */

// Offering a Custom Alias suport - More info: http://docs.jquery.com/Plugins/Authoring#Custom_Alias
(function($){
	/**
	 * $ is an alias to jQuery object
	 *
	 */
 	$.fn.largePhotoBox = function(settings) {

		// Settings to configure the jQuery largePhotoBox plugin how you like
		settings = jQuery.extend({
			// Configuration related to overlay
			overlayBgColor: 		'#000',		// (string) Background color to overlay; inform a hexadecimal value like: #RRGGBB. Where RR, GG, and BB are the hexadecimal values for the red, green, and blue values of the color.
			overlayOpacity:			0.8,		// (integer) Opacity value to overlay; inform: 0.X. Where X are number from 0 to 9

			// Configuration related to images
			imageLoading:			'images/largephotobox-ico-loading.gif',		// (string) Path and the name of the loading icon
			imageBtnClose:			'images/largephotobox-btn-close.png',		// (string) Path and the name of the close btn
			
			// Configuration related to image box
			marginSize:				20,			// (integer) Size in pixels of the side margins
			
			// Configuration related to keyboard navigation
			keyToClose:				'c',		// (string) (c = close) Letter to close the jQuery largePhotoBox interface. Beyond this letter, the letter X and the SCAPE key is used to.
			
			// Don't alter these variables in any way
			imageArray:				[],
			activeImage:			0
		},settings);
		
		// Global variables
		var arrPageSizes = [];
		var sizeMode = 0;
		
		// Caching the jQuery object with all elements matched
		var jQueryMatchedObj = this; // This, in this context, refer to jQuery object
		
		/**
		 * Initializing the plugin calling the start function
		 *
		 * @return boolean false
		 */
		function _initialize() {
			_start(this,jQueryMatchedObj); // This, in this context, refer to object (link) which the user have clicked
			return false; // Avoid the browser following the link
		}
		
		/**
		 * Start the jQuery largePhotoBox plugin
		 *
		 * @param object objClicked The object (link) whick the user have clicked
		 * @param object jQueryMatchedObj The jQuery object with all elements matched
		 */
		function _start(objClicked,jQueryMatchedObj) {
			// Hide some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'hidden' });
			
			// Call the function to create the markup structure; style some elements; assign events in some elements.
			_set_interface();
			
			// Unset total images in imageArray
			settings.imageArray.length = 0;
			
			// Unset image active information
			settings.activeImage = 0;
			
			// We have an image set? Or just an image? Let's see it.
			if ( jQueryMatchedObj.length == 1 ) {
				settings.imageArray.push(new Array(objClicked.getAttribute('href')));
			} else {
				// Add an Array (as many as we have), with href atribute, inside the Array that storage the images references		
				for ( var i = 0; i < jQueryMatchedObj.length; i++ ) {
					settings.imageArray.push(new Array(jQueryMatchedObj[i].getAttribute('href')));
				}
			}
			while ( settings.imageArray[settings.activeImage][0] != objClicked.getAttribute('href') ) {
				settings.activeImage++;
			}
			
			// Set current mode
			sizeMode = 0;
			
			// Call the function that prepares image exibition
			_set_image_to_view();
		}
		
		/**
		 * Prepares image exibition
		 *
		 */
		function _set_image_to_view() { // show the loading
			// Hide some elements
			$('#largephotobox-image,#largephotobox-btnclose').hide();
		
			// Image preload process
			var objImagePreloader = new Image();
			
			objImagePreloader.onload = function() {
				$('#largephotobox-image').attr('src',settings.imageArray[settings.activeImage][0]);
				
				if (sizeMode == 0) {
					// Resize image container in original image size mode
					_resize_image_original_size_mode(objImagePreloader.width, objImagePreloader.height);
				}
				else {
					// Resize image in 100% size mode
					_resize_image_100_size_mode(objImagePreloader.width, objImagePreloader.height)
				}
				
				// clear onLoad, IE behaves irratically with animated gifs otherwise
				objImagePreloader.onload=function(){};
			};
			objImagePreloader.src = settings.imageArray[settings.activeImage][0];
		};

		/**
		 * Resize image in original size mode
		 *
		 * @param integer intImageWidth The image's width
		 * @param integer intImageHeight The image's height
		 */
		function _resize_image_original_size_mode(intImageWidth, intImageHeight) {
			// Set current mode
			sizeMode = 0;
			
			// Set width and height image to auto
			$('#largephotobox-image').width('auto');
			$('#largephotobox-image').height('auto');
			
			// Resize container image
			_resize_container_image(intImageWidth, intImageHeight)
			
			// Set the parallax effect in image
			_set_parallax_effect();
			
			// Set click in image to alter resize in 100%
			$('#largephotobox-image').unbind('click').click(function() {
				$('#largephotobox-image, #largephotobox-btnclose').fadeOut(function() {
					_resize_image_100_size_mode(intImageWidth, intImageHeight);
				});
			})
			
			// Show image
			$('#largephotobox-image, #largephotobox-btnclose').fadeIn();
		};
		
		/**
		 * Resize image in 100% size mode
		 *
		 * @param integer intImageWidth The image's width
		 * @param integer intImageHeight The image's height
		 */
		function _resize_image_100_size_mode(intImageWidth, intImageHeight) {
			// Set current mode
			sizeMode = 1;
			
			// Get width and height of the window and remove the side margins
			var margin = (settings.marginSize * 2)
			var imageMaxWidth = arrPageSizes[2] - margin;
			var imageMaxHeight = arrPageSizes[3] - margin;

			// Set click in image to alter resize in 100% or original size
			if (imageMaxWidth < intImageWidth && imageMaxHeight < intImageHeight) {
				if (intImageWidth > intImageHeight) {
					$('#largephotobox-image').width(imageMaxWidth);
				}
				else {
					$('#largephotobox-image').height(imageMaxHeight);
				}
			}
			else if (imageMaxWidth < intImageWidth) {
				$('#largephotobox-image').width(imageMaxWidth);
			}
			else if (imageMaxHeight < intImageHeight) {
				$('#largephotobox-image').height(imageMaxHeight);
			}
			
			// Unbind mousemove event
			$('#largephotobox-container-image').unbind('mousemove');
			
			// Reset position of image
			$('#largephotobox-image').css({
				top: 0,
				left: 0
			});
			
			// Resize container image
			_resize_container_image($('#largephotobox-image').width(), $('#largephotobox-image').height());
			
			// Set click in image to alter resize in original size
			$('#largephotobox-image').unbind('click').click(function() {
				$('#largephotobox-image, #largephotobox-btnclose').fadeOut(function() {
					_resize_image_original_size_mode(intImageWidth, intImageHeight);
				});
			});
			
			// Show image
			$('#largephotobox-image, #largephotobox-btnclose').fadeIn();
		};
		
		/**
		 * Resize container image
		 *
		 * @param integer intImageWidth The image's width
		 * @param integer intImageHeight The image's height
		 */
		function _resize_container_image(intImageWidth, intImageHeight) {
			// Get width and height of the window and remove the side margins
			var margin = (settings.marginSize * 2)
			var imageMaxWidth = arrPageSizes[2] - margin;
			var imageMaxHeight = arrPageSizes[3] - margin;
			
			// Verify image sizes with page sizes and set width and height
			// Verify and set width
			if (imageMaxWidth < intImageWidth) { // If window width is smaller than the image
				$('#largephotobox-container').css({
					width:		imageMaxWidth,
					marginLeft:	- (imageMaxWidth / 2)
				});
				$('#largephotobox-container-image').width(imageMaxWidth);
			}
			else { // If window width is larger than the image
				$('#largephotobox-container').css({
					width:		intImageWidth,
					marginLeft:	- (intImageWidth / 2)
				});
				$('#largephotobox-container-image').width(intImageWidth);
			}
			
			// Verify and set height
			if (imageMaxHeight < intImageHeight) { // If window height is smaller than the image
				$('#largephotobox-container').css({
					height:		imageMaxHeight,
					marginTop:	- (imageMaxHeight / 2)
				});
				$('#largephotobox-container-image').height(imageMaxHeight);
			}
			else { // If window height is larger than the image
				$('#largephotobox-container').css({
					height:		intImageHeight,
					marginTop:	- (intImageHeight / 2)
				});
				$('#largephotobox-container-image').height(intImageHeight);
			}
		};
		
		/**
		 * Set the parallax effect in image
		 *
		 */
		function _set_parallax_effect(intImageWidth, intImageHeight) {
			$('#largephotobox-container-image').mousemove(function(e){
				var posX = $('#largephotobox-container-image').offset().left;
				var posY = $('#largephotobox-container-image').offset().top;
				
				var containerX = $('#largephotobox-container-image').width();
				var containerY = $('#largephotobox-container-image').height();
				
				var contentX = $('#largephotobox-image').width();
				var contentY = $('#largephotobox-image').height();
				
				var differenceX = contentX - containerX;
				var differenceY = contentY - containerY;
				
				var halfX = - parseInt(differenceX / 2);
				var halfy = - parseInt(differenceY / 2);
				
				porcentageX = parseInt( (e.pageX - posX) / containerX * 100);
				porcentagey = parseInt( (e.pageY - posY) / containerY * 100);
				leftPosition = parseInt(0 - (differenceX  / 100 * porcentageX ));
				topPosition = parseInt(0 - (differenceY  / 100 * porcentagey ));
				$('#largephotobox-image').css({
					top: topPosition,
					left: leftPosition
				});
			});
		};
		
		/**
		 * Show the prepared image
		 *
		 */
		function _show_image() {
			$('#largephotobox-image, #largephotobox-btnclose').fadeIn(function() {
				_enable_keyboard_navigation();
			});
		};

		/**
		 * Create the jQuery largePhotoBox plugin interface
		 *
		 * The HTML markup will be like that:
			<div id="jquery-overlay"></div>
			<div id="jquery-largephotobox">
				<div id="largephotobox-container">
					<a href="#" id="largephotobox-btnclose">
						<img src="">
					</a>
					<div id="largephotobox-container-image">
						<img src="" id="largephotobox-image">
					</div>
				</div>
			</div>
		 *
		 */
		function _set_interface() {
			// Apply the HTML markup into body tag
			$('body').append('<div id="jquery-overlay"></div><div id="jquery-largephotobox" style="background:transparent url(' + settings.imageLoading + ') no-repeat scroll center"><div id="largephotobox-container"><a href="#" id="largephotobox-btnclose" style="display:none"><img src="' + settings.imageBtnClose + '"></a><div id="largephotobox-container-image"><img src="" id="largephotobox-image"></div></div></div>');	
			
			// Get page sizes
			arrPageSizes = ___getPageSize();
			
			// Style overlay  and show it
			$('#jquery-overlay').css({
				backgroundColor:	settings.overlayBgColor,
				opacity:			settings.overlayOpacity,
				width:				arrPageSizes[0],
				height:				arrPageSizes[1]
			}).fadeIn();
			
			// Set width and height to jquery-largephotobox div
			$('#jquery-largephotobox').css({
				width:				arrPageSizes[2],
				height:				arrPageSizes[3]
			});
			
			// Assign the _finish function to largephotobox-btnclose objects
			$('#largephotobox-btnclose').click(function() {
				_finish();
				return false;
			});
			
			// If window was resized, calculate the new overlay dimensions
			$(window).resize(function() {
				// Get page sizes
				arrPageSizes = ___getPageSize();
				
				// Set width and height to overlay div
				$('#jquery-overlay').css({
					width:		arrPageSizes[0],
					height:		arrPageSizes[1]
				});
				
				// Set width and height to jquery-largephotobox div
				$('#jquery-largephotobox').css({
					width:		arrPageSizes[2],
					height:		arrPageSizes[3]
				});
			
				_set_image_to_view();
			});
		}
		
		/**
		 * Remove jQuery largePhotoBox plugin HTML markup
		 *
		 */
		function _finish() {
			$('#jquery-largephotobox').remove();
			$('#jquery-overlay').fadeOut(function() { $('#jquery-overlay').remove(); });
			
			// Show some elements to avoid conflict with overlay in IE. These elements appear above the overlay.
			$('embed, object, select').css({ 'visibility' : 'visible' });
		}
		
		/**
		 * Enable a support to keyboard navigation
		 *
		 */
		function _enable_keyboard_navigation() {
			$(document).keydown(function(objEvent) {
				//_keyboard_action(objEvent);
				alert('teste');
			});
		}

		/**
		 * Perform the keyboard actions
		 *
		 */
		function _keyboard_action(objEvent) {
			// To ie
			if (objEvent == null) {
				keycode = event.keyCode;
				escapeKey = 27;
			}
			else { // To Mozilla
				keycode = objEvent.keyCode;
				escapeKey = objEvent.DOM_VK_ESCAPE;
			}
			
			// Get the key in lower case form
			key = String.fromCharCode(keycode).toLowerCase();
			
			// Verify the keys to close the largePhotoBox
			if ((key == settings.keyToClose) || (key == 'x') || (keycode == escapeKey)) {
				_finish();
			}
		}
		
		/**
		 / THIRD FUNCTION
		 * getPageSize() by quirksmode.com
		 *
		 * @return Array Return an array with page width, height and window width, height
		 */
		function ___getPageSize() {
			var xScroll, yScroll;
			if (window.innerHeight && window.scrollMaxY) {	
				xScroll = window.innerWidth + window.scrollMaxX;
				yScroll = window.innerHeight + window.scrollMaxY;
			} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
				xScroll = document.body.scrollWidth;
				yScroll = document.body.scrollHeight;
			} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
				xScroll = document.body.offsetWidth;
				yScroll = document.body.offsetHeight;
			}
			var windowWidth, windowHeight;
			if (self.innerHeight) {	// all except Explorer
				if(document.documentElement.clientWidth){
					windowWidth = document.documentElement.clientWidth;
				} else {
					windowWidth = self.innerWidth;
				}
				windowHeight = self.innerHeight;
			} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
				windowWidth = document.documentElement.clientWidth;
				windowHeight = document.documentElement.clientHeight;
			} else if (document.body) { // other Explorers
				windowWidth = document.body.clientWidth;
				windowHeight = document.body.clientHeight;
			}
			// for small pages with total height less then height of the viewport
			if(yScroll < windowHeight){
				pageHeight = windowHeight;
			} else {
				pageHeight = yScroll;
			}
			// for small pages with total width less then width of the viewport
			if(xScroll < windowWidth){
				pageWidth = xScroll;
			} else {
				pageWidth = windowWidth;
			}
			arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight);
			return arrayPageSize;
		};

		// Return the jQuery object for chaining. The unbind method is used to avoid click conflict when the plugin is called more than once
		return this.unbind('click').click(_initialize);
	};
	
})(jQuery);