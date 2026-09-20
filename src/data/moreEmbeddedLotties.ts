/**
 * Additional high-craft Bodymovin/Lottie vector animations.
 * Provides authentic, dedicated, 60fps animations for every item in Free Lottie Library.
 */

// 1. DJ Turntable with Rotating Vinyl Platter, Moving Tonearm, and Pitch Fader
export const DJ_TURNTABLE_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 120,
  w: 300,
  h: 300,
  nm: 'DJ Turntable Scratch',
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Tonearm rocking gently over the groove
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Tonearm & Cartridge',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [24] },
            { t: 30, s: [27] },
            { t: 60, s: [23] },
            { t: 90, s: [26] },
            { t: 120, s: [24] },
          ],
        },
        p: { a: 0, k: [235, 80, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        // Pivot base ring
        {
          ty: 'gr',
          nm: 'Pivot Base',
          it: [
            { ty: 'el', s: { a: 0, k: [32, 32] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.35, 0.38, 0.45, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.7, 0.75, 0.85, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Curved metal tonearm tube
        {
          ty: 'gr',
          nm: 'Tonearm Tube',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: false,
                  i: [[0, 0], [0, -15], [0, 0]],
                  o: [[0, 15], [0, 0], [0, 0]],
                  v: [[0, 0], [-35, 60], [-85, 105]],
                },
              },
            },
            { ty: 'st', c: { a: 0, k: [0.85, 0.88, 0.95, 1] }, w: { a: 0, k: 4 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Headshell & cartridge needle
        {
          ty: 'gr',
          nm: 'Headshell Cartridge',
          it: [
            { ty: 'rc', s: { a: 0, k: [16, 26] }, p: { a: 0, k: [-88, 114] }, r: { a: 0, k: 3 } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.25, 0.4, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
    // Layer 2: Rotating Vinyl Record on Platter
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Rotating Vinyl Disc',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 120, s: [360] },
          ],
        },
        p: { a: 0, k: [130, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        // Vinyl body
        {
          ty: 'gr',
          nm: 'Vinyl Disc',
          it: [
            { ty: 'el', s: { a: 0, k: [180, 180] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.08, 0.09, 0.12, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.35, 0.4, 0.55, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 60 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Grooves
        {
          ty: 'gr',
          nm: 'Groove 1',
          it: [
            { ty: 'el', s: { a: 0, k: [150, 150] }, p: { a: 0, k: [0, 0] } },
            { ty: 'st', c: { a: 0, k: [0.4, 0.45, 0.6, 1] }, w: { a: 0, k: 1.2 }, o: { a: 0, k: 50 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Groove 2',
          it: [
            { ty: 'el', s: { a: 0, k: [115, 115] }, p: { a: 0, k: [0, 0] } },
            { ty: 'st', c: { a: 0, k: [0.4, 0.45, 0.6, 1] }, w: { a: 0, k: 1.2 }, o: { a: 0, k: 50 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Center label (Electric Cyan & Neon Pink)
        {
          ty: 'gr',
          nm: 'Record Label',
          it: [
            { ty: 'el', s: { a: 0, k: [65, 65] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.05, 0.8, 0.9, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 0.3, 0.6, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Spindle hole
        {
          ty: 'gr',
          nm: 'Spindle',
          it: [
            { ty: 'el', s: { a: 0, k: [14, 14] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.95, 0.98, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
    // Layer 3: Turntable Chassis Base & Pitch Fader
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Turntable Deck Body',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        // Main deck body
        {
          ty: 'gr',
          nm: 'Deck Body',
          it: [
            { ty: 'rc', s: { a: 0, k: [265, 225] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 14 } },
            { ty: 'fl', c: { a: 0, k: [0.12, 0.14, 0.18, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.3, 0.35, 0.45, 1] }, w: { a: 0, k: 2.5 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Platter recess well
        {
          ty: 'gr',
          nm: 'Platter Well',
          it: [
            { ty: 'el', s: { a: 0, k: [194, 194] }, p: { a: 0, k: [-20, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.05, 0.06, 0.08, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.25, 0.3, 0.4, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 80 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Pitch Fader Track & Strobe LEDs
        {
          ty: 'gr',
          nm: 'Pitch Fader Track',
          it: [
            { ty: 'rc', s: { a: 0, k: [8, 90] }, p: { a: 0, k: [102, 35] }, r: { a: 0, k: 3 } },
            { ty: 'fl', c: { a: 0, k: [0.06, 0.07, 0.09, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.4, 0.45, 0.55, 1] }, w: { a: 0, k: 1 }, o: { a: 0, k: 80 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Start/Stop Button
        {
          ty: 'gr',
          nm: 'Start Stop Button',
          it: [
            { ty: 'rc', s: { a: 0, k: [28, 22] }, p: { a: 0, k: [-105, 82] }, r: { a: 0, k: 4 } },
            { ty: 'fl', c: { a: 0, k: [0.8, 0.82, 0.88, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
  ],
};

// 2. Vintage 50s Retro Microphone with Pulsing Broadcast Soundwaves
export const RETRO_MICROPHONE_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Classic Vintage Mic',
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Radiating broadcast soundwaves left and right
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Broadcast Soundwaves',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [90] },
            { t: 60, s: [0] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 120, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [60, 60, 100] },
            { t: 60, s: [140, 140, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Left Wave',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: false,
                  i: [[0, 0], [-18, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[-65, -45], [-95, 0], [-65, 45]],
                },
              },
            },
            { ty: 'st', c: { a: 0, k: [0.3, 0.8, 1, 1] }, w: { a: 0, k: 3.5 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Right Wave',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: false,
                  i: [[0, 0], [18, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[65, -45], [95, 0], [65, 45]],
                },
              },
            },
            { ty: 'st', c: { a: 0, k: [0.3, 0.8, 1, 1] }, w: { a: 0, k: 3.5 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Layer 2: Vintage chrome microphone grill head and stand
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Microphone Head & Stand',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-2] },
            { t: 30, s: [2] },
            { t: 60, s: [-2] },
          ],
        },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100] },
            { t: 30, s: [103, 103, 100] },
            { t: 60, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        // Mic capsule grill body
        {
          ty: 'gr',
          nm: 'Grill Capsule',
          it: [
            { ty: 'rc', s: { a: 0, k: [80, 110] }, p: { a: 0, k: [0, -35] }, r: { a: 0, k: 40 } },
            { ty: 'fl', c: { a: 0, k: [0.15, 0.17, 0.22, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.85, 0.88, 0.95, 1] }, w: { a: 0, k: 4 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Horizontal grill slats
        ...[-65, -50, -35, -20, -5].map((yPos, i) => ({
          ty: 'gr',
          nm: `Grill Slat ${i}`,
          it: [
            { ty: 'rc', s: { a: 0, k: [72, 5] }, p: { a: 0, k: [0, yPos] }, r: { a: 0, k: 2 } },
            { ty: 'fl', c: { a: 0, k: [0.75, 0.8, 0.9, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        })),
        // Swivel mount ring
        {
          ty: 'gr',
          nm: 'Swivel Mount',
          it: [
            { ty: 'rc', s: { a: 0, k: [32, 22] }, p: { a: 0, k: [0, 30] }, r: { a: 0, k: 4 } },
            { ty: 'fl', c: { a: 0, k: [0.35, 0.4, 0.48, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.7, 0.75, 0.85, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Vertical stand pole
        {
          ty: 'gr',
          nm: 'Stand Pole',
          it: [
            { ty: 'rc', s: { a: 0, k: [12, 55] }, p: { a: 0, k: [0, 65] }, r: { a: 0, k: 2 } },
            { ty: 'fl', c: { a: 0, k: [0.85, 0.88, 0.95, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Heavy base plate
        {
          ty: 'gr',
          nm: 'Base Plate',
          it: [
            { ty: 'el', s: { a: 0, k: [90, 24] }, p: { a: 0, k: [0, 95] } },
            { ty: 'fl', c: { a: 0, k: [0.25, 0.28, 0.35, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.8, 0.85, 0.95, 1] }, w: { a: 0, k: 2.5 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
  ],
};

// 3. 80s Retro Cassette Tape with Dual Synchronized Spinning Spools
export const CASSETTE_TAPE_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 120,
  w: 300,
  h: 300,
  nm: '80s Retro Cassette Tape',
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Left Tape Spool
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Left Spool Gear',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 120, s: [360] },
          ],
        },
        p: { a: 0, k: [110, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Spool Ring',
          it: [
            { ty: 'el', s: { a: 0, k: [34, 34] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.95, 0.98, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.2, 0.22, 0.28, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // 6 gear teeth spokes
        ...[0, 60, 120, 180, 240, 300].map((deg, i) => ({
          ty: 'gr',
          nm: `Tooth ${i}`,
          it: [
            { ty: 'rc', s: { a: 0, k: [4, 10] }, p: { a: 0, k: [0, -11] }, r: { a: 0, k: 1 } },
            { ty: 'fl', c: { a: 0, k: [0.15, 0.18, 0.25, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: deg }, o: { a: 0, k: 100 } },
          ],
        })),
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
    // Layer 2: Right Tape Spool
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Right Spool Gear',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 120, s: [360] },
          ],
        },
        p: { a: 0, k: [190, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Spool Ring',
          it: [
            { ty: 'el', s: { a: 0, k: [34, 34] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.95, 0.98, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.2, 0.22, 0.28, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        ...[0, 60, 120, 180, 240, 300].map((deg, i) => ({
          ty: 'gr',
          nm: `Tooth ${i}`,
          it: [
            { ty: 'rc', s: { a: 0, k: [4, 10] }, p: { a: 0, k: [0, -11] }, r: { a: 0, k: 1 } },
            { ty: 'fl', c: { a: 0, k: [0.15, 0.18, 0.25, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: deg }, o: { a: 0, k: 100 } },
          ],
        })),
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
    // Layer 3: Cassette Outer Body Shell & Retro Neon Synthwave Graphics
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Cassette Body & Decal',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        // Main cassette body
        {
          ty: 'gr',
          nm: 'Shell Body',
          it: [
            { ty: 'rc', s: { a: 0, k: [230, 145] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 14 } },
            { ty: 'fl', c: { a: 0, k: [0.1, 0.12, 0.16, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.06, 0.72, 0.85, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Cassette Sticker Label (Magenta & Sunset Yellow)
        {
          ty: 'gr',
          nm: 'Sticker Label',
          it: [
            { ty: 'rc', s: { a: 0, k: [195, 88] }, p: { a: 0, k: [0, -10] }, r: { a: 0, k: 8 } },
            { ty: 'fl', c: { a: 0, k: [0.9, 0.18, 0.45, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 0.8, 0.2, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 85 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Center Viewport Window
        {
          ty: 'gr',
          nm: 'Center Window',
          it: [
            { ty: 'rc', s: { a: 0, k: [125, 42] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 6 } },
            { ty: 'fl', c: { a: 0, k: [0.06, 0.07, 0.1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.35, 0.4, 0.5, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 80 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Tape head base trapezoid
        {
          ty: 'gr',
          nm: 'Head Shield',
          it: [
            { ty: 'rc', s: { a: 0, k: [140, 24] }, p: { a: 0, k: [0, 52] }, r: { a: 0, k: 4 } },
            { ty: 'fl', c: { a: 0, k: [0.18, 0.2, 0.26, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
  ],
};

// 4. Cyber Glowing Skull with Pulsing Neon Eyes & Circuit Head
export const CYBER_SKULL_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Cyber Glowing Skull',
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Pulsing Neon Glowing Eye Pupils
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Glowing Eyes',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 142, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [90, 90, 100] },
            { t: 30, s: [125, 125, 100] },
            { t: 60, s: [90, 90, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Left Eye Glow',
          it: [
            { ty: 'el', s: { a: 0, k: [26, 26] }, p: { a: 0, k: [-32, 0] } },
            { ty: 'fl', c: { a: 0, k: [1, 0.15, 0.55, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 0.7, 0.9, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Right Eye Glow',
          it: [
            { ty: 'el', s: { a: 0, k: [26, 26] }, p: { a: 0, k: [32, 0] } },
            { ty: 'fl', c: { a: 0, k: [1, 0.15, 0.55, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 0.7, 0.9, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Layer 2: Geometric Neon Cyber Skull Silhouette & Teeth
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Cyber Skull Shell',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-1] },
            { t: 30, s: [1] },
            { t: 60, s: [-1] },
          ],
        },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        // Skull cranium
        {
          ty: 'gr',
          nm: 'Cranium Dome',
          it: [
            { ty: 'el', s: { a: 0, k: [140, 130] }, p: { a: 0, k: [0, -30] } },
            { ty: 'fl', c: { a: 0, k: [0.08, 0.1, 0.15, 0.9] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.1, 0.9, 1, 1] }, w: { a: 0, k: 3.5 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Cheekbones & Jaw
        {
          ty: 'gr',
          nm: 'Jaw',
          it: [
            { ty: 'rc', s: { a: 0, k: [80, 55] }, p: { a: 0, k: [0, 42] }, r: { a: 0, k: 8 } },
            { ty: 'fl', c: { a: 0, k: [0.08, 0.1, 0.15, 0.9] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.1, 0.9, 1, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Teeth grill lines
        ...[-25, -8, 8, 25].map((xPos, i) => ({
          ty: 'gr',
          nm: `Tooth ${i}`,
          it: [
            { ty: 'rc', s: { a: 0, k: [9, 18] }, p: { a: 0, k: [xPos, 48] }, r: { a: 0, k: 2 } },
            { ty: 'fl', c: { a: 0, k: [0.2, 0.85, 0.95, 1] }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        })),
        // Forehead circuit lines
        {
          ty: 'gr',
          nm: 'Forehead Circuit',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: false,
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[-35, -55], [0, -75], [35, -55]],
                },
              },
            },
            { ty: 'st', c: { a: 0, k: [1, 0.2, 0.6, 1] }, w: { a: 0, k: 2.5 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
  ],
};

// 5. Chill Lo-Fi Cat Wearing Headphones with Bobbing Head & Swishing Tail
export const CHILL_LOFI_CAT_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Chill Lofi Cat with Headphones',
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Swishing tail
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Swishing Tail',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-18] },
            { t: 30, s: [18] },
            { t: 60, s: [-18] },
          ],
        },
        p: { a: 0, k: [205, 215, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Tail Path',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: false,
                  i: [[0, 0], [20, -10], [0, 0]],
                  o: [[-10, 15], [0, 0], [0, 0]],
                  v: [[0, 0], [35, -25], [55, -40]],
                },
              },
            },
            { ty: 'st', c: { a: 0, k: [0.96, 0.65, 0.38, 1] }, w: { a: 0, k: 14 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Layer 2: Bobbing Cat Head with Cute Ears, Sleeping Eyes, and Headphones
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Cat Head & Headphones',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-2.5] },
            { t: 30, s: [2.5] },
            { t: 60, s: [-2.5] },
          ],
        },
        p: {
          a: 1,
          k: [
            { t: 0, s: [150, 150, 0] },
            { t: 30, s: [150, 156, 0] },
            { t: 60, s: [150, 150, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        // Left Ear
        {
          ty: 'gr',
          nm: 'Left Ear',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: true,
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[-55, -30], [-70, -85], [-20, -50]],
                },
              },
            },
            { ty: 'fl', c: { a: 0, k: [0.96, 0.65, 0.38, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Right Ear
        {
          ty: 'gr',
          nm: 'Right Ear',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: true,
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[55, -30], [70, -85], [20, -50]],
                },
              },
            },
            { ty: 'fl', c: { a: 0, k: [0.96, 0.65, 0.38, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Main Cat Face
        {
          ty: 'gr',
          nm: 'Cat Face',
          it: [
            { ty: 'el', s: { a: 0, k: [130, 110] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.98, 0.72, 0.45, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.85, 0.55, 0.3, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Sleeping Closed Eyes (^_^)
        {
          ty: 'gr',
          nm: 'Left Eye Closed',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: false,
                  i: [[0, 0], [0, -8], [0, 0]],
                  o: [[0, -8], [0, 0], [0, 0]],
                  v: [[-35, 5], [-22, -4], [-10, 5]],
                },
              },
            },
            { ty: 'st', c: { a: 0, k: [0.3, 0.2, 0.15, 1] }, w: { a: 0, k: 3.5 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Right Eye Closed',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: false,
                  i: [[0, 0], [0, -8], [0, 0]],
                  o: [[0, -8], [0, 0], [0, 0]],
                  v: [[10, 5], [22, -4], [35, 5]],
                },
              },
            },
            { ty: 'st', c: { a: 0, k: [0.3, 0.2, 0.15, 1] }, w: { a: 0, k: 3.5 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Cute Rosy Blushing Cheeks
        {
          ty: 'gr',
          nm: 'Cheeks',
          it: [
            { ty: 'el', s: { a: 0, k: [18, 12] }, p: { a: 0, k: [-38, 18] } },
            { ty: 'fl', c: { a: 0, k: [1, 0.45, 0.6, 0.7] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Right Cheek',
          it: [
            { ty: 'el', s: { a: 0, k: [18, 12] }, p: { a: 0, k: [38, 18] } },
            { ty: 'fl', c: { a: 0, k: [1, 0.45, 0.6, 0.7] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Headband & Over-Ear Earcups (Mint & Lavender)
        {
          ty: 'gr',
          nm: 'Headphone Band',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: false,
                  i: [[0, 0], [0, -35], [0, 0]],
                  o: [[0, -35], [0, 0], [0, 0]],
                  v: [[-65, -5], [0, -68], [65, -5]],
                },
              },
            },
            { ty: 'st', c: { a: 0, k: [0.35, 0.8, 0.7, 1] }, w: { a: 0, k: 6 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Left Earcup',
          it: [
            { ty: 'rc', s: { a: 0, k: [22, 45] }, p: { a: 0, k: [-68, 5] }, r: { a: 0, k: 10 } },
            { ty: 'fl', c: { a: 0, k: [0.75, 0.5, 0.95, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 80 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Right Earcup',
          it: [
            { ty: 'rc', s: { a: 0, k: [22, 45] }, p: { a: 0, k: [68, 5] }, r: { a: 0, k: 10 } },
            { ty: 'fl', c: { a: 0, k: [0.75, 0.5, 0.95, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 80 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
  ],
};

// 6. Cosmic Floating Astronaut in Zero Gravity with Gold Helmet Visor
export const FLOATING_ASTRONAUT_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 120,
  w: 300,
  h: 300,
  nm: 'Cosmic Floating Astronaut',
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Floating Twinkling Background Stars
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Twinkling Stars',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [60] },
            { t: 60, s: [100] },
            { t: 120, s: [60] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Star 1',
          it: [
            { ty: 'el', s: { a: 0, k: [8, 8] }, p: { a: 0, k: [-90, -80] } },
            { ty: 'fl', c: { a: 0, k: [1, 0.95, 0.4, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Star 2',
          it: [
            { ty: 'el', s: { a: 0, k: [6, 6] }, p: { a: 0, k: [95, 75] } },
            { ty: 'fl', c: { a: 0, k: [0.3, 0.9, 1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
    // Layer 2: Floating Astronaut Bobbing & Tilting
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Astronaut Suit',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-4] },
            { t: 60, s: [4] },
            { t: 120, s: [-4] },
          ],
        },
        p: {
          a: 1,
          k: [
            { t: 0, s: [150, 142, 0] },
            { t: 60, s: [150, 158, 0] },
            { t: 120, s: [150, 142, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        // Backpack
        {
          ty: 'gr',
          nm: 'Backpack',
          it: [
            { ty: 'rc', s: { a: 0, k: [110, 120] }, p: { a: 0, k: [0, 20] }, r: { a: 0, k: 16 } },
            { ty: 'fl', c: { a: 0, k: [0.75, 0.8, 0.88, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Suit Body
        {
          ty: 'gr',
          nm: 'Suit Body',
          it: [
            { ty: 'rc', s: { a: 0, k: [85, 95] }, p: { a: 0, k: [0, 30] }, r: { a: 0, k: 20 } },
            { ty: 'fl', c: { a: 0, k: [0.92, 0.94, 0.98, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.35, 0.5, 0.7, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Chest Control Plate
        {
          ty: 'gr',
          nm: 'Chest Plate',
          it: [
            { ty: 'rc', s: { a: 0, k: [42, 28] }, p: { a: 0, k: [0, 32] }, r: { a: 0, k: 5 } },
            { ty: 'fl', c: { a: 0, k: [0.18, 0.22, 0.3, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Helmet Outer Sphere
        {
          ty: 'gr',
          nm: 'Helmet Dome',
          it: [
            { ty: 'el', s: { a: 0, k: [105, 100] }, p: { a: 0, k: [0, -32] } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.96, 0.99, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.35, 0.5, 0.7, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Gold Iridescent Glass Visor with Cosmic Reflection
        {
          ty: 'gr',
          nm: 'Visor Glass',
          it: [
            { ty: 'rc', s: { a: 0, k: [78, 54] }, p: { a: 0, k: [0, -30] }, r: { a: 0, k: 18 } },
            { ty: 'fl', c: { a: 0, k: [0.98, 0.7, 0.15, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 0.9, 0.5, 1] }, w: { a: 0, k: 2.5 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Curved Visor Glare
        {
          ty: 'gr',
          nm: 'Visor Glare',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: false,
                  i: [[0, 0], [0, 0]],
                  o: [[0, 0], [0, 0]],
                  v: [[-26, -42], [15, -42]],
                },
              },
            },
            { ty: 'st', c: { a: 0, k: [1, 1, 1, 0.8] }, w: { a: 0, k: 3.5 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
  ],
};

// 7. Cozy Night Campfire with Dancing Flames, Logs, and Rising Ember Sparks
export const COZY_CAMPFIRE_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Cozy Night Campfire',
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Floating embers rising into the night
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Floating Embers',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [100] },
            { t: 60, s: [0] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Ember 1',
          it: [
            { ty: 'el', s: { a: 0, k: [5, 5] }, p: { a: 0, k: [-15, -75] } },
            { ty: 'fl', c: { a: 0, k: [1, 0.85, 0.3, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Ember 2',
          it: [
            { ty: 'el', s: { a: 0, k: [6, 6] }, p: { a: 0, k: [18, -95] } },
            { ty: 'fl', c: { a: 0, k: [1, 0.4, 0.1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Ember 3',
          it: [
            { ty: 'el', s: { a: 0, k: [4, 4] }, p: { a: 0, k: [-2, -115] } },
            { ty: 'fl', c: { a: 0, k: [1, 0.95, 0.5, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Layer 2: Dancing Multi-Tiered Campfire Flames
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Campfire Flame Body',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 160, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [96, 96, 100] },
            { t: 30, s: [106, 108, 100] },
            { t: 60, s: [96, 96, 100] },
          ],
        },
      },
      shapes: [
        // Outer crimson/orange flame
        {
          ty: 'gr',
          nm: 'Outer Flame',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: true,
                  i: [[0, -30], [-25, 0], [0, 25], [15, 0]],
                  o: [[0, 25], [25, 0], [0, -30], [-15, 0]],
                  v: [[0, -75], [-45, 10], [0, 25], [45, 10]],
                },
              },
            },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.25, 0.1, 0.9] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Mid golden-amber flame
        {
          ty: 'gr',
          nm: 'Mid Flame',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: true,
                  i: [[0, -20], [-18, 0], [0, 18], [12, 0]],
                  o: [[0, 18], [18, 0], [0, -20], [-12, 0]],
                  v: [[-3, -52], [-30, 8], [0, 20], [30, 8]],
                },
              },
            },
            { ty: 'fl', c: { a: 0, k: [1, 0.65, 0.1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Inner white-yellow hot flame core
        {
          ty: 'gr',
          nm: 'Core Flame',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: true,
                  i: [[0, -12], [-10, 0], [0, 10], [8, 0]],
                  o: [[0, 10], [10, 0], [0, -12], [-8, 0]],
                  v: [[0, -28], [-16, 8], [0, 15], [16, 8]],
                },
              },
            },
            { ty: 'fl', c: { a: 0, k: [1, 0.96, 0.65, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Layer 3: Crossed wooden logs & stones base
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Campfire Logs & Stones',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 195, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        // Left diagonal log
        {
          ty: 'gr',
          nm: 'Left Log',
          it: [
            { ty: 'rc', s: { a: 0, k: [85, 16] }, p: { a: 0, k: [-5, 0] }, r: { a: 0, k: 6 } },
            { ty: 'fl', c: { a: 0, k: [0.45, 0.22, 0.12, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.25, 0.12, 0.06, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: -24 }, o: { a: 0, k: 100 } },
          ],
        },
        // Right diagonal log
        {
          ty: 'gr',
          nm: 'Right Log',
          it: [
            { ty: 'rc', s: { a: 0, k: [85, 16] }, p: { a: 0, k: [5, 0] }, r: { a: 0, k: 6 } },
            { ty: 'fl', c: { a: 0, k: [0.48, 0.25, 0.14, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.25, 0.12, 0.06, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 24 }, o: { a: 0, k: 100 } },
          ],
        },
        // Surrounding stones
        ...[-50, -25, 0, 25, 50].map((x, i) => ({
          ty: 'gr',
          nm: `Stone ${i}`,
          it: [
            { ty: 'el', s: { a: 0, k: [22, 14] }, p: { a: 0, k: [x, 15] } },
            { ty: 'fl', c: { a: 0, k: [0.35, 0.38, 0.42, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        })),
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
  ],
};

// 8. Hip-Hop Dancing Character Silhouette Rhythmical Beat Bounce
export const DANCING_CHARACTER_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Hip-Hop Dancing Character',
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Floor Sound Pulse Ring beneath feet
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Beat Floor Wave',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [90] },
            { t: 30, s: [20] },
            { t: 60, s: [90] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 250, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [80, 40, 100] },
            { t: 30, s: [140, 60, 100] },
            { t: 60, s: [80, 40, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Floor Ring',
          it: [
            { ty: 'el', s: { a: 0, k: [140, 35] }, p: { a: 0, k: [0, 0] } },
            { ty: 'st', c: { a: 0, k: [0.2, 0.85, 1, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Layer 2: Dancing Character (Hoodie, Cap, Groove Sway)
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Dancing Character',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-4] },
            { t: 15, s: [0] },
            { t: 30, s: [4] },
            { t: 45, s: [0] },
            { t: 60, s: [-4] },
          ],
        },
        p: {
          a: 1,
          k: [
            { t: 0, s: [150, 145, 0] },
            { t: 15, s: [150, 155, 0] },
            { t: 30, s: [150, 145, 0] },
            { t: 45, s: [150, 155, 0] },
            { t: 60, s: [150, 145, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        // Head with backwards cap & headphones
        {
          ty: 'gr',
          nm: 'Head & Cap',
          it: [
            { ty: 'el', s: { a: 0, k: [46, 46] }, p: { a: 0, k: [0, -60] } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.75, 0.6, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Snapback Cap Brim
        {
          ty: 'gr',
          nm: 'Cap Brim',
          it: [
            { ty: 'rc', s: { a: 0, k: [52, 16] }, p: { a: 0, k: [12, -74] }, r: { a: 0, k: 4 } },
            { ty: 'fl', c: { a: 0, k: [0.1, 0.75, 0.9, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: -12 }, o: { a: 0, k: 100 } },
          ],
        },
        // Streetwear Hoodie Torso (Electric Purple)
        {
          ty: 'gr',
          nm: 'Hoodie Torso',
          it: [
            { ty: 'rc', s: { a: 0, k: [66, 75] }, p: { a: 0, k: [0, -5] }, r: { a: 0, k: 12 } },
            { ty: 'fl', c: { a: 0, k: [0.55, 0.2, 0.85, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.8, 0.5, 1, 1] }, w: { a: 0, k: 2.5 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Left Dancing Arm (Flexed)
        {
          ty: 'gr',
          nm: 'Left Arm',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: false,
                  i: [[0, 0], [0, 0]],
                  o: [[0, 0], [0, 0]],
                  v: [[-32, -20], [-58, 5]],
                },
              },
            },
            { ty: 'st', c: { a: 0, k: [0.55, 0.2, 0.85, 1] }, w: { a: 0, k: 14 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Right Dancing Arm (Upward pump)
        {
          ty: 'gr',
          nm: 'Right Arm',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: false,
                  i: [[0, 0], [0, 0]],
                  o: [[0, 0], [0, 0]],
                  v: [[32, -20], [60, -45]],
                },
              },
            },
            { ty: 'st', c: { a: 0, k: [0.55, 0.2, 0.85, 1] }, w: { a: 0, k: 14 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Streetwear Baggy Jogger Pants
        {
          ty: 'gr',
          nm: 'Left Leg',
          it: [
            { ty: 'rc', s: { a: 0, k: [22, 55] }, p: { a: 0, k: [-18, 55] }, r: { a: 0, k: 6 } },
            { ty: 'fl', c: { a: 0, k: [0.15, 0.18, 0.24, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 10 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Right Leg',
          it: [
            { ty: 'rc', s: { a: 0, k: [22, 55] }, p: { a: 0, k: [18, 55] }, r: { a: 0, k: 6 } },
            { ty: 'fl', c: { a: 0, k: [0.15, 0.18, 0.24, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: -10 }, o: { a: 0, k: 100 } },
          ],
        },
        // Hi-Top Sneakers
        {
          ty: 'gr',
          nm: 'Left Sneaker',
          it: [
            { ty: 'rc', s: { a: 0, k: [32, 14] }, p: { a: 0, k: [-24, 86] }, r: { a: 0, k: 4 } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.3, 0.5, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Right Sneaker',
          it: [
            { ty: 'rc', s: { a: 0, k: [32, 14] }, p: { a: 0, k: [24, 86] }, r: { a: 0, k: 4 } },
            { ty: 'fl', c: { a: 0, k: [0.1, 0.8, 0.95, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
  ],
};

// 9. Colorful Celebration Fireworks with Expanding Radiant Spark Trails
export const CELEBRATION_FIREWORKS_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Colorful Celebration Fireworks',
  ddd: 0,
  assets: [],
  layers: [
    // 12 Radial Expanding Spark Trails with Colors
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Radial Sparks',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 8, s: [100] },
            { t: 40, s: [90] },
            { t: 60, s: [0] },
          ],
        },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 60, s: [45] },
          ],
        },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [10, 10, 100] },
            { t: 60, s: [135, 135, 100] },
          ],
        },
      },
      shapes: [
        ...[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
          const colors = [
            [1, 0.85, 0.2, 1], // Gold
            [0.1, 0.85, 1, 1],  // Cyan
            [1, 0.25, 0.6, 1],  // Magenta
            [0.2, 1, 0.5, 1],   // Emerald
          ];
          const c = colors[i % 4];
          return {
            ty: 'gr',
            nm: `Trail ${i}`,
            it: [
              { ty: 'el', s: { a: 0, k: [10, 10] }, p: { a: 0, k: [0, -78] } },
              { ty: 'fl', c: { a: 0, k: c }, o: { a: 0, k: 100 } },
              {
                ty: 'sh',
                ks: {
                  a: 0,
                  k: {
                    c: false,
                    i: [[0, 0], [0, 0]],
                    o: [[0, 0], [0, 0]],
                    v: [[0, -25], [0, -70]],
                  },
                },
              },
              { ty: 'st', c: { a: 0, k: c }, w: { a: 0, k: 3.5 }, o: { a: 0, k: 80 } },
              { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: deg }, o: { a: 0, k: 100 } },
            ],
          };
        }),
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Center flash star
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Burst Core Flash',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [100] },
            { t: 25, s: [0] },
            { t: 60, s: [0] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [30, 30, 100] },
            { t: 25, s: [160, 160, 100] },
            { t: 60, s: [160, 160, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Core Ring',
          it: [
            { ty: 'el', s: { a: 0, k: [40, 40] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
  ],
};

// 10. Cosmic Energy Portal Ripple with Rotating Concentric Shockwave Rings
export const ENERGY_PORTAL_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Pulse Energy Wave Ripple',
  ddd: 0,
  assets: [],
  layers: [
    // Outer rotating energy ring
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Outer Energy Ring',
      sr: 1,
      ks: {
        o: { a: 0, k: 90 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 60, s: [360] },
          ],
        },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Outer Ring',
          it: [
            { ty: 'el', s: { a: 0, k: [200, 200] }, p: { a: 0, k: [0, 0] } },
            { ty: 'st', c: { a: 0, k: [0.15, 0.75, 1, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        ...[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => ({
          ty: 'gr',
          nm: `Rune ${i}`,
          it: [
            { ty: 'rc', s: { a: 0, k: [8, 18] }, p: { a: 0, k: [0, -100] }, r: { a: 0, k: 2 } },
            { ty: 'fl', c: { a: 0, k: [0.3, 0.9, 1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: deg }, o: { a: 0, k: 100 } },
          ],
        })),
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Expanding Sonic Shockwave Ripple
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Sonic Shockwave',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [100] },
            { t: 60, s: [0] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [25, 25, 100] },
            { t: 60, s: [155, 155, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Shockwave Circle',
          it: [
            { ty: 'el', s: { a: 0, k: [120, 120] }, p: { a: 0, k: [0, 0] } },
            { ty: 'st', c: { a: 0, k: [1, 0.2, 0.7, 1] }, w: { a: 0, k: 5 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Center Radiant Vortex Core
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Portal Core',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 60, s: [-360] },
          ],
        },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [90, 90, 100] },
            { t: 30, s: [115, 115, 100] },
            { t: 60, s: [90, 90, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Core Ring',
          it: [
            { ty: 'el', s: { a: 0, k: [60, 60] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.15, 0.65, 0.9] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 0.9, 0.4, 1] }, w: { a: 0, k: 3.5 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
  ],
};

// 11. Handoff Neon Glow Ring Loader
export const HANDOFF_LOADER_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Lottie Glow Ring (Handoff Preset)',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Rotating Glow Arc',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 60, s: [360] },
          ],
        },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Glow Ring Arc',
          it: [
            { ty: 'el', s: { a: 0, k: [130, 130] }, p: { a: 0, k: [0, 0] } },
            { ty: 'st', c: { a: 0, k: [0.38, 0.4, 1, 1] }, w: { a: 0, k: 8 }, o: { a: 0, k: 95 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Leading Spark Beacon',
          it: [
            { ty: 'el', s: { a: 0, k: [22, 22] }, p: { a: 0, k: [0, -65] } },
            { ty: 'fl', c: { a: 0, k: [0.1, 0.9, 1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
  ],
};
