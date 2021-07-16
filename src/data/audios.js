/**
 * @ContributorsList
 * @Inateno / http://inateno.com / http://dreamirl.com
 *
 * this is the audios list sample that will be loaded by the project
 * Please declare in the same way than this example.
 * To automatically preload a file just set "preload" to true.
 */
const audios = [
  // MUSICS
  [ "test_music", "audio/test_music", [ 'mp3' ], { "preload": true, "loop": true, "isMusic": true } ]
  [
    "test_sprite_music", "audio/test_music", [ 'mp3' ], {
    "preload": true, "loop": true, "isMusic": true,
    "sprite": {
      first: [ 0, 5000 ]
      ,second: [ 10000, 20000 ]
    } }
  ],
  
  // FX
  [ "piew", "audio/piew", [ 'mp3' ], { "preload": true, "loop": false, "pool": 10 } ]
];

export default audios;
