/*
-------------------
Part 1: Basic Clock
-------------------

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
// 1 = on (truthy), 0 = off (falsy)
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

/*
----------------------
Part 2: Display Matrix
----------------------

Map each LED to an x,y coordinate in a matrix. This allows us to
plot the approximate position of each LED or "pixel" in relation
to the other pixels.

Not every coordinate has a pixel, so we won't need to worry about
animating these empty pixels.

   00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 X
00    05          12                19          26                33          40
01 04    06    11    13    44    18    20    25    27    46    32    34    39    41
02    03          10                17          24                31          38
03 02    07    09    14    43    16    21    23    28    45    30    35    37    42
04    01          08                15          22                29          36
Y

e.g.:
  - LED 11 is at x=4, y=1
  - LED 37 is at x=24, y=3

We'll use a nexted array to map each pixel (x,y coordinate) to an
LED (1-46), We will use this in each animation frame.
*/

// Nested array of x,y coordinates that correspond to each LED
// Unused pixels are set to 0 because it is falsy
// e.g. matrixMap[1][0] = 5, because LED 5 is at x=1, y=0
const matrixMap = [
  /*
Y  0  1  2  3  4       | X
  */
  [0, 4, 0, 2, 0], //    0
  [5, 0, 3, 0, 1], //    1
  [0, 6, 0, 7, 0], //    2
  [0, 0, 0, 0, 0], //    3
  [0, 11, 0, 9, 0], //   4
  [12, 0, 10, 0, 8], //  5
  [0, 13, 0, 14, 0], //  6
  [0, 0, 0, 0, 0], //    7
  [0, 44, 0, 43, 0], //  8
  [0, 0, 0, 0, 0], //    9
  [0, 18, 0, 16, 0], //  10
  [19, 0, 17, 0, 15], // 11
  [0, 20, 0, 21, 0], //  12
  [0, 0, 0, 0, 0], //    13
  [0, 25, 0, 23, 0], //  14
  [26, 0, 24, 0, 22], // 15
  [0, 27, 0, 28, 0], //  16
  [0, 0, 0, 0, 0], //    17
  [0, 46, 0, 45, 0], //  18
  [0, 0, 0, 0, 0], //    19
  [0, 32, 0, 30, 0], //  20
  [33, 0, 31, 0, 29], // 21
  [0, 34, 0, 35, 0], //  22
  [0, 0, 0, 0, 0], //    23
  [0, 39, 0, 37, 0], //  24
  [40, 0, 38, 0, 36], // 25
  [0, 41, 0, 42, 0], //  26
];

// Sine wave info - https://krazydad.com/tutorials/makecolors.php

// Wave height
const center = 128;
const width = 127;

// Sign waves
// Each wave is 120 degrees out of phase
const waves = [
  0, //                 Red
  2 * (Math.PI / 3), // Green
  4 * (Math.PI / 3), // Blue
];

// Color shift amounts
// How much to shift the color for each column/row
const shiftHorizontal = 0.25;
const shiftVertical = 0.3;

/*
-----------------
Part 3: Animation
-----------------

All we need to do is account for time in the animation loop!
*/

// How much to shift the color based on the time
const shiftTime = 3;

// Get the color of a pixel
function getPixelColor(col, row, millis) {
  const verticalFrequency = shiftVertical * row;
  const horizontalFrequency = shiftHorizontal * col;
  const timeFrequency = shiftTime * (millis / 1000);

  let bytes = [];

  // Red, green, blue
  for (let i = 0; i < 3; i++) {
    // Get the base offset of the wave for this color
    const wave = waves[i];

    // Plot the point in the wave
    const point = Math.sin(
      wave + verticalFrequency + horizontalFrequency + timeFrequency,
    );

    // Artificially adjusting the wave height
    // essentially converting the point to a value between 0 and 255
    // 1 byte is 8 bits, so 256 possible values (so 0-255)
    const value = point * width + center;

    // Add the value to the byte array
    bytes[i] = value;
  }

  // Convert the byte array to a color code
  return `rgb(${bytes.join(',')})`;
}

async function main() {
  const root = document.getElementById('clock-svg');

  // Since we need to loop as many frames as possible,
  // we don't need to check the time every frame
  // We'll use this to throttle the time check
  let lastTimeCheck = 0;
  let timeStr = '';

  // Track the on/off state of each LED
  // 1 = on, 0 = off
  const onOffArray = [];
  // Colons are always on
  onOffArray[43] = 1;
  onOffArray[44] = 1;
  onOffArray[45] = 1;
  onOffArray[46] = 1;

  // Main loop
  while (true) {
    const millis = Date.now();

    // Update the time if one second has passed since the last update
    if (millis - lastTimeCheck > 1000) {
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

      // Set each LED to the correct digit
      timeStr.split('').forEach((digit, segment) => {
        // Get the first LED in this segment
        // ((POSITION - 1) * 7) + 1
        // but `segment` is 0-indexed, so skip the `- 1`
        let i = segment * 7 + 1;
        // Loop over each LED in the segment, turning on or off
        digitMap[digit].forEach((ledValue) => {
          onOffArray[i] = ledValue;
          i++;
        });
      });
    }

    // Animation loop
    for (x = 0; x <= 26; x++) {
      y_loop: for (y = 0; y <= 4; y++) {
        const led = matrixMap[x][y];
        const isOn = onOffArray[led];

        const el = root.querySelector(`[data-led="${led}"]`);

        if (!el) continue y_loop;

        if (isOn) {
          el.style.fill = getPixelColor(x, y, millis);
        } else {
          el.style.fill = '#001010';
        }
      }
    }

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
