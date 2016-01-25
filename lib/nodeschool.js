var CompositeDisposable = require('atom').CompositeDisposable
var SelectListView = require('atom-space-pen-views').SelectListView
var shell = require('shell')
var url = require('url')
var hyperquest = require('hyperquest')
var ndjson = require('ndjson')
var concat = require('concat-stream')
var dialog = require('./dialog')

var atom = window.atom

module.exports = {
  activate: function (state) {
    this.subscriptions = new CompositeDisposable()
    var cmds = atom.commands.add('atom-workspace', {
      'nodeschool:create-issue': this.openIssue,
      'nodeschool:search': this.search
    })
    this.subscriptions.add(cmds)
  },

  deactivate: function () {
    this.subscriptions.dispose()
  },

  search: function () {
    dialog('Enter search terms to find helpful issues', onConfirm)
    function onConfirm (text) {
      if (!text) return
      var selectView = new SelectListView()
      selectView.viewForItem = function (item) {
        var preview = item.body.slice(0, 80) + '...'
        return '<li><strong>' + item.title + '</strong><br><small>' + preview + '</small></li>'
      }
      selectView.confirmed = function (item) {
        shell.openExternal(item.html_url)
        selectView.panel.hide()
      }
      selectView.cancelled = function () {
        selectView.panel.hide()
        atom.workspace.getActivePane().activate()
      }

      var searchUrl = url.format({
        protocol: 'http',
        host: '162.243.127.144',
        pathname: 'search',
        query: {
          q: text,
          limit: 5
        }
      })

      hyperquest(searchUrl)
        .pipe(ndjson.parse())
        .pipe(concat(function (items) {
          if (items.length === 0) {
            atom.notifications.addWarning('No search results for ' + text)
            return selectView.cancel()
          }
          selectView.setItems(items)
          selectView.panel.show()
          selectView.focusFilterEditor()
        }))
      selectView.panel = atom.workspace.addModalPanel({item: selectView})
    }
  },

  openIssue: function () {
    var editor = atom.workspace.getActiveTextEditor()
    var body = 'Hi everyone!\nI need help with <workshopper name>.'
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
    shell.openExternal(issueUrl)
  }
}
