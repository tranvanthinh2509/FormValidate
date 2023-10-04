
// đối tượng
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    function validate (inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        // var errorMessage = rule.test(inputElement.value);
        var errorMessage;
        // Lấy ra các rule của selector
        var rules = selectorRules[rule.selector];
        // Lặp qua từng rule và kiểm tra
        for (var i = 0; i<rules.length; i++) {
            switch(inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);

            }
            if(errorMessage) break;
        }

        if (errorElement) {
                errorElement.innerText = errorMessage;
                getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
                errorElement.innerText = ' ';
                getParent(inputElement, options.formGroupSelector).classList.remove('invalid')

        }
        return !errorMessage;
    }

    var formElement = document.querySelector(options.form);
    if(formElement) {

        // Khi submit form 
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            options.rules.forEach(function (rule) {
                // Lặp qua từng rules và validate
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            
            if (isFormValid) {
                // Trường hợp submit với js
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');

                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch(input.type) {
                            case 'checkbox':
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
                // Trường hợp submit vơi hành vi mặc định
                else {
                    formElement.submit();
                }
            }
        }

        // Lặp qua mỗi rule và xử lý (lagnws nghe sự kiện blur, input , ...)
        options.rules.forEach(function (rule) {
            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            

            var inputElement = formElement.querySelector(rule.selector);
            
            if (inputElement) {
                // Xử lí trường hợp blur ra khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }
                // Xử lí mỗi khi người dùng nhập
                inputElement.oninput = function() {
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                    // errorElement.innerText = ' ';
                    inputElement.parentElement.classList.remove('invalid')
                }
            }
        })
    }
    console.log(selectorRules);
}
// Định nghĩa rules
// Nguyên tắc của các rules
// 1. Khi có lỗi  => trả ra mes lỗi
// 2. Khi hợp lệ => không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? '' : message || 'Vui lòng nhập trường này'
        }
    }

}
Validator.isEmail = function (selector, message) {
return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? '' : message || 'Vui lòng nhập email';
        }
    }
}
Validator.minLength = function (selector, min, message) {
    return {
            selector: selector,
            test: function (value) {
                return value.length >= min ? '' : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
            }
        }
}


Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? '' : message || 'Giá trị nhập vào không hợp lệ';
        }
    }
}