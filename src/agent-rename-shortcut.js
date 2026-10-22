// Sequência solicitada para reabrir a identificação no painel inicial.
const SEQUENCE = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowRight', 'ArrowLeft'];

export function createAgentRenameShortcut({isEnabled, onMatch}) {
  let matched = 0;
  function reset() { matched = 0; }
  function handleKeydown(event) {
    const editing = event.target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
    if (!isEnabled() || editing || event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
      reset();
      return;
    }
    if (event.repeat) return;
    matched = event.key === SEQUENCE[matched] ? matched + 1 : event.key === SEQUENCE[0] ? 1 : 0;
    if (matched === SEQUENCE.length) {
      reset();
      event.preventDefault();
      onMatch();
    }
  }
  return {handleKeydown, reset};
}
