var inPreview = (/\/admin\/design/.test(top.location.pathname));

API.onError = function(errors) {
  $('.errors').remove();
  var $errorList = $('<ul>', { class: 'errors'} )
    , $cartForm = $('.cart-form')
    , $productError = $('#product .left-panel');
  $.each(errors, function(index, error) {
    $errorList.append($('<li>').html(error));
  });
  if ($('.cart-overlay').hasClass('open') || $("body#cart").length) {
    $errorList.addClass('cart-errors');
    $cartForm.prepend($errorList);
  }
  else {
    $errorList.addClass('product-errors');
    $($errorList).insertAfter('.left-panel .store-link');
  }
  if ($('.cart-overlay').hasClass('open')) {
    $(".cart-overlay").animate({ scrollTop: 0 }, "fast");

  }
  else {
    $("html,body").animate({ scrollTop: 0 }, "fast");
  }
}

$('.product-form').submit(function(e) {
  e.preventDefault();
  var quantity = $(this).find(".product-quantity").val()
  , itemID = $(this).find("#option").val()
  , addButton = $(this).find('.add-to-cart-button')
  , addText = addButton.html()
  , addedText = addButton.data('added-text')
  , addingText = addButton.data('adding-text');
  if (quantity > 0 && itemID > 0) {
    addButton.html(addingText);
    Cart.addItem(itemID, quantity, function(cart) {
      addButton.html(addedText);
      if ($('.product-errors').length) {
        $('.product-errors').hide();
      }
      var $first = $(".cart-icon svg");
      var $second = $(".cart-num-items");
      $second.html(cart.item_count)
      animateCartCount($first, $second);
      var tmp = $first;
      $first = $second;
      $second = tmp;
      setTimeout(function() {
        addButton.html(addText);
      }, 900)
    });
  }
});

$('.open-navigation').click(function(e) {
  e.preventDefault();
  openOverlay('navigation');
});

$('.close-overlay').click(function(e) {
  e.preventDefault();
  closeOverlay();
});

function openOverlay(type) {
  if (type == 'cart') {
    $('.cart-overlay').load("/cart?" + $.now() + " .left-panel > *", function() {
    $('.page-overlay').fadeIn('fast');
    $('.menu-item').fadeOut('fast', function() {
      $('.close-overlay').fadeIn('fast');
    });
    $('html').css('overflow-y','hidden');
    $('.left-panel').css('height','100vh');
      $('.cart-overlay').toggleClass('open');
    });
  }
  if (type == 'navigation') {
    $('.page-overlay').fadeIn('fast');
    $('.menu-item').fadeOut('fast', function() {
      $('.close-overlay').fadeIn('fast');
    });
    $('html').css('overflow-y','hidden');
    $('.left-panel').css('height','100vh');
    $('.navigation-overlay').toggleClass('open');
  }
}
function closeOverlay() {
  $('.page-overlay').fadeOut('fast');
  $('.close-overlay').fadeOut('fast', function() {
    $('.menu-item').fadeIn('fast');
  });
  $('html').css('overflow-y','scroll');
  $('.left-panel').css('height','auto');
  $('.cart-overlay').removeClass('open');
  $('.navigation-overlay').removeClass('open');
}
$('.open-cart').click(function(e) {
  if (!inPreview) {
    e.preventDefault();
    var currentURL = window.location.href;
    var lastPart = currentURL.substr(currentURL.lastIndexOf('/') + 1);
    if (lastPart != 'cart') {
      openOverlay('cart');
    }
  }
});
function animateCartCount($src, $tgt){
  var $parent = $src.parent();
  var width = $parent.width();
  var srcWidth = $src.width();

  $src.css({position: 'absolute'});
  $tgt.hide().appendTo($parent).css({left: width, position: 'absolute'});

  $src.animate({left : -width}, 300, function(){
    $src.hide();
    $src.css({left: null, position: null});
  });
  $tgt.show().animate({left: 0}, 300, function(){
    $tgt.css({left: null, position: null});
  });
}
var processUpdate = function(input, item_id, new_val, cart) {
  var item_count = cart.item_count;
  if (item_count == 0) {
    $('.cart-form .cart-empty-holder').fadeIn('fast');
    $('.cart-footer').fadeOut('fast');
    $('.cart-items').remove();
    $('.cart-errors').remove();
    var $first = $(".cart-num-items");
    var $second = $(".cart-icon svg");
    animateCartCount($first, $second);
    var tmp = $first;
    $first = $second;
    $second = tmp;
  }
  else {
    input.val(new_val);
    updateTotals(cart);
  }
  if (new_val == 0) {
    $('.cart-item[data-cart-id="'+item_id+'"]').slideUp('fast');
  }
  return false;
}

var updateTotals = function(cart) {
  var sub_total = Format.money(cart.total, true, true);
  var item_count = cart.item_count;
  $('.cart-errors').remove();
  $('.cart-total-amount').html(sub_total);
  $('.cart-num-items').html(item_count);
  $('.checkout-btn').attr("name","checkout");
}

$('body')
  .on( 'click','.qty-button', function() {
    var $t = $(this)
    , input = $(this).parent().find('input')
    , val = parseInt(input.val())
    , valMin = 1
    , item_id = $(this).parent().data("cart-id");
    if (isNaN(val) || val < valMin) {
      var new_val = valMin;
    }
    if ($t.data('func') == 'plus') {
      var new_val = val + 1;
    }
    else {
      if (val > valMin) {
        var new_val = val - 1;
      }
    }
    if (new_val > 0) {
      Cart.updateItem(item_id, new_val, function(cart) {
        processUpdate(input, item_id, new_val, cart);
      });
    }
    else {
      Cart.removeItem(item_id, function(cart) {
        processUpdate(input, item_id, 0, cart);
      });
    }
  })
  .on( 'blur','.qty-input', function(e) {
    e.preventDefault();
    var item_id = $(this).parent().data("cart-id");
    var new_val = $(this).val();
    var input = $(this);
    if (!isNaN(new_val)) {
      Cart.updateItem(item_id, new_val, function(cart) {
        processUpdate(input, item_id, new_val, cart);
      });
    }
  })

$(document).click(function(e) {
  var container = $('.content-overlay');
  if ($('.page-overlay').is(e.target)) {
    if (container.hasClass('open')) {
      e.preventDefault();
      closeOverlay();
    }
  }
});

$(document).ready(function () {
  var swipingCarousel = $('.image-list-container');
  var swipingCarouselCells = $('.image-list-container > a');
  swipingCarouselOptions = {
    accessibility: false,
    wrapAround: false,
    dragThreshold: 8,
    prevNextButtons: false,
    imagesLoaded: true,
    setGallerySize: false,
    selectedAttraction: 0.025,
    friction: 0.28
  }
  swipingCarousel.flickity(swipingCarouselOptions);
  hoverCarousel = $('.product-list');
  hoverCarouselCells = $('.product-list a');
  hoverCarouselOptions = {
    accessibility: false,
    wrapAround: false,
    prevNextButtons: false,
    dragThreshold: 8,
    pageDots: false,
    containCells: true,
    lazyLoad: true,
    groupCells: true,
    freeScroll: true,
    freeScrollFriction: 0,
    asNavFor: '.image-list-container',
    watchCSS: true
  }
  productImages = $('.full-product-images');
  productImagesCells = $('.full-product-images > div');
  productImagesOptions = {
    accessibility: false,
    wrapAround: true,
    prevNextButtons: false,
    dragThreshold: 8,
    imagesLoaded: true,
    setGallerySize: true,
    adaptiveHeight: true
  }
  desktopProductImagesOptions = {
    accessibility: false,
    wrapAround: true,
    prevNextButtons: false,
    dragThreshold: 8,
    imagesLoaded: true,
    setGallerySize: true,
    adaptiveHeight: false
  }
  productImages.flickity(productImagesOptions);
  productThumbnailNav = $('.product-thumbnails');
  productThumbnailNavOptions = {
    accessibility: false,
    wrapAround: false,
    prevNextButtons: false,
    imagesLoaded: true,
    prevNextButtons: false,
    dragThreshold: 8,
    lazyLoad: true,
    pageDots: false,
    containCells: true,
    groupCells: true,
    freeScroll: true,
    freeScrollFriction: 0,
    watchCSS: true,
    asNavFor: '.full-product-images',
  }
  productThumbnailNav.flickity(productThumbnailNavOptions);

  $(window).resize(function () {
    if ($(window).width() >= 1025) {
      hoverCarousel.flickity(hoverCarouselOptions);
      productImages.flickity(desktopProductImagesOptions);
    }
    else {
      swipingCarousel.flickity(swipingCarouselOptions);
    }
  });
  if ($(window).width() >= 1025) {
    hoverCarousel.flickity(hoverCarouselOptions);
  }
  else {
    swipingCarousel.flickity(swipingCarouselOptions);
  }
  $('.product-list').on( 'mouseover', '.product-card', function() {
    var index = $(this).index();
    swipingCarousel.flickity( 'select', index );
  });
});

var isGreaterThanZero = function(currentValue) {
  return currentValue > 0;
}

function arrayContainsArray(superset, subset) {
  if (0 === subset.length) {
    return false;
  }
  return subset.every(function (value) {
    return (superset.indexOf(value) >= 0);
  });
}

function unique(item, index, array) {
  return array.indexOf(item) == index;
}

function cartesianProduct(a) {
  var i, j, l, m, a1, o = [];
  if (!a || a.length == 0) return a;
  a1 = a.splice(0, 1)[0];
  a = cartesianProduct(a);
  for (i = 0, l = a1.length; i < l; i++) {
    if (a && a.length) for (j = 0, m = a.length; j < m; j++)
      o.push([a1[i]].concat(a[j]));
    else
      o.push([a1[i]]);
  }
  return o;
}

Array.prototype.equals = function (array) {
  if (!array)
    return false;
  if (this.length != array.length)
    return false;
  for (var i = 0, l=this.length; i < l; i++) {
    if (this[i] instanceof Array && array[i] instanceof Array) {
      if (!this[i].equals(array[i]))
        return false;
    }
    else if (this[i] != array[i]) {
      return false;
    }
  }
  return true;
}

// From https://github.com/kevlatus/polyfill-array-includes/blob/master/array-includes.js
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function (searchElement, fromIndex) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }
      var o = Object(this);
      var len = o.length >>> 0;
      if (len === 0) {
        return false;
      }
      var n = fromIndex | 0;
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }
      while (k < len) {
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        k++;
      }
      return false;
    }
  });
}

Array.prototype.count = function(filterMethod) {
  return this.reduce((count, item) => filterMethod(item)? count + 1 : count, 0);
}

$('.product_option_select').on('change',function() {
  var option_price = $(this).find("option:selected").attr("data-price");
  enableAddButton(option_price);
});

function enableAddButton(updated_price) {
  var addButton = $('.add-to-cart-button');
  var addButtonTitle = addButton.attr('data-add-title');
  addButton.attr("disabled",false);
  if (updated_price) {
    priceTitle = ' - ' + Format.money(updated_price, true, true);
  }
  else {
    priceTitle = '';
  }
  addButton.html(addButtonTitle + priceTitle);
}

function disableAddButton(type) {
  var addButton = $('.add-to-cart-button');
  var addButtonTitle = addButton.attr('data-add-title');
  if (type == "sold-out") {
    var addButtonTitle = addButton.attr('data-sold-title');
  }
  if (!addButton.is(":disabled")) {
    addButton.attr("disabled","disabled");
  }
  addButton.html(addButtonTitle);
}

function enableSelectOption(select_option) {
  select_option.removeAttr("disabled");
  select_option.text(select_option.attr("data-name"));
  select_option.removeAttr("disabled-type");
  if ((select_option.parent().is('span'))) {
    select_option.unwrap();
  }
}
function disableSelectOption(select_option, type) {
  if (type === "sold-out") {
    disabled_text = select_option.parent().attr("data-sold-text");
    disabled_type = "sold-out";
    if (show_sold_out_product_options === 'false') {
      hide_option = true;
    }
    else {
      hide_option = false;
    }
  }
  if (type === "unavailable") {
    disabled_text = select_option.parent().attr("data-unavailable-text");
    disabled_type = "unavailable";
    hide_option = true;
  }
  if (select_option.val() > 0) {
    var name = select_option.attr("data-name");
    select_option.attr("disabled",true);
    select_option.text(name + ' ' + disabled_text);
    select_option.attr("disabled-type",disabled_type);
    if (hide_option === true) {
      if (!(select_option.parent().is('span'))) {
        select_option.wrap('<span>');
      }
    }
  }
}
window.addEventListener( 'touchmove', function() {})
