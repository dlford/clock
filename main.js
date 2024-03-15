/*
LED Segment Layout:

  |---5---|
  |4|   |6|
  |---3---|
  |2|   |7|
  |---1---|

6 digit segments total (LEDS 1-42).

to find the first LED in a digit segment: ((POSITION - 1) * 7) + 1
e.g.:
  - digit 2 in hours is position 2, ((2-1) * 7) + 1 = 8
  - digit 2 in minutes is position 4, ((4-1) * 7) + 1 = 22

Colons are at the end, numbered bottom to top (LEDs 43-46).
*/

// How to write each number in a 7-segment arrangement
const digitMap = [
  [1, 1, 0, 1, 1, 1, 1], // 0
  [0, 0, 0, 0, 0, 1, 1], // 1
  [1, 1, 1, 0, 1, 1, 0], // 2
  [1, 0, 1, 0, 1, 1, 1], // 3
  [0, 0, 1, 1, 0, 1, 1], // 4
  [1, 0, 1, 1, 1, 0, 1], // 5
  [1, 1, 1, 1, 1, 0, 1], // 6
  [0, 0, 0, 0, 1, 1, 1], // 7
  [1, 1, 1, 1, 1, 1, 1], // 8
  [1, 0, 1, 1, 1, 1, 1], // 9
];

async function main() {
  const root = document.getElementById('clock-svg');

  // Since we need to loop as many frames as possible,
  // we don't need to check the time every frame
  // We'll use this to throttle the time check
  let lastTimeCheck = 0;
  let timeStr = '';

  // Main loop
  while (true) {
    // Update the time if one second has passed since the last update
    if (Date.now() - lastTimeCheck > 1000) {
      lastTimeCheck = Date.now();
      // Get hours, minutes, and seconds in two digit 12 hour format
      const now = new Date();
      const hours = (
        '0' +
        (now.getHours() > 12 ? now.getHours() - 12 : now.getHours())
      ).slice(-2);
      const minutes = ('0' + now.getMinutes()).slice(-2);
      const seconds = ('0' + now.getSeconds()).slice(-2);

      // HHMMSS
      timeStr = `${hours}${minutes}${seconds}`;
    }

    // Set each LED to the correct digit
    timeStr.split('').forEach((digit, segment) => {
      // Get the first LED in this segment
      // ((POSITION - 1) * 7) + 1
      // but `segment` is 0-indexed, so skip the `- 1`
      let i = segment * 7 + 1;
      // Loop over each LED in the segment, turning on or off
      digitMap[digit].forEach((ledValue) => {
        root.querySelector(`[data-led="${i}"]`).style.fill = ledValue
          ? '#ddd'
          : '#001010';
        i++;
      });
    });

    // Set colons
    root.querySelector(`[data-led="43"]`).style.fill = '#ddd';
    root.querySelector(`[data-led="44"]`).style.fill = '#ddd';
    root.querySelector(`[data-led="45"]`).style.fill = '#ddd';
    root.querySelector(`[data-led="46"]`).style.fill = '#ddd';

    // Don't be greedy, give back 1 millisecond of CPU time
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}

// Start after document is ready
(() => {
  if (document.readyState === 'complete') {
    main();
  } else {
    document.addEventListener('readystatechange', function () {
      if (document.readyState === 'complete') {
        main();
      }
    });
  }
})();
