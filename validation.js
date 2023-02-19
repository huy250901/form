
// Đối tượng Validator
function Validator(options) {


    var selectorRule = {};
    
    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errorMessage;
        const elementParent = inputElement.closest(options.formGroupSelector);
        const errorElement = elementParent.querySelector(options.errorSelector);
        // var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        
        // Lấy ra các rules của selector
        var rules = selectorRule[rule.selector];

        // lặp qua từng rules và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (let i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default: errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            elementParent.classList.add('invalid')
        } else {
            errorElement.innerText = '';
            elementParent.classList.remove('invalid')
        }

        return !errorMessage;
    }

    // Lấy element của form
    var formElement = document.querySelector(options.form)
    if (formElement) {

        // Khi submit form
        formElement.onsubmit = function (e) { 
            e.preventDefault();

            var isFormValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector) 
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            // var enableInputs = formElement.querySelectorAll('[name]:not([disable]');
            // var formValues = Array.from(enableInputs).reduce(function (values, input) {
            //     return values[input.name] = input.value
            // }, {})

            // Trường hợp submit với javascript
            if (isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }
                                
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value)
                                break;
                            
                            case 'file':
                                values[input.name]=input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        
                        
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
            }
        }

        // Lặp qua mỗi rule và xử lý(lắng nghe sự kiện)
        options.rules.forEach(function (rule) {

            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRule[rule.selector])) {
                selectorRule[rule.selector].push(rule.test);
            } else {
                selectorRule[rule.selector] = [rule.test];
            }

            // selectorRule[rule.selector] = rule.test;

            var inputElements = formElement.querySelectorAll(rule.selector)
            
            Array.from(inputElements).forEach(function (inputElement) {
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }

                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function() {
                    const elementParent = inputElement.closest(options.formGroupSelector);
                    var errorElement = elementParent.querySelector('.form-message');
                    errorElement.innerText = '';
                    elementParent.classList.remove('invalid')
                }
            })

        });
        // console.log(selectorRule)
    }
}

// Định nghĩa các rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => Không trả ra gì cả (undefine)
Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        }
    };
}

Validator.isEmail = function (selector) {
    return {
            selector: selector,
            test: function(value) {
                var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                return regex.test(value) ? undefined : 'Trường này phải là email'
        }
    };
}

Validator.minLength = function (selector, min) {
    return {
            selector: selector,
            test: function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiếu ${min} kí tự `
        }
    };
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
            selector: selector,
            test: function(value) {
                return value === getConfirmValue() ? undefined : message || `Giá trị nhập vào không chính xác`
        }
    };
}
