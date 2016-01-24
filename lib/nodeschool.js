var CompositeDisposable = require('atom').CompositeDisposable
var shell = require('shell')
var url = require('url')

var atom = window.atom

module.exports = {
  activate: function (state) {
    this.subscriptions = new CompositeDisposable()
    var cmd = atom.commands.add('atom-workspace', 'nodeschool:open-issue', this.openIssue)
    this.subscriptions.add(cmd)
  },

  deactivate: function () {
    this.subscriptions.dispose()
  },

  openIssue: function () {
    console.log('Nodeschool was toggled!')
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
