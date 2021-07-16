import DE from '@dreamirl/dreamengine';

import Game from 'Game';
import inputs from 'inputs';
import audios from 'audios';
import dictionary from 'dictionary';
import images from 'images';
import achievements from 'achievements';

console.log('game main file loaded DREAM_ENGINE is:', DE);

DE.config.DEBUG = true;
DE.config.DEBUG_LEVEL = 5;
DE.init({
  onReady: Game.init,
  onLoad: Game.onload,
  inputs: inputs,
  audios: audios,
  dictionary: dictionary,
  images: images,
  achievements: achievements,
  about: {
    gameName: 'Engine Dev Game 1',
    namespace: 'noting',
    author: 'Inateno',
    gameVersion: '0.1',
  },
  saveModel: { nShoots: 0 },
  saveIgnoreVersion: true,
});
