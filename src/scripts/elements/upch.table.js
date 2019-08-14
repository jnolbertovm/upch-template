/**
 * ------------------------------------------------------------------------
 * Table Plugin
 * 
 * @package Elements
 * @author  Jose Nolberto Vilchez Moreno
 * @version 1.0
 * ------------------------------------------------------------------------
 */

const UPCH_TABLE_NAME = 'upch-table'
const UPCH_TABLE_VERSION = '1.0'
const UPCH_TABLE_DATA_KEY = 'upch.table'
const UPCH_TABLE_EVENT_KEY = `.${UPCH_TABLE_DATA_KEY}`

const UPCH_TABLE_Selector = {
  MODAL_HEADER: '.upch-table__header',
  MODAL_BODY: '.upch-table__body',
  MODAL_FOOTER: '.upch-table__footer',
}

class UpchTable {

  constructor(element) {
    this._element = document.getElementById(element)
    this._options = {}
  }

  getData() {
    return $(this._element).bootstrapTable("getData");
  }

  setOptions(options = {}) {
    this._options = {
      ...UPCH.params.bootstrapTable,
      ...options
  }
  }

  columns(columns = []) {
    if (!Array.isArray(columns) || columns.length === 0) {
      throw TypeError(`El parametro debe ser un array y no estar vacio`)
    }
    this._options.columns = columns
  }

  _resetView() {
    if (this.getData().length >= this._options.pageSize) {
      $(this._element).bootstrapTable("resetView", {height: 700});
    }
  }

  _setLocationMessage() {
    let messages = {
      ...$(this._element).bootstrapTable.locales['es-ES'],
      formatRecordsPerPage(pageNumber) {
        return `${pageNumber} filas por página`
      },
      formatShowingRows(pageFrom, pageTo, totalRows, totalNotFiltered) {
        if (totalNotFiltered !== undefined && totalNotFiltered > 0 && totalNotFiltered > totalRows) {
          return `Mostrandolo desde ${pageFrom} hasta ${pageTo} - En total ${totalRows} resultados (filtered from ${totalNotFiltered} total rows)`
        }

        return `${pageFrom} - ${pageTo} de ${totalRows}`
      }
    }
    $.fn.bootstrapTable.locales['es-ES'] = messages
    $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['es-ES'])
  }

  init() {
    this._setLocationMessage()
    $(this._element).bootstrapTable(this._options)
    this._resetView()
  }
}