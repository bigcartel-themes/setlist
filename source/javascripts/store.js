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

$('.option-item:not(.sold-out)').click(function(e) { 
  var option_id = $(this).data("option-id");
  if (option_id > 0) { 
    $('.hidden-product-option').val(option_id);
    $('.option-item').removeClass('selected');
    $(this).addClass('selected');
    $('.product-price .price-holder').html($(this).data('option-price'));
  }
});

if ( $('.options-list').length) { 
  var selected_option = $('.options-list li:not(.sold-out):first');
  var option_id = selected_option.data('option-id');
  if (option_id > 0) { 
    $('.hidden-product-option').val(option_id);
    selected_option.addClass('selected');
  }
}

$('.product-options').on('change',function() {
  $('.product-price .price-holder').html($('.product-options :selected').data('option-price'));
});

$('.product-form').submit(function(e) {
  e.preventDefault();
  var quantity = $(this).find(".product-quantity").val()
  , itemID = $(this).find("#option").val()
  , addButton = $(this).find('.add-to-cart-button')
  , addText = $(this).find('.status-text')
  , addTextValue = addText.html()
  , addedText = addButton.data('added-text')
  , addingText = addButton.data('adding-text');
  if (quantity > 0 && itemID > 0) { 
    addText.html(addingText);
    Cart.addItem(itemID, quantity, function(cart) { 
      addText.html(addedText);
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
    });
    setTimeout(function() {
      addText.clone().appendTo(addButton).html(addTextValue).hide();
      addButton.find('span').first().remove();
      addButton.find('span').first().fadeIn(400);
      addButton.blur();
    }, 800);
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
    if (window.location.href.indexOf("/cart") == -1) {
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
  if ($('.cart-shipping-amount').length) { 
    if (cart.shipping.amount) {
      var shipping_amount = '<span>'+Format.money(cart.shipping && cart.shipping.amount ? cart.shipping.amount : 0, true, true)+'</span>';
    }
    else {
      var shipping_amount = '<span>'+Format.money(0, true, true)+'</span>';
    }
    $('.cart-shipping-amount').html(shipping_amount);
  }
  if ($('.cart-discount-amount').length) {
    if (cart.discount) {
      $('.apply-discount').addClass('cancel-discount').removeClass('apply-discount');
      $('.cart-discount-code').val(cart.discount.name);
      $('.cart-discount-code').prop("disabled", true);
      if (cart.discount.type == 'free_shipping') { 
        var discount_amount = '<span></span>';
      }
      else { 
        var discount_amount = '<span>- '+Format.money(cart.discount && cart.discount.amount ? cart.discount.amount : 0, true, true)+'</span>';
      }
    }
    else {
      $('.cancel-discount').addClass('apply-discount').removeClass('cancel-discount');
      $('.cart-discount-code').val('');
      $('.cart-discount-code').prop("disabled", false);
      var discount_amount = '<span>'+Format.money(0, true, true)+'</span>';
    }
    $('.cart-discount-amount').html(discount_amount);
  }
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

  .on('click','.apply-discount', function(e) {
    e.preventDefault();
    $('.checkout-btn').attr('name','update');
    Cart.updateFromForm("cart-form", function(cart) { 
      updateTotals(cart);
    });
  })
  .on( 'blur','.cart-discount-code', function(e) {
    e.preventDefault();
    $('.checkout-btn').attr('name','update');
    Cart.updateFromForm("cart-form", function(cart) { 
      updateTotals(cart);
    });
  })
  .on('change','[name="cart[shipping_country_id]"]', function(e) {
    Cart.updateFromForm("cart-form", function(cart) { 
      updateTotals(cart);
    });
  })
  .on('keyup','[name="cart[discount_code]"]', function(e) {
    if (e.keyCode == 13) {
      e.preventDefault(); 
      $(this).closest('.checkout-btn').attr('name','update');
      Cart.updateFromForm("cart-form", function(cart) { 
        updateTotals(cart);
      });
      return false;
    }
  })
  .on('click','.cancel-discount', function(e) {  
    e.preventDefault(); 
    $('.cart-form').append('<input class="empty-discount" name="cart[discount_code]" type="hidden" value="">');
    Cart.updateFromForm("cart-form", function(cart) { 
      updateTotals(cart);
      $('.empty-discount').remove(0);
    });
  })
  
  .on('focus','.cart-discount-code', function(e) {
    $(this).removeClass('has-errors');
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

window.addEventListener( 'touchmove', function() {})