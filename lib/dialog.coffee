# Borrowed from project-manager

{$, TextEditorView, View} = require 'atom-space-pen-views'

module.exports =
class Dialog extends View
  @content: ({prompt} = {}) ->
    @div class: 'npm-helper-dialog', =>
      @label prompt, class: 'icon', outlet: 'promptText'
      @subview 'miniEditor', new TextEditorView(mini: true)
      @div class: 'error-message text-error', outlet: 'errorMessage'

  initialize: ({input, select, iconClass} = {}) ->
    @promptText.addClass(iconClass) if iconClass
    atom.commands.add @element,
      'core:confirm': => @onConfirm(@miniEditor.getText())
      'core:cancel': => @cancel()
    @miniEditor.on 'blur', => @close()
    @miniEditor.getModel().onDidChange => @showError()
    @miniEditor.getModel().setText(input)

    if select
      range = [[0, 0], [0, input.length]]
      @miniEditor.getModel().setSelectedBufferRange(range)

  attach: ->
    @panel = atom.workspace.addModalPanel(item: this.element)
    @miniEditor.focus()
    @miniEditor.getModel().scrollToCursorPosition()

  close: ->
    panelToDestroy = @panel
    @panel = null
    panelToDestroy?.destroy()
    atom.workspace.getActivePane().activate()

  cancel: ->
    @close()
    editor = atom.workspace.getActiveTextEditor()
    atom.views.getView(editor).focus() if editor

  showError: (message = '') ->
    @errorMessage.text(message)
    @flashError() if message
