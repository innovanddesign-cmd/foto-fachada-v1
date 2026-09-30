const dialog = document.querySelector('dialog[data-contact]');
document.querySelectorAll('[data-contact-open]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); dialog?.showModal(); }));
dialog?.addEventListener('click', event => { if(event.target === dialog) dialog.close(); });
// Close without form submission: examples run inside a forms-disabled sandbox.
document.querySelectorAll('dialog form[method="dialog"] button').forEach(button => {
 button.addEventListener('click', event => {
  event.preventDefault();
  button.closest('dialog')?.close();
 });
});
