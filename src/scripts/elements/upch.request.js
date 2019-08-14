/**
 * ------------------------------------------------------------------------
 * Request Plugin
 * 
 * @package Elements
 * @author  Jose Nolberto Vilchez Moreno
 * @version 1.0
 * ------------------------------------------------------------------------
 */

const UPCH_REQUEST_NAME = 'upch-request'
const UPCH_REQUEST_VERSION = '1.0'
const UPCH_REQUEST_DATA_KEY = 'upch.request'
const UPCH_REQUEST_EVENT_KEY = `.${UPCH_REQUEST_DATA_KEY}`

class UpchRequest {

  constructor(options = {}) {
    this._options = this._setOptions(options)
    this._request = this._create()
  }

  get Options() {
    return this._options
  }

  post(url, data) {
    return this._request.post(url, data)
      .then((response) => {
        return response.data
      })

  }

  get(url, params = {}){
    return this._request.get(url, {params, ...this._options})
      .then((response) => {
        return response.data
      })
  }

  _setOptions(options = {}) {
    let config = {
      baseURL: UPCH.baseUrl,
      ...UPCH.params.axios,
      ...options
    }
    return config
  }

  _create() {
    return axios.create(this._options)
  }
}