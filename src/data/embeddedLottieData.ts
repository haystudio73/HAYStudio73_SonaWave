/**
 * Embedded high-performance Bodymovin/Lottie animations.
 * Provides 100% reliable offline animation data that never fails with 403 Forbidden,
 * CORS, or network latency.
 */

// 1. Spinning Vinyl Record with Grooves, Colorful Label, and Spindle Hole
export const VINYL_RECORD_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 120,
  w: 300,
  h: 300,
  nm: 'Spinning Vinyl Record',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Vinyl Disc Rotating',
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
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        // Base dark vinyl body
        {
          ty: 'gr',
          nm: 'Base Vinyl',
          it: [
            { ty: 'el', s: { a: 0, k: [270, 270] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.07, 0.08, 0.1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.35, 0.4, 0.5, 1] }, w: { a: 0, k: 2.5 }, o: { a: 0, k: 70 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Outer Sound Groove Ring 1
        {
          ty: 'gr',
          nm: 'Groove Ring 1',
          it: [
            { ty: 'el', s: { a: 0, k: [230, 230] }, p: { a: 0, k: [0, 0] } },
            { ty: 'st', c: { a: 0, k: [0.35, 0.45, 0.65, 1] }, w: { a: 0, k: 1.5 }, o: { a: 0, k: 40 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Sound Groove Ring 2
        {
          ty: 'gr',
          nm: 'Groove Ring 2',
          it: [
            { ty: 'el', s: { a: 0, k: [180, 180] }, p: { a: 0, k: [0, 0] } },
            { ty: 'st', c: { a: 0, k: [0.35, 0.45, 0.65, 1] }, w: { a: 0, k: 1.5 }, o: { a: 0, k: 40 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Center Album Sticker (Retro Magenta / Coral)
        {
          ty: 'gr',
          nm: 'Album Label',
          it: [
            { ty: 'el', s: { a: 0, k: [105, 105] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.92, 0.25, 0.48, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 0.85, 0.3, 1] }, w: { a: 0, k: 2.5 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Inner Label Ring
        {
          ty: 'gr',
          nm: 'Inner Ring',
          it: [
            { ty: 'el', s: { a: 0, k: [65, 65] }, p: { a: 0, k: [0, 0] } },
            { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 1.5 }, o: { a: 0, k: 60 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Center Spindle Hole
        {
          ty: 'gr',
          nm: 'Spindle Center',
          it: [
            { ty: 'el', s: { a: 0, k: [22, 22] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.03, 0.03, 0.05, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.8, 0.8, 0.85, 1] }, w: { a: 0, k: 1.5 }, o: { a: 0, k: 100 } },
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

// 2. Equalizer Soundwave Spectrum (5 bouncing bars with gradient tones)
export const EQUALIZER_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Equalizer Soundwave',
  ddd: 0,
  assets: [],
  layers: [0, 1, 2, 3, 4].map((i) => {
    const xPos = 70 + i * 40;
    const h1 = 30 + (i % 3) * 30;
    const h2 = 95 - (i % 2) * 35;
    const h3 = 135 - (i % 3) * 25;
    const h4 = 55 + (i % 2) * 35;
    return {
      ddd: 0,
      ind: i + 1,
      ty: 4,
      nm: `EQ Bar ${i + 1}`,
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [xPos, 220, 0] },
        a: { a: 0, k: [0, 60, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, h1, 100] },
            { t: 15 + (i % 3) * 5, s: [100, h3, 100] },
            { t: 30 + (i % 2) * 4, s: [100, h2, 100] },
            { t: 45 + (i % 3) * 3, s: [100, h4, 100] },
            { t: 60, s: [100, h1, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              ty: 'rc',
              d: 1,
              s: { a: 0, k: [24, 120] },
              p: { a: 0, k: [0, 60] },
              r: { a: 0, k: 6 },
            },
            {
              ty: 'fl',
              c: {
                a: 0,
                k: [
                  0.32 + i * 0.14,
                  0.48 + (i % 2) * 0.22,
                  0.95 - i * 0.08,
                  1,
                ],
              },
              o: { a: 0, k: 100 },
            },
            {
              ty: 'st',
              c: { a: 0, k: [1, 1, 1, 1] },
              w: { a: 0, k: 1.5 },
              o: { a: 0, k: 50 },
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    };
  }),
};

// 3. Neon Heart Beat Pulse (Animated double-heartbeat with neon glow)
export const NEON_HEART_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Neon Pulsing Heart',
  ddd: 0,
  assets: [],
  layers: [
    // Outer Glow Ring Pulsing
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Pulse Glow Halo',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [20] },
            { t: 15, s: [75] },
            { t: 30, s: [25] },
            { t: 45, s: [85] },
            { t: 60, s: [20] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [85, 85, 100] },
            { t: 15, s: [115, 115, 100] },
            { t: 30, s: [95, 95, 100] },
            { t: 45, s: [125, 125, 100] },
            { t: 60, s: [85, 85, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'el', s: { a: 0, k: [210, 210] }, p: { a: 0, k: [0, 0] } },
            { ty: 'st', c: { a: 0, k: [1, 0.2, 0.6, 1] }, w: { a: 0, k: 4 }, o: { a: 0, k: 70 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Left Heart Lobe
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Heart Body Left',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: -45 },
        p: { a: 0, k: [136, 142, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100] },
            { t: 12, s: [122, 122, 100] },
            { t: 24, s: [105, 105, 100] },
            { t: 36, s: [128, 128, 100] },
            { t: 60, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', s: { a: 0, k: [70, 110] }, p: { a: 0, k: [0, -20] }, r: { a: 0, k: 35 } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.15, 0.5, 1] }, o: { a: 0, k: 95 } },
            { ty: 'st', c: { a: 0, k: [1, 0.7, 0.9, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Right Heart Lobe
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Heart Body Right',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 45 },
        p: { a: 0, k: [164, 142, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100] },
            { t: 12, s: [122, 122, 100] },
            { t: 24, s: [105, 105, 100] },
            { t: 36, s: [128, 128, 100] },
            { t: 60, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', s: { a: 0, k: [70, 110] }, p: { a: 0, k: [0, -20] }, r: { a: 0, k: 35 } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.15, 0.5, 1] }, o: { a: 0, k: 95 } },
            { ty: 'st', c: { a: 0, k: [1, 0.7, 0.9, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 100 } },
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

// 4. Dancing Musical Notes (Three notes floating upwards with oscillation)
export const DANCING_NOTES_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 90,
  w: 300,
  h: 300,
  nm: 'Dancing Musical Notes',
  ddd: 0,
  assets: [],
  layers: [
    // Note 1 (Left eighth note)
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Musical Note 1',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [20] },
            { t: 20, s: [100] },
            { t: 70, s: [100] },
            { t: 90, s: [10] },
          ],
        },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-15] },
            { t: 45, s: [15] },
            { t: 90, s: [-15] },
          ],
        },
        p: {
          a: 1,
          k: [
            { t: 0, s: [110, 240, 0] },
            { t: 90, s: [95, 70, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [90, 90, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Note Head',
          it: [
            { ty: 'el', s: { a: 0, k: [28, 22] }, p: { a: 0, k: [-8, 12] } },
            { ty: 'fl', c: { a: 0, k: [0.3, 0.8, 1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: -20 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Stem and Flag',
          it: [
            { ty: 'rc', s: { a: 0, k: [5, 45] }, p: { a: 0, k: [6, -10] }, r: { a: 0, k: 2 } },
            { ty: 'rc', s: { a: 0, k: [20, 8] }, p: { a: 0, k: [14, -30] }, r: { a: 0, k: 3 } },
            { ty: 'fl', c: { a: 0, k: [0.4, 0.85, 1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 90,
      st: 0,
    },
    // Note 2 (Right sixteenth beam note)
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Musical Note 2',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 15, s: [20] },
            { t: 35, s: [100] },
            { t: 75, s: [100] },
            { t: 90, s: [10] },
          ],
        },
        r: {
          a: 1,
          k: [
            { t: 0, s: [12] },
            { t: 45, s: [-12] },
            { t: 90, s: [12] },
          ],
        },
        p: {
          a: 1,
          k: [
            { t: 0, s: [195, 230, 0] },
            { t: 90, s: [210, 60, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [110, 110, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'el', s: { a: 0, k: [26, 20] }, p: { a: 0, k: [-16, 12] } },
            { ty: 'el', s: { a: 0, k: [26, 20] }, p: { a: 0, k: [16, 8] } },
            { ty: 'rc', s: { a: 0, k: [4, 42] }, p: { a: 0, k: [-4, -8] }, r: { a: 0, k: 2 } },
            { ty: 'rc', s: { a: 0, k: [4, 42] }, p: { a: 0, k: [28, -12] }, r: { a: 0, k: 2 } },
            { ty: 'rc', s: { a: 0, k: [36, 7] }, p: { a: 0, k: [12, -28] }, r: { a: 0, k: -6 } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.35, 0.85, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 90,
      st: 0,
    },
  ],
};

// 5. Cyber Lightning Bolt (Electric flashing bolt with cyan glow)
export const CYBER_LIGHTNING_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 40,
  w: 300,
  h: 300,
  nm: 'Cyber Lightning Bolt',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Lightning Flash',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [100] },
            { t: 8, s: [30] },
            { t: 14, s: [100] },
            { t: 20, s: [80] },
            { t: 28, s: [25] },
            { t: 34, s: [100] },
            { t: 40, s: [100] },
          ],
        },
        r: { a: 0, k: 10 },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100] },
            { t: 14, s: [115, 115, 100] },
            { t: 28, s: [95, 95, 100] },
            { t: 40, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        // Lightning segments composed of angled rounded bars
        {
          ty: 'gr',
          nm: 'Bolt Top',
          it: [
            { ty: 'rc', s: { a: 0, k: [22, 100] }, p: { a: 0, k: [12, -45] }, r: { a: 0, k: 6 } },
            { ty: 'fl', c: { a: 0, k: [0.2, 0.95, 1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 25 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Bolt Middle Jag',
          it: [
            { ty: 'rc', s: { a: 0, k: [20, 95] }, p: { a: 0, k: [-8, 10] }, r: { a: 0, k: 5 } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.95, 0.2, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 95 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: -32 }, o: { a: 0, k: 100 } },
          ],
        },
        {
          ty: 'gr',
          nm: 'Bolt Bottom Spear',
          it: [
            { ty: 'rc', s: { a: 0, k: [18, 90] }, p: { a: 0, k: [5, 55] }, r: { a: 0, k: 4 } },
            { ty: 'fl', c: { a: 0, k: [0.2, 0.95, 1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 22 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 40,
      st: 0,
    },
  ],
};

// 6. Bass Subwoofer Speaker Pumping (Pulsing speaker cone with acoustic blast waves)
export const BASS_SPEAKER_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Pumping Bass Subwoofer',
  ddd: 0,
  assets: [],
  layers: [
    // Expanding Acoustic Wave 1
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Acoustic Wave 1',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [90] },
            { t: 30, s: [40] },
            { t: 60, s: [0] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [80, 80, 100] },
            { t: 60, s: [150, 150, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'el', s: { a: 0, k: [220, 220] }, p: { a: 0, k: [0, 0] } },
            { ty: 'st', c: { a: 0, k: [0.4, 0.6, 1, 1] }, w: { a: 0, k: 3.5 }, o: { a: 0, k: 80 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Main Speaker Cabinet & Pumping Cone
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Speaker Cone',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100] },
            { t: 10, s: [124, 124, 100] },
            { t: 25, s: [96, 96, 100] },
            { t: 40, s: [112, 112, 100] },
            { t: 60, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        // Outer cabinet frame
        {
          ty: 'gr',
          it: [
            { ty: 'rc', s: { a: 0, k: [180, 180] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 28 } },
            { ty: 'fl', c: { a: 0, k: [0.1, 0.12, 0.16, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.3, 0.35, 0.45, 1] }, w: { a: 0, k: 4 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Outer Subwoofer Cone
        {
          ty: 'gr',
          it: [
            { ty: 'el', s: { a: 0, k: [135, 135] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.18, 0.22, 0.3, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [0.85, 0.3, 0.5, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Center Dust Cap
        {
          ty: 'gr',
          it: [
            { ty: 'el', s: { a: 0, k: [55, 55] }, p: { a: 0, k: [0, 0] } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.3, 0.55, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 0.9, 0.3, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 90 } },
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

// 7. Sparkling Cyber Stars (Rotating 4-pointed shimmering stars)
export const SPARKLE_STARS_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Sparkling Cyber Stars',
  ddd: 0,
  assets: [],
  layers: [
    // Center big star
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Main Star',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 60, s: [90] },
          ],
        },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [70, 70, 100] },
            { t: 30, s: [130, 130, 100] },
            { t: 60, s: [70, 70, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', s: { a: 0, k: [18, 140] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 9 } },
            { ty: 'rc', s: { a: 0, k: [140, 18] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 9 } },
            { ty: 'fl', c: { a: 0, k: [1, 0.95, 0.4, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Mini satellite star 1
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Mini Star 1',
      sr: 1,
      ks: {
        o: { a: 0, k: 90 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [45] },
            { t: 60, s: [-45] },
          ],
        },
        p: { a: 0, k: [75, 90, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [110, 110, 100] },
            { t: 30, s: [50, 50, 100] },
            { t: 60, s: [110, 110, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', s: { a: 0, k: [10, 70] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 5 } },
            { ty: 'rc', s: { a: 0, k: [70, 10] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 5 } },
            { ty: 'fl', c: { a: 0, k: [0.4, 0.95, 1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Mini satellite star 2
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Mini Star 2',
      sr: 1,
      ks: {
        o: { a: 0, k: 90 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0] },
            { t: 60, s: [90] },
          ],
        },
        p: { a: 0, k: [225, 210, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [40, 40, 100] },
            { t: 30, s: [100, 100, 100] },
            { t: 60, s: [40, 40, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', s: { a: 0, k: [10, 65] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 5 } },
            { ty: 'rc', s: { a: 0, k: [65, 10] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 5 } },
            { ty: 'fl', c: { a: 0, k: [1, 0.45, 0.85, 1] }, o: { a: 0, k: 100 } },
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

// 8. Glowing Neon Headphones
export const NEON_HEADPHONES_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Glowing Neon Headphones',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Headphones Rig',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-4] },
            { t: 30, s: [4] },
            { t: 60, s: [-4] },
          ],
        },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100] },
            { t: 30, s: [108, 108, 100] },
            { t: 60, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        // Arc headband (outer circle stroked with half clip)
        {
          ty: 'gr',
          nm: 'Headband Arc',
          it: [
            { ty: 'el', s: { a: 0, k: [160, 160] }, p: { a: 0, k: [0, -20] } },
            { ty: 'st', c: { a: 0, k: [0.35, 0.85, 1, 1] }, w: { a: 0, k: 8 }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Left Ear Cup
        {
          ty: 'gr',
          nm: 'Left Cup',
          it: [
            { ty: 'rc', s: { a: 0, k: [26, 75] }, p: { a: 0, k: [-72, -10] }, r: { a: 0, k: 12 } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.25, 0.65, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Right Ear Cup
        {
          ty: 'gr',
          nm: 'Right Cup',
          it: [
            { ty: 'rc', s: { a: 0, k: [26, 75] }, p: { a: 0, k: [72, -10] }, r: { a: 0, k: 12 } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.25, 0.65, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, w: { a: 0, k: 2 }, o: { a: 0, k: 90 } },
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

// 9. Lo-Fi Chill Coffee Steam (Warm mug with rising steam)
export const LOFI_COFFEE_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Lo-Fi Chill Coffee',
  ddd: 0,
  assets: [],
  layers: [
    // Steam 1
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Steam 1',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [10] },
            { t: 30, s: [80] },
            { t: 60, s: [10] },
          ],
        },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [135, 140, 0] },
            { t: 60, s: [130, 60, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', s: { a: 0, k: [6, 45] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 3 } },
            { ty: 'fl', c: { a: 0, k: [1, 0.85, 0.7, 1] }, o: { a: 0, k: 70 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 15 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Steam 2
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Steam 2',
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [40] },
            { t: 30, s: [10] },
            { t: 60, s: [70] },
          ],
        },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [165, 130, 0] },
            { t: 60, s: [170, 50, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', s: { a: 0, k: [6, 45] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 3 } },
            { ty: 'fl', c: { a: 0, k: [1, 0.85, 0.7, 1] }, o: { a: 0, k: 70 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: -15 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Coffee Cup Base
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Coffee Cup',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [150, 200, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        // Cup Mug
        {
          ty: 'gr',
          nm: 'Mug Body',
          it: [
            { ty: 'rc', s: { a: 0, k: [110, 80] }, p: { a: 0, k: [-5, 0] }, r: { a: 0, k: 18 } },
            { ty: 'fl', c: { a: 0, k: [0.92, 0.55, 0.25, 1] }, o: { a: 0, k: 100 } },
            { ty: 'st', c: { a: 0, k: [1, 0.9, 0.8, 1] }, w: { a: 0, k: 3 }, o: { a: 0, k: 90 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
          ],
        },
        // Mug Handle
        {
          ty: 'gr',
          nm: 'Mug Handle',
          it: [
            { ty: 'el', s: { a: 0, k: [46, 52] }, p: { a: 0, k: [56, 0] } },
            { ty: 'st', c: { a: 0, k: [0.92, 0.55, 0.25, 1] }, w: { a: 0, k: 8 }, o: { a: 0, k: 100 } },
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

// 10. Fire Flame Burn (Dynamic multi-layer flickering flame)
export const FIRE_FLAME_LOTTIE = {
  v: '5.5.7',
  fr: 60,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: 'Fire Flame Beat',
  ddd: 0,
  assets: [],
  layers: [
    // Outer Red Flame
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Outer Flame Red',
      sr: 1,
      ks: {
        o: { a: 0, k: 90 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [-6] },
            { t: 30, s: [6] },
            { t: 60, s: [-6] },
          ],
        },
        p: { a: 0, k: [150, 160, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100, 100] },
            { t: 15, s: [115, 125, 100] },
            { t: 30, s: [95, 95, 100] },
            { t: 45, s: [120, 130, 100] },
            { t: 60, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', s: { a: 0, k: [90, 120] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 45 } },
            { ty: 'fl', c: { a: 0, k: [0.95, 0.2, 0.1, 1] }, o: { a: 0, k: 95 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 45 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Middle Orange Flame
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Middle Flame Orange',
      sr: 1,
      ks: {
        o: { a: 0, k: 95 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [6] },
            { t: 30, s: [-6] },
            { t: 60, s: [6] },
          ],
        },
        p: { a: 0, k: [150, 165, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [85, 85, 100] },
            { t: 20, s: [105, 110, 100] },
            { t: 40, s: [80, 80, 100] },
            { t: 60, s: [85, 85, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', s: { a: 0, k: [65, 90] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 32 } },
            { ty: 'fl', c: { a: 0, k: [1, 0.55, 0.1, 1] }, o: { a: 0, k: 100 } },
            { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 45 }, o: { a: 0, k: 100 } },
          ],
        },
      ],
      ip: 0,
      op: 60,
      st: 0,
    },
    // Center Yellow Core Flame
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Core Flame Yellow',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 45 },
        p: { a: 0, k: [150, 172, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [70, 70, 100] },
            { t: 25, s: [100, 100, 100] },
            { t: 60, s: [70, 70, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: 'gr',
          it: [
            { ty: 'rc', s: { a: 0, k: [38, 55] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 18 } },
            { ty: 'fl', c: { a: 0, k: [1, 0.95, 0.35, 1] }, o: { a: 0, k: 100 } },
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

import {
  DJ_TURNTABLE_LOTTIE,
  RETRO_MICROPHONE_LOTTIE,
  CASSETTE_TAPE_LOTTIE,
  CYBER_SKULL_LOTTIE,
  CHILL_LOFI_CAT_LOTTIE,
  FLOATING_ASTRONAUT_LOTTIE,
  COZY_CAMPFIRE_LOTTIE,
  DANCING_CHARACTER_LOTTIE,
  CELEBRATION_FIREWORKS_LOTTIE,
  ENERGY_PORTAL_LOTTIE,
  HANDOFF_LOADER_LOTTIE,
} from './moreEmbeddedLotties';

// Map of all preset IDs to their embedded Bodymovin animation data
export const EMBEDDED_LOTTIE_DATA: Record<string, any> = {
  'vinyl-record-spin': VINYL_RECORD_LOTTIE,
  'equalizer-soundwave': EQUALIZER_LOTTIE,
  'neon-heart-beat': NEON_HEART_LOTTIE,
  'dancing-notes': DANCING_NOTES_LOTTIE,
  'cyber-lightning-bolt': CYBER_LIGHTNING_LOTTIE,
  'bass-speaker-pumping': BASS_SPEAKER_LOTTIE,
  'sparkle-cyber-star': SPARKLE_STARS_LOTTIE,
  'neon-headphones': NEON_HEADPHONES_LOTTIE,
  'lofi-coffee-steam': LOFI_COFFEE_LOTTIE,
  'steaming-coffee': LOFI_COFFEE_LOTTIE,
  'fire-flame-beat': FIRE_FLAME_LOTTIE,
  'burning-flame-core': FIRE_FLAME_LOTTIE,
  'dj-turntable': DJ_TURNTABLE_LOTTIE,
  'retro-microphone': RETRO_MICROPHONE_LOTTIE,
  'chill-cat-sleep': CHILL_LOFI_CAT_LOTTIE,
  'chill-lofi-cat': CHILL_LOFI_CAT_LOTTIE,
  '80s-cassette-tape': CASSETTE_TAPE_LOTTIE,
  'cyber-skull-glow': CYBER_SKULL_LOTTIE,
  'floating-astronaut': FLOATING_ASTRONAUT_LOTTIE,
  'cozy-campfire': COZY_CAMPFIRE_LOTTIE,
  'dancing-hiphop-boy': DANCING_CHARACTER_LOTTIE,
  'celebration-fireworks': CELEBRATION_FIREWORKS_LOTTIE,
  'energy-portal-ripple': ENERGY_PORTAL_LOTTIE,
  'lottiefiles-handoff-loader': HANDOFF_LOADER_LOTTIE,
};

export function getEmbeddedLottieData(id: string): any {
  if (!id || typeof id !== 'string') return null;
  if (EMBEDDED_LOTTIE_DATA[id]) {
    try {
      return JSON.parse(JSON.stringify(EMBEDDED_LOTTIE_DATA[id]));
    } catch {
      return EMBEDDED_LOTTIE_DATA[id];
    }
  }

  const idLower = id.toLowerCase();
  let source: any = null;
  if (idLower.includes('turntable') || idLower.includes('dj')) {
    source = DJ_TURNTABLE_LOTTIE;
  } else if (idLower.includes('mic') || idLower.includes('microphone')) {
    source = RETRO_MICROPHONE_LOTTIE;
  } else if (idLower.includes('cassette') || idLower.includes('tape')) {
    source = CASSETTE_TAPE_LOTTIE;
  } else if (idLower.includes('skull')) {
    source = CYBER_SKULL_LOTTIE;
  } else if (idLower.includes('cat') || idLower.includes('kitten')) {
    source = CHILL_LOFI_CAT_LOTTIE;
  } else if (idLower.includes('astronaut') || idLower.includes('spaceman')) {
    source = FLOATING_ASTRONAUT_LOTTIE;
  } else if (idLower.includes('campfire') || idLower.includes('camp')) {
    source = COZY_CAMPFIRE_LOTTIE;
  } else if (idLower.includes('hiphop') || idLower.includes('dancer') || idLower.includes('breakdance')) {
    source = DANCING_CHARACTER_LOTTIE;
  } else if (idLower.includes('firework') || idLower.includes('celebration')) {
    source = CELEBRATION_FIREWORKS_LOTTIE;
  } else if (idLower.includes('portal') || idLower.includes('vortex') || idLower.includes('shockwave')) {
    source = ENERGY_PORTAL_LOTTIE;
  } else if (idLower.includes('handoff') || idLower.includes('loader') || idLower.includes('spinner')) {
    source = HANDOFF_LOADER_LOTTIE;
  } else if (idLower.includes('vinyl') || idLower.includes('record') || idLower.includes('disc')) {
    source = VINYL_RECORD_LOTTIE;
  } else if (idLower.includes('equalizer') || idLower.includes('spectrum') || idLower.includes('soundwave') || idLower.includes('ripple')) {
    source = EQUALIZER_LOTTIE;
  } else if (idLower.includes('heart') || idLower.includes('love')) {
    source = NEON_HEART_LOTTIE;
  } else if (idLower.includes('note') || idLower.includes('music') || idLower.includes('melody')) {
    source = DANCING_NOTES_LOTTIE;
  } else if (idLower.includes('lightning') || idLower.includes('bolt') || idLower.includes('electric')) {
    source = CYBER_LIGHTNING_LOTTIE;
  } else if (idLower.includes('bass') || idLower.includes('speaker') || idLower.includes('subwoofer')) {
    source = BASS_SPEAKER_LOTTIE;
  } else if (idLower.includes('star') || idLower.includes('sparkle') || idLower.includes('glow')) {
    source = SPARKLE_STARS_LOTTIE;
  } else if (idLower.includes('headphone')) {
    source = NEON_HEADPHONES_LOTTIE;
  } else if (idLower.includes('coffee') || idLower.includes('chill') || idLower.includes('lofi')) {
    source = LOFI_COFFEE_LOTTIE;
  } else if (idLower.includes('fire') || idLower.includes('flame')) {
    source = FIRE_FLAME_LOTTIE;
  }

  if (source) {
    try {
      return JSON.parse(JSON.stringify(source));
    } catch {
      return source;
    }
  }

  return null;
}
