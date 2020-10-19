import { send } from '@poool/buddy';

const frame = document.getElementById('child');

frame.onload = async () => {
  const result = await send(frame.contentWindow, 'simpleMessage', {
    text: 'I am thy father!',
    testMethod: (...args) => {
      document.getElementById('method-called').innerText = JSON.stringify(args);
      return 'This is the result of a method passed from the parent to the ' +
        'child (e.g serialized)';
    },
  });

  document.getElementById('response').innerText = JSON.stringify(result);
};
