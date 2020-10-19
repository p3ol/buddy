import { send } from '@poool/buddy';

const frame = document.querySelector('#child');

const createElement = (id, content) => {
  const elmt = document.createElement('div');
  elmt.id = id;
  elmt.innerText = content;
  document.body.appendChild(elmt);
};

frame.onload = async () => {
  createElement('messaging', await send(
    frame.contentWindow,
    'test:messaging',
    '',
    { origin: '*' },
  ));

  let wrongWindow;
  try {
    wrongWindow = await send(
      frame.contentWindow, 'test:wrongWindow', '', { origin: '*' }
    );
  } catch (e) {
    wrongWindow = e.message;
  }
  createElement('wrong-window', wrongWindow);
};
