import * as chai from 'chai'
import { Subject } from 'rxjs/Subject'
import { describe, it, beforeEach, afterEach } from 'tman'

import { Fetch, Backend, HttpErrorMessage } from '../index'

const expect = chai.expect

export default describe('HttpError$ test: ', () => {
  let httpBackend: Backend
  let mockFetch: Fetch
  let url: string
  let error$: Subject<HttpErrorMessage>

  const path = 'users/me'

  beforeEach(() => {
    error$ = new Subject<HttpErrorMessage>()
    httpBackend = new Backend()
    mockFetch = new Fetch(error$)
    url = `${mockFetch.getAPIHost()}/${path}`
  })

  afterEach(() => {
    httpBackend.restore()
  })

  it('handler error should ok', done => {
    httpBackend.whenGET(url)
      .error('Bad Request', {
        status: 400
      })

    error$.map(r => {
      return r.error.statusText
    })
      .take(1)
      .subscribe(r => {
        expect(r).to.equal('Bad Request')
        done()
      })

    mockFetch.get(path).subscribe()
  })

  it('handler sequence error should ok', done => {

    httpBackend.whenGET(url)
      .error('Bad Request', {
        status: 400
      })

    httpBackend.whenGET(url)
      .error('Bad Request', {
        status: 400
      })

    error$.skip(1)
      .take(1)
      .map(r => r.error.statusText)
      .subscribe(r => {
        expect(r).to.equal('Bad Request')
        done()
      })

    mockFetch.get(path).subscribe()
    mockFetch.get(path).subscribe()
  })
})
