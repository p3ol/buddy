import { send } from '@poool/buddy';

const createElement = (id: string, content: string) => {
  const elmt = document.createElement('div');
  elmt.id = id;
  elmt.innerText = content;
  document.body.appendChild(elmt);
};

const newWindow = window.open('./alternate-child.html');

const exec = async () => {
  const messaging = await send(newWindow,
    'test:messaging', 'This is a message from the source');
  createElement('messaging', messaging);
};

newWindow.onload = exec;
