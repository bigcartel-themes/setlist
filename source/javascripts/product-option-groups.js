function processProduct(product) {
  if (product.has_option_groups) {
    disableAddButton("add-to-cart");
    setInitialProductOptionStatuses(product);
    $('.product-form.option-groups-enabled').fadeIn('fast');
    $("select.product_option_group").on('change',function() {
      disableAddButton("add-to-cart");
      $('#option').val(0);
      changed_value = parseInt($(this).val());
      processAvailableDropdownOptions(product, $(this), changed_value);
    });
    $(".product-option-value-radio").on('click', function() {
      if (!$(this).parent().attr('disabled')) {
        disableAddButton("add-to-cart");
        $('#option').val(0);
        changed_value = parseInt($(this).val());
        processAvailableDropdownOptions(product, $(this).parent().parent(), changed_value);
      }
    })
    if ($('#option').val() > 0) {
      enableAddButton();
    }
  }

  $('.reset-selection-button').on('click', function() {
    disableAddButton("add-to-cart");
    $('#option').val(0);
    $(this).hide();
    if (product_option_display == 'dropdown') {
      $(".product_option_group option").each(function(index,element) {
        if (element.value > 0) {
          enableOptionValue($(element));
        }
      });
    }
    else {
      $('.product-option-value-list input[type="radio"]').each(function(index,element) {
        if (element.value > 0) {
          enableOptionValue($(element));
        }
      });
    }
    setInitialProductOptionStatuses(product);
  })
  if ($('.product_option_select').length) {
    disableAddButton();
    if (show_sold_out_product_options === 'false') {
      $('option[disabled-type="sold-out"]').wrap('<span>');
    }
  }
  if ($('.product-options .options-list').length) {
    disableAddButton();
    if (show_sold_out_product_options === 'false') {
      $('li[disabled-type="sold-out"]').addClass('hidden');
    }
  }
}
function createCartesianProductOptions(product) {
  product_option_groups = [];
  for (ogIndex = 0; ogIndex < product.option_groups.length; ogIndex++) {
    product_option_group_group_values = [];
    for (ogvIndex = 0; ogvIndex < product.option_groups[ogIndex].values.length; ogvIndex++) {
      product_option_group_group_values.push(product.option_groups[ogIndex].values[ogvIndex].id);
    }
    product_option_groups.push(product_option_group_group_values);
  }
  var cartesian_options = cartesianProduct(product_option_groups);
  return cartesian_options;
}

function setInitialProductOptionStatuses(product) {
  product_option_group_values = [];
  for (ogIndex = 0; ogIndex < product.option_groups.length; ogIndex++) {
    for (ogvIndex = 0; ogvIndex < product.option_groups[ogIndex].values.length; ogvIndex++) {
      product_option_group_values.push(product.option_groups[ogIndex].values[ogvIndex].id);
    }
  }
  cartesian_options = createCartesianProductOptions(product);
  for (pogv = 0; pogv < product_option_group_values.length; pogv++) {
    var option_group_value_id = product_option_group_values[pogv];
    var product_iterator = 0;
    var num_sold_out = 0;
    var num_options = 0;
    for (co = 0; co < cartesian_options.length; co++) {
      if (cartesian_options[co].includes(option_group_value_id)) {
        product_option = findProductOptionByValueArray(product.options, cartesian_options[co]);
        if (product_option) {
          num_options++;
          if (product_option.sold_out) {
            num_sold_out++;
          }
        }
        product_iterator++;
      }
    }
    if (product_option_display == 'dropdown') {
      dropdown_select = $(".product_option_group option[value='" + option_group_value_id + "']");
    }
    else {
      dropdown_select = $(".product-option-item[data-option-id='" + option_group_value_id + "']");
    }
    if (num_options === 0 || product_iterator === num_sold_out || num_options === num_sold_out) {
      if (num_options === 0) {
        disable_type = "unavailable";
      }
      if (product_iterator === num_sold_out || num_options === num_sold_out) {
        disable_type = "sold-out";
      }
      disableOptionValue(dropdown_select,disable_type);
    }
  }
}

function processAvailableDropdownOptions(product, changed_dropdown, changed_value) {
  selected_values = getSelectedValues();
  num_selected = selected_values.count(item => item > 0);
  allSelected = selected_values.every(isGreaterThanZero);
  num_option_groups = product.option_groups.length;
  selected_value = [];
  selected_value.push(changed_value);
  this_group_id = changed_dropdown.attr("data-group-id");
  if (product_option_display == 'dropdown') {
    $(".product_option_group").not(changed_dropdown).find('option').each(function(index,element) {
      if (element.value > 0) {
        enableOptionValue($(element));
      }
    });
  }
  else {
    $(".product-option-value-list").not(changed_dropdown).find('input[type="radio"]').each(function(index,element) {
      if (element.value > 0) {
        enableOptionValue($(element));
      }
    });
  }
  cartesian_options = createCartesianProductOptions(product);
  if (num_selected === 1 && num_option_groups > 1) {
    for (ogIndex = 0; ogIndex < product.option_groups.length; ogIndex++) {
      var option_group = product.option_groups[ogIndex];
      if (option_group.id != this_group_id) {
        for (ogvIndex = 0; ogvIndex < option_group.values.length; ogvIndex++) {
          var option_group_value = option_group.values[ogvIndex];
          option_group_value_array = [];
          option_group_value_array.push(changed_value);
          option_group_value_array.push(parseInt(option_group_value.id));
          var product_iterator = 0;
          var num_sold_out = 0;
          var num_options = 0;
          for (co = 0; co < cartesian_options.length; co++) {
            if (arrayContainsArray(cartesian_options[co], option_group_value_array)) {
              product_option = findProductOptionByValueArray(product.options, cartesian_options[co]);
              if (product_option) {
                num_options++;
                if (product_option.sold_out) {
                  num_sold_out++;
                }
              }
              product_iterator++;
            }
          }
          if (product_option_display == 'dropdown') {
            dropdown_select = $(".product_option_group option[value='" + option_group_value.id + "']");
          }
          else {
            dropdown_select = $(".product-option-value-radio[value='" + option_group_value.id + "']");
          }
          if (num_options === 0 || product_iterator === num_sold_out || num_options === num_sold_out) {
            if (num_options === 0) {
              disable_type = "unavailable";
            }
            if (product_iterator === num_sold_out || num_options === num_sold_out) {
              disable_type = "sold-out";
            }
            disableOptionValue(dropdown_select,disable_type);
          }
        }
      }
    }
  }
  if (num_selected === 2 && num_option_groups === 3) {
    if (product_option_display == 'dropdown') {
      $(".product_option_group").each(function(i, object) {
        if (object.value == 0) {
          unselected_group_id = parseInt($(object).attr("data-group-id"));
        }
      });
    }
    else {
      $(".product-option-value-list").each(function() {
        group_id = $(this).attr("data-group-id");
        element = $("input:radio[name=option_group_"+group_id+"]:checked");
        if (element.length == 0) {
          unselected_group_id = parseInt(group_id);
        }
      });



    }
    for (ogIndex = 0; ogIndex < product.option_groups.length; ogIndex++) {
      option_group = product.option_groups[ogIndex];
      if (option_group.id != this_group_id) {
        for (ogvIndex = 0; ogvIndex < option_group.values.length; ogvIndex++) {
          option_group_value = option_group.values[ogvIndex];
          option_group_value_array = [];
          option_group_value_array.push(changed_value);
          option_group_value_array.push(parseInt(option_group_value.id));
          var product_iterator = 0;
          var num_sold_out = 0;
          var num_options = 0;
          for (co = 0; co < cartesian_options.length; co++) {
            if (arrayContainsArray(cartesian_options[co], option_group_value_array)) {
              product_option = findProductOptionByValueArray(product.options, cartesian_options[co]);
              if (product_option) {
                num_options++;
                if (product_option.sold_out) {
                  num_sold_out++;
                }
              }
              product_iterator++;
            }
          }
          if (option_group.id === unselected_group_id) {
            option_group_value_array = [];
            option_group_value_array.push(parseInt(option_group_value.id));
            for (svIndex = 0; svIndex < selected_values.length; svIndex++) {
              if (selected_values[svIndex] > 0) {
                option_group_value_array.push(selected_values[svIndex]);
              }
            }
            product_option = findProductOptionByValueArray(product.options, option_group_value_array);
            if (product_option_display == 'dropdown') {
              dropdown_select = $(".product_option_group option[value='" + option_group_value.id + "']");
            }
            else {
              dropdown_select = $(".product-option-value-radio[value='" + option_group_value.id + "']");
            }
            if (product_option) {
              if (product_option.sold_out) {
                disableOptionValue(dropdown_select,"sold-out");
              }
            }
            else {
              disableOptionValue(dropdown_select,"unavailable");
            }
          }
          if (product_option_display == 'dropdown') {
            dropdown_select = $(".product_option_group option[value='" + option_group_value.id + "']");
          }
          else {
            dropdown_select = $(".product-option-value-radio[value='" + option_group_value.id + "']");
          }
          if (num_options === 0 || product_iterator === num_sold_out || num_options === num_sold_out) {
            if (num_options === 0) {
              disable_type = "unavailable";
            }
            if (product_iterator === num_sold_out || num_options === num_sold_out) {
              disable_type = "sold-out";
            }
            disableOptionValue(dropdown_select,disable_type);
          }
        }
      }
    }
  }
  if (num_selected > 1 && allSelected) {
    if (product_option_display == 'dropdown') {
      group_element = ".product-option-value-list";
      find_element = 'option';
    }
    else {
      group_element = ".product-option-value-list";
      find_element = 'input[type="radio"]';
    }
    $(group_element).not(changed_dropdown).each(function(index, dropdown) {
      dropdown = $(dropdown);
      dropdown.find(find_element).each(function(idx, option) {
        if (product_option_display == 'dropdown') {
          is_selected = $(option).is(":selected");
        }
        else {
          is_selected = $(option).is(":checked");
        }
        if (!is_selected) {
          if (option.value > 0) {
            option_group_value_array = [];
            option_group_value_array.push(parseInt(option.value));
            if (product_option_display == 'dropdown') {
              $(group_element).not(dropdown).each(function(index, secondary_dropdown) {
                option_group_value_array.push(parseInt(secondary_dropdown.value));
              });
            }
            else {
              $(".product-option-value-list").not(dropdown).each(function() {
                group_id = $(this).attr("data-group-id");
                element = $("input:radio[name=option_group_"+group_id+"]:checked");
                if (element.length > 0) {
                  option_group_value_array.push(parseInt(element.val()));
                }
              });
            }
            product_option = findProductOptionByValueArray(product.options, option_group_value_array);
            for (i = 0; i < option_group_value_array.length; i++) {
              if (product_option_display == 'dropdown') {
                dropdown_select = $(".product_option_group option[value='" + option_group_value_array[i] + "']").not(":selected");
              }
              else {
                dropdown_select = $(".product-option-value-radio[value='" + option_group_value_array[i] + "']").not(":checked");
              }
              if (dropdown_select) {
                if (product_option) {
                  if (product_option.sold_out) {
                    disableOptionValue(dropdown_select,"sold-out");
                  }
                  else {
                    enableOptionValue(dropdown_select);
                  }
                }
                else {
                  disableOptionValue(dropdown_select,"unavailable");
                }
              }
            }
          }
        }
      });
    });
  }
  if (allSelected) {
    product_option = findProductOptionByValueArray(product.options, selected_values);
    if (product_option) {
      if (!product_option.sold_out && product_option.id > 0) {
        $('#option').val(product_option.id);
        enableAddButton(product_option.price);
        if (num_option_groups > 1) {
          $('.reset-selection-button').fadeIn('fast');
        }
      }
      else {
        disableAddButton("sold-out");
      }
    }
    else {
      disableAddButton("sold-out");
    }
  }
}

function findProductOptionByValueArray(product_options, value_array) {
  for (var productOptionsIndex = 0; productOptionsIndex < product_options.length; productOptionsIndex ++) {
    option_group_values = product_options[productOptionsIndex].option_group_values;
    option_ids = [];
    option_group_values.forEach(function(option_group_value) {
      option_ids.push(option_group_value.id);
    });
    if (arrayContainsArray(option_ids, value_array)) {
      return product_options[productOptionsIndex];
    }
  };
}

function getSelectedValues() {
  selected_values = [];
  if (product_option_display == 'dropdown') {
    $(".product_option_group").each(function(i, object) {
      selected_values.push(parseInt(object.value));
    });
  }
  else {
    $(".product-option-value-list").each(function() {
      group_id = $(this).attr("data-group-id");
      element = $("input:radio[name=option_group_"+group_id+"]:checked");
      if (element.length == 0) {
        selected_values.push(0);
      }
      else {
        selected_values.push(parseInt(element.val()));
      }
    });
  }
  return selected_values;
};
