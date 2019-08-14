/**
 * ------------------------------------------------------------------------
 * Modal Plugin
 * 
 * @package Elements
 * @author  Jose Nolberto Vilchez Moreno
 * @version 1.0
 * ------------------------------------------------------------------------
 */

const UPCH_MODAL_NAME = 'upch-modal'
const UPCH_MODAL_VERSION = '1.0'
const UPCH_MODAL_DATA_KEY = 'upch.modal'
const UPCH_MODAL_EVENT_KEY = `.${UPCH_MODAL_DATA_KEY}`

const UPCH_MODAL_Default = {
    data: {},
    onClose: null,
    onOpen: null,
    beforeOpen: null,
    beforeClose: null
}

const UPCH_MODAL_Event = {
    HIDE: `hide`,
    HIDDEN: `hidden`,
    SHOW: `show`,
    SHOWN: `shown`,
    CLICK_DATA_API: `click${UPCH_MODAL_EVENT_KEY}${UPCH_MODAL_DATA_KEY}`
}

const UPCH_MODAL_Selector = {
    MODAL_HEADER: '.upch-modal__header',
    MODAL_TITLE: '.upch-modal__title',
    MODAL_BODY: '.upch-modal__body',
    MODAL_FOOTER: '.upch-modal__footer',
    DATA_FIELD: 'data-field'
}

class UpchModal {

    constructor(element, options = {}) {
        this._element = document.getElementById(element)
        this._options = this._setOptions(options)

        this._init();
    }

    static get VERSION() {
        return UPCH_MODAL_VERSION
    }

    static get Default() {
        return UPCH_MODAL_Default
    }

    get Options() {
        return this._options
    }

    get Data() {
        return this._options.data
    }

    setData(data = new Object) {
        if (UPCH.utils.isObjectEmpty(data)) {
            throw new Error(`El paramatro no puede estar vacio`)
        }
        this._options.data = data
        this._loadData()
    }

    setTitle(title) {
        let elm = this._element.querySelector(UPCH_MODAL_Selector.MODAL_TITLE)
        if(UPCH.utils.isElement(elm)){
            UPCH.utils.setValueElement(title);
        }
    }

    open() {
        $(this._element).modal(UPCH_MODAL_Event.SHOW)
    }

    close() {
        $(this._element).modal(UPCH_MODAL_Event.HIDE)
    }

    _setEvents() {
        if (this._options.onOpen instanceof Function) {
            $(this._element).on(`${UPCH_MODAL_Event.SHOWN}.bs.modal`, () => {
                this._options.onOpen();
            })
        }
        if (this._options.beforeOpen instanceof Function) {
            $(this._element).on(`${UPCH_MODAL_Event.SHOW}.bs.modal`, () => {
                this._options.beforeOpen();
            })
        }
        if (this._options.onClose instanceof Function) {
            $(this._element).on(`${UPCH_MODAL_Event.HIDDEN}.bs.modal`, () => {
                this._options.onClose();
            })
        }
        if (this._options.beforeClose instanceof Function) {
            $(this._element).on(`${UPCH_MODAL_Event.HIDE}.bs.modal`, () => {
                this._options.beforeClose();
            })
        }
    }

    _setOptions(options = {}) {
        let config = {
            ...UPCH_MODAL_Default,
            ...options
        }
        return config
    }

    _loadData() {
        if (!UPCH.utils.isObjectEmpty(this._options.data)) {
            for (let field in this._options.data) {
                let valueType = '(string|boolean|object|number)'
                if (!new RegExp(valueType).test(typeof this._options.data[field])) {
                    throw TypeError(`El valor de '${field}' no esta permitido`)
                }
                this._setValueField(field, this._options.data[field])
            }
        }
    }

    _setValueField(field, value) {
        let selector = `[${UPCH_MODAL_Selector.DATA_FIELD}="${field}"]`
        let countNodes = this._element.querySelectorAll(selector).length
        if (countNodes === 0) {
            return
        } else if (countNodes === 1) {
            let elm = this._element.querySelector(selector)
            if (UPCH.utils.isFormElement(elm)) {
                UPCH.utils.setValueFormElement(elm, value)
            } else {
                UPCH.utils.setValueElement(elm, value)
            }
        } else {
            let elements = this._element.querySelectorAll(selector)
            elements.forEach((elm) => {
                if (UPCH.utils.isFormElement(elm)) {
                    UPCH.utils.setValueFormElement(elm, value)
                } else {
                    UPCH.utils.setValueElement(elm, value)
                }
            })
        }
    }

    _init() {
        $(this._element).modal(UPCH.params.modal)
        this._setEvents()
        this._loadData()
    }
}