


export const KEY_SIGNATURES = [
  
  { key: 'C',  sharps: [],                                         flats: [],                                         relativeMinor: 'A',  img: 'assets/key-signatures/C-major.png'       },
  
  { key: 'G',  sharps: ['F#'],                                     flats: [],                                         relativeMinor: 'E',  img: 'assets/key-signatures/G-major.png'       },
  { key: 'D',  sharps: ['F#','C#'],                                flats: [],                                         relativeMinor: 'B',  img: 'assets/key-signatures/D-major.png'       },
  { key: 'A',  sharps: ['F#','C#','G#'],                           flats: [],                                         relativeMinor: 'F#', img: 'assets/key-signatures/A-major.png'       },
  { key: 'E',  sharps: ['F#','C#','G#','D#'],                      flats: [],                                         relativeMinor: 'C#', img: 'assets/key-signatures/E-major.png'       },
  { key: 'B',  sharps: ['F#','C#','G#','D#','A#'],                 flats: [],                                         relativeMinor: 'G#', img: 'assets/key-signatures/B-major.png'       },
  { key: 'F#', sharps: ['F#','C#','G#','D#','A#','E#'],            flats: [],                                         relativeMinor: 'D#', img: 'assets/key-signatures/F-sharp-major.png' },
  { key: 'C#', sharps: ['F#','C#','G#','D#','A#','E#','B#'],       flats: [],                                         relativeMinor: 'A#', img: 'assets/key-signatures/C-sharp-major.png' },
  
  { key: 'F',  sharps: [],                                         flats: ['Bb'],                                     relativeMinor: 'D',  img: 'assets/key-signatures/F-major.png'       },
  { key: 'Bb', sharps: [],                                         flats: ['Bb','Eb'],                                relativeMinor: 'G',  img: 'assets/key-signatures/B-flat-major.png'  },
  { key: 'Eb', sharps: [],                                         flats: ['Bb','Eb','Ab'],                           relativeMinor: 'C',  img: 'assets/key-signatures/E-flat-major.png'  },
  { key: 'Ab', sharps: [],                                         flats: ['Bb','Eb','Ab','Db'],                      relativeMinor: 'F',  img: 'assets/key-signatures/A-flat-major.png'  },
  { key: 'Db', sharps: [],                                         flats: ['Bb','Eb','Ab','Db','Gb'],                 relativeMinor: 'Bb', img: 'assets/key-signatures/D-flat-major.png'  },
  { key: 'Gb', sharps: [],                                         flats: ['Bb','Eb','Ab','Db','Gb','Cb'],            relativeMinor: 'Eb', img: 'assets/key-signatures/G-flat-major.png'  },
  { key: 'Cb', sharps: [],                                         flats: ['Bb','Eb','Ab','Db','Gb','Cb','Fb'],       relativeMinor: 'Ab', img: 'assets/key-signatures/C-flat-major.png'  },
]


const BY_KEY = new Map(KEY_SIGNATURES.map(k => [k.key, k]))

export function getKeySignature(key) {
  return BY_KEY.get(key) || null
}


export function describeKeySignature(keyData) {
  if (keyData.sharps.length > 0) {
    return `${keyData.sharps.length} sharp${keyData.sharps.length > 1 ? 's' : ''} (${keyData.sharps.join(', ')})`
  }
  if (keyData.flats.length > 0) {
    return `${keyData.flats.length} flat${keyData.flats.length > 1 ? 's' : ''} (${keyData.flats.join(', ')})`
  }
  return 'No sharps or flats'
}


export function randomKeySignatureQuestion() {
  const ks = KEY_SIGNATURES[Math.floor(Math.random() * KEY_SIGNATURES.length)]
  return { ...ks, description: describeKeySignature(ks) }
}
