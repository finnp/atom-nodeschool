
module.exports = dialog

var atom = window.atom

function dialog (question, cb) {
  var div = document.createElement('div')
  var label = document.createElement('label')
  var textEditor = document.createElement('atom-text-editor')
  var textModel = textEditor.getModel()
  textModel.mini = true

  div.classList.add('dialog')
  div.setAttribute('is', 'space-pen-div')
  div.appendChild(label)
  div.appendChild(textEditor)

  label.classList.add('icon')
  label.innerText = question

  textEditor.setAttribute('mini', '')
  textEditor.setAttribute('tabindex', '-1')

  var panel = atom.workspace.addModalPanel({item: div})
  textEditor.addEventListener('blur', close)
  textEditor.focus()

  atom.commands.add(div, {
    'core:confirm': function () {
      cb(textModel.getText())
      close()
    },
    'core:cancel': cancel
  })

  function close () {
    panel.destroy()
    atom.workspace.getActivePane().activate()
  }
  function cancel () {
    close()
    var editor = atom.workspace.getActiveTextEditor()
    if (editor) atom.views.getView(editor).focus()
  }
}
