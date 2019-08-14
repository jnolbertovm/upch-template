const UPCH = {
    protocol: window.location.protocol,
    get hostname() {
        return `${this.protocol}//${window.location.host}`
    },
    get baseUrl() {
        let url = `${this.hostname}${window.location.pathname}`
        return url.substring(0, url.lastIndexOf("/"))
    },
    params: {
        modal: {
            backdrop: 'static',
            keyboard: false,
            focus: true,
            show: false
        },
        bootstrapTable: {
            escape: false,
            locale: 'es-SP',
            search: true,
            searchAlign: 'right',
            showRefresh: true,
            buttonsAlign: 'right',
            sortOrder: "desc",
            sortable: true,
            pagination: true,
            pageSize: 20,
            classes: 'upch-table upch-table--sm table table-sm',
            theadClasses: 'upch-table__header',
            footerStyle: 'upch-table__footer',
            buttonsClass: 'light',
            iconsPrefix: 'fa',
            iconSize: 'sm',
            icons: {
                paginationSwitchDown: 'fa-caret-square-down',
                paginationSwitchUp: 'fa-caret-square-up',
                refresh: 'fa-sync',
                toggleOff: 'fa-toggle-off',
                toggleOn: 'fa-toggle-on',
                columns: 'fa-th-list',
                fullscreen: 'fa-arrows-alt',
                detailOpen: 'fa-plus',
                detailClose: 'fa-minus'
            }
        },
        axios: {
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            transformRequest(data, headers) {
                if (typeof data === 'object') {
                    return UPCH.utils.objectToFormData(data)
                }
                return data;
            }
        }
    },
    utils: {
        isObjectEmpty(data = new Object) {
            return (Object.entries(data).length === 0 && data.constructor === Object)
        },
        isElement(element) {
            return ((element[0] || element).nodeType === 1)
        },
        isInput(element) {
            return (this.isElement(element) && element.nodeName === 'INPUT')
        },
        isFormElement(element) {
            let elementType = '(INPUT|SELECT|TEXTAREA)'
            return (this.isElement(element) && new RegExp(elementType).test(element.nodeName))
        },
        setValueElement(element, value) {
            if (this.isFormElement(element)) {
                throw TypeError(`parametro element corresponde a un elemento de formulario`)
            }
            element.innerHTML = value

        },
        setValueFormElement(element, value) {
            if (this.isInput(element)) {
                this.setValueInput(element, value)
            } else {
                element.value = value
            }
        },
        setValueInput(element, value) {
            switch (element.type) {
                case 'checkbox':
                    if (Array.isArray(value)) {
                        element.checked = value.includes(parseInt(element.value))
                    } else if (typeof value === 'boolean') {
                        element.value = +value
                        element.checked = value
                    }
                    break
                case 'radio':
                    element.checked = element.value === value
                    break
                default:
                    element.value = value
            }

        },
        objectToFormData(object = {}) {
            if (this.isObjectEmpty(object)) {
                throw TypeError(`El objecto no puede estar vacio`)
            }

            let data = new FormData();
            let setValue = (key, value, form, parent = false) => {
                if (typeof value === "object") {
                    for (let i in value) {
                        setValue(i, value[i], form, (parent) ? `${parent}[${key}]` : key)
                    }
                } else {
                    form.append((parent) ? `${parent}[${key}]` : key, value)
                }
                return form;
            }
            for (let key in object) {
                setValue(key, object[key], data)
            }

            return data;
        }
    }
}
