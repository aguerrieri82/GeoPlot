interface KnockoutBindingHandlers {
    attach: KnockoutBindingHandler;
}

type AttachFunction = (element: HTMLElement) => void;

if (window["ko"]) {

    ko.bindingHandlers.attach = {
        init: (element, valueAccessor, allBindings, viewModel) => {

            let func = <AttachFunction|boolean>ko.unwrap(valueAccessor());

            if (func === true || func == undefined)
                func = <AttachFunction>viewModel["attachNode"];

            if (typeof func != "function")
                throw "Supplied argument is not a function";

            setTimeout(() =>
                (<AttachFunction>func).call(viewModel, element));
        }
    }
}