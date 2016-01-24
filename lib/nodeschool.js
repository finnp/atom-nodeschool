var CompositeDisposable = require('atom').CompositeDisposable
var shell = require('shell')
var url = require('url')
var hyperquest = require('hyperquest')
var ndjson = require('ndjson')
var qs = require('querystring')
var SelectListView = require('atom-space-pen-views').SelectListView
var Dialog = require('./dialog')

var atom = window.atom

module.exports = {
  activate: function (state) {
    this.subscriptions = new CompositeDisposable()
    var cmds = atom.commands.add('atom-workspace', {
      'nodeschool:open-issue': this.openIssue,
      'nodeschool:search': this.search
    })
    this.subscriptions.add(cmds)
  },

  deactivate: function () {
    this.subscriptions.dispose()
  },

  search: function () {
    console.log('NodeSchool search')

    var prompt = new Dialog({
      prompt: 'Search for keywords?',
      input: ''
    })
    prompt.onConfirm = function (text) {
      var items = []
      var searchView = new SelectListView()
      searchView.viewForItem = function (item) {
        return '<li>' + item.title + '</li>'
      }
      searchView.confirmed = function (item) {
        shell.openExternal(item.html_url)
        searchView.panel.hide()
      }
      searchView.cancelled = function () {
        searchView.panel.hide()
        atom.workspace.getActivePane().activate()
      }

      hyperquest('http://162.243.127.144/search?q=' + qs.escape(text) + '&limit=5')
        .pipe(ndjson.parse())
        .on('data', function (obj) {
          items.push(obj)
        })
        .on('end', function () {
          searchView.setItems(items)
          searchView.panel.show()
          searchView.focusFilterEditor()
        })

      searchView.panel = atom.workspace.addModalPanel({item: searchView})
    }
    prompt.attach()
  },

  openIssue: function () {
    var editor = atom.workspace.getActiveTextEditor()
    var body = 'Hi everone!\nI need help with <workshopper name>.'
    if (editor) {
      body += '\n\nHere is my code (`' + editor.getTitle() + '`):\n```js\n' + editor.getText() + '\n```'
    }
    var issueUrl = url.format({
      protocol: 'https',
      host: 'github.com',
      pathname: 'nodeschool/discussions/issues/new',
      query: {
        title: 'Help with <lesson name>',
        body: body
      }
    })
    console.log(issueUrl)
    shell.openExternal(issueUrl)
  }
}
