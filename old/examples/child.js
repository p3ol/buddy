import { on } from '@poool/buddy';

on('simpleMessage', async e => {
  document.getElementById('data').innerText = JSON.stringify(e.data.text);
  const result = await e.data.testMethod('This is a param from the child');

  document.getElementById('method-result').innerText = JSON.stringify(result);

  return 'And I am thou child';
}, { source: window.parent });
