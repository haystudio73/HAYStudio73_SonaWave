import { unzipSync, strFromU8 } from 'fflate';

// Cache for fetched animation data to avoid redundant network transfers
const animationDataCache = new Map<string, any>();

/**
 * Extracts the primary Lottie animation JSON structure from a .lottie (zip) file
 */
export function extractLottieJsonFromZip(buf: ArrayBuffer): any | null {
  try {
    const uint8 = new Uint8Array(buf);
    const unzipped = unzipSync(uint8);

    // 1. Try manifest.json first
    let manifest: any = null;
    if (unzipped['manifest.json']) {
      try {
        manifest = JSON.parse(strFromU8(unzipped['manifest.json']));
      } catch {
        // ignore manifest parse error
      }
    }

    // Check manifest specified animation id
    const targetAnimId =
      manifest?.initial?.animation ||
      manifest?.animations?.[0]?.id ||
      manifest?.animations?.[0]?.animationId;

    if (targetAnimId) {
      const candidates = [
        `a/${targetAnimId}.json`,
        `animations/${targetAnimId}.json`,
        `${targetAnimId}.json`,
      ];
      for (const cand of candidates) {
        if (unzipped[cand]) {
          try {
            const parsed = JSON.parse(strFromU8(unzipped[cand]));
            if (parsed && (parsed.v || Array.isArray(parsed.layers))) {
              return parsed;
            }
          } catch {
            // continue
          }
        }
      }
    }

    // 2. Scan all .json files in the zip for valid Lottie animation structure
    for (const [filename, fileData] of Object.entries(unzipped)) {
      if (
        filename === 'manifest.json' ||
        filename.startsWith('t/') ||
        filename.startsWith('themes/') ||
        filename.startsWith('s/') ||
        filename.startsWith('states/')
      ) {
        continue;
      }
      if (filename.endsWith('.json')) {
        try {
          const parsed = JSON.parse(strFromU8(fileData));
          if (parsed && (parsed.v || Array.isArray(parsed.layers))) {
            return parsed;
          }
        } catch {
          // continue
        }
      }
    }

    return null;
  } catch (err) {
    console.warn('Failed to extract Lottie JSON from zip:', err);
    return null;
  }
}

/**
 * Cleans and normalizes user-provided Lottie URLs.
 * Handles iframe embed snippets, lottie.host/embed/ paths, and trailing query parameters.
 */
export function sanitizeLottieUrl(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let url = input.trim();

  // 1. Check if user pasted an entire HTML / JS snippet (such as DotLottie JS sample: <script> new DotLottie({ src: ... }) </script>)
  const dotLottieSrcMatch = url.match(/src\s*:\s*["'`]?<?(https?:\/\/[^"'`>\s]+)>?["'`]?/i);
  if (dotLottieSrcMatch && dotLottieSrcMatch[1] && !dotLottieSrcMatch[1].includes('YOUR_ANIMATION_ID')) {
    url = dotLottieSrcMatch[1].trim();
  } else {
    // Check if user pasted HTML tag like <canvas id="canvas"></canvas> or <iframe>, <lottie-player>, <dotlottie-player>
    const tagMatch = url.match(/src=["']([^"']+)["']/i);
    if (tagMatch && tagMatch[1] && !tagMatch[1].includes('YOUR_ANIMATION_ID')) {
      url = tagMatch[1].trim();
    } else {
      // Check for any standalone .lottie or .json URL anywhere inside pasted snippet
      const generalUrlMatch = url.match(/https?:\/\/[^\s"'`<>]+?\.(?:lottie|json)(?:\?[^\s"'`<>]*)?/i);
      if (generalUrlMatch && generalUrlMatch[0] && !generalUrlMatch[0].includes('YOUR_ANIMATION_ID')) {
        url = generalUrlMatch[0].trim();
      }
    }
  }

  // Clean angle brackets if present like <https://lottie.host/...>
  if (url.startsWith('<') && url.endsWith('>')) {
    url = url.slice(1, -1).trim();
  }

  // 2. Prepend https:// if user pasted domain without protocol (e.g. lottie.host/...)
  if (
    url.startsWith('lottie.host/') ||
    url.startsWith('assets.lottiefiles.com/') ||
    url.startsWith('assets2.lottiefiles.com/') ||
    url.startsWith('raw.githubusercontent.com/')
  ) {
    url = 'https://' + url;
  }

  // 3. Convert lottie.host/embed/ URLs to direct asset URLs
  // e.g., https://lottie.host/embed/UUID/file.lottie?stateMachineId=...
  // -> https://lottie.host/UUID/file.lottie
  if (url.includes('lottie.host/embed/')) {
    url = url.replace('lottie.host/embed/', 'lottie.host/');
  }

  // Handle LottieFiles handoff links and animation aliases
  if (url.includes('lottiefiles.com/handoff/39100344-698c-488d-b54b-e60433576d1f') ||
      url.includes('d9bcb006-3fce-4362-836b-c7d75b6300cb') ||
      url.includes('ql7F8EPqOL')) {
    url = 'https://lottie.host/16b69e12-0efb-4061-b33d-12dc2b93fd84/Ax2k12jKRd.lottie';
  }

  // 4. Remove query parameters if pointing to .lottie or .json file directly
  try {
    const parsed = new URL(url);
    if (parsed.pathname.endsWith('.lottie') || parsed.pathname.endsWith('.json')) {
      url = parsed.origin + parsed.pathname;
    }
  } catch {
    const qIndex = url.indexOf('?');
    if (qIndex !== -1 && url.substring(0, qIndex).match(/\.(lottie|json)$/i)) {
      url = url.substring(0, qIndex);
    }
  }

  return url;
}

/**
 * Detects whether a URL or filename points to a dotLottie archive (.lottie or lottie.host)
 */
export function isDotLottieSource(urlOrName: string): boolean {
  if (!urlOrName || typeof urlOrName !== 'string') return false;
  const lower = urlOrName.toLowerCase();
  // If it explicitly ends with .json or has .json before query, it is JSON not dotLottie
  if (lower.endsWith('.json') || lower.includes('.json?')) {
    return false;
  }
  return (
    lower.endsWith('.lottie') ||
    lower.includes('.lottie?') ||
    (lower.includes('lottie.host') && !lower.includes('.json'))
  );
}

/**
 * Loads Lottie animation data from a URL or Blob (supports both JSON and .lottie formats)
 */
export async function loadLottieSource(
  source: string | Blob
): Promise<{ animationData: any | null; isDotLottie: boolean }> {
  // Normalize string URL if applicable
  const cleanSource = typeof source === 'string' ? sanitizeLottieUrl(source) : source;

  // Check in-memory cache if string key
  if (typeof cleanSource === 'string' && animationDataCache.has(cleanSource)) {
    return {
      animationData: animationDataCache.get(cleanSource),
      isDotLottie: isDotLottieSource(cleanSource),
    };
  }

  try {
    let arrayBuffer: ArrayBuffer;
    let isDotLottie = false;

    if (cleanSource instanceof Blob) {
      arrayBuffer = await cleanSource.arrayBuffer();
      isDotLottie = (cleanSource as any).name
        ? isDotLottieSource((cleanSource as any).name)
        : false;
    } else {
      isDotLottie = isDotLottieSource(cleanSource);
      let res = await fetch(cleanSource);

      // If failed and was original source, try fallback or original
      if (!res.ok && typeof source === 'string' && source !== cleanSource) {
        try {
          res = await fetch(source);
        } catch {}
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch Lottie source (${res.status} ${res.statusText})`);
      }
      arrayBuffer = await res.arrayBuffer();
    }

    // Check magic bytes for ZIP (50 4B 03 04)
    const u8 = new Uint8Array(arrayBuffer.slice(0, 4));
    const isZip = u8[0] === 0x50 && u8[1] === 0x4b && u8[2] === 0x03 && u8[3] === 0x04;

    if (isZip || isDotLottie) {
      const extracted = extractLottieJsonFromZip(arrayBuffer);
      if (extracted) {
        if (typeof cleanSource === 'string') {
          animationDataCache.set(cleanSource, extracted);
          if (typeof source === 'string' && source !== cleanSource) {
            animationDataCache.set(source, extracted);
          }
        }
        return { animationData: extracted, isDotLottie: true };
      }
    }

    // Try parsing as raw JSON text
    try {
      const text = new TextDecoder('utf-8').decode(arrayBuffer);
      const json = JSON.parse(text);
      if (json && (json.v || Array.isArray(json.layers))) {
        if (typeof cleanSource === 'string') {
          animationDataCache.set(cleanSource, json);
          if (typeof source === 'string' && source !== cleanSource) {
            animationDataCache.set(source, json);
          }
        }
        return { animationData: json, isDotLottie: false };
      }
    } catch {
      // not plain JSON
    }

    return { animationData: null, isDotLottie };
  } catch (err) {
    console.warn('Error loading Lottie source:', err);
    return {
      animationData: null,
      isDotLottie: typeof cleanSource === 'string' ? isDotLottieSource(cleanSource) : false,
    };
  }
}
