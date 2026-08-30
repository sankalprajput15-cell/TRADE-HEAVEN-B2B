const fs = require('fs');
const content = fs.readFileSync('src/data/mockData.ts', 'utf-8');

const replacementIds = [
  '1518709268805-4e9042af9f23', '1542314831-068cd1dbfeeb', '1505705694340-019e1e335916',
  '1578575437130-527eed3abbec', '1513836279014-a89f7a76ae86', '1586528116311-ad8dd3c8310d',
  '1519074069444-1ba4fff16def', '1584269600464-37b1b58a9fe7', '1542744173-8e7e53415bb0',
  '1585338107529-13afc5f02586', '1577962917302-cd874c4e31d2', '1518152006812-edab29b069ac',
  '1541888946425-d0fbb186a5b7', '1526304640581-d334cdbbf45e', '1581092580497-e0d23cbdf1dc',
  '1581092160562-40aa08e78837', '1581092335397-9583fe92d232', '1517336714731-489689fd1ca8',
  '1550751827-4bd374c3f58b', '1504917599217-d4dc5ebe6122', '1581091226033-d5c48150dbaa',
  '1532187863486-abf9dbad1b69', '1594938298603-c8148c4dae35', '1586201375761-83865001e31c',
  '1580273916550-e323be2ae537', '1517524008697-84bbe3c3fd98', '1509391365360-2e959784a276',
  '1473341304170-971dccb5ac1e', '1595246140625-573b715d11dc', '1601599561096-f87bc199bc34'
];

let currentIndex = 0;
const targetId = '1581091226825-a6a2a5aee158';

const newContent = content.replace(new RegExp(targetId, 'g'), () => {
  const replacement = replacementIds[currentIndex % replacementIds.length];
  currentIndex++;
  return replacement;
});

fs.writeFileSync('src/data/mockData.ts', newContent);
console.log('Replaced', currentIndex, 'occurrences of the repeated image.');
