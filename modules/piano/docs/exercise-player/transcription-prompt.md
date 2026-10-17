Transcribe the attached score photo or PDF into a Daily piano exercise JSON file.

Read every page. First identify pitches, octaves, key signatures, clefs, accidentals (including measure scope), rhythms, hands/voices, tuplets, ties, accents, rests, pedal, time signatures, written tempo changes, pickups and repeats. Printed information is authoritative. Distinguish it from any practice variations I request; do not invent a variation, accent, fingering or tempo. Use velocity 72 for unmarked notes; interpret clear printed dynamics consistently and conservatively. Use quarterBpm 80 only when no tempo or requested tempo exists.

If an essential note, rhythm, clef, repeat route or marking is unreadable or ambiguous, ask ONE focused clarification question about the exact page/measure/voice before producing JSON. Do not guess unreadable content. Omit optional unreadable fingering and describe that omission only if clarification is otherwise needed. If no essential ambiguity remains, output ONE valid JSON object, without Markdown fences or surrounding commentary.

Use schemaVersion 1. IDs are nonempty strings (max 200 characters); unique exercise IDs in a collection, track IDs per exercise, variant IDs per exercise, and IDs within each event/region/measure/reference list. Every variant is a complete arrangement. Only schema fields are permitted outside free-form notation objects. Optional fields may be omitted, never null. ticksPerQuarter defaults to 960, integer 1–15360. All ticks are safe integers. quarterBpm is quarter notes per minute, positive and <=1000. Convert printed beat units before storing: quarterBpm = printed BPM multiplied by the number of quarters in its beat unit (eighth=100 becomes quarterBpm 50; dotted-quarter=60 becomes 90; half=60 becomes 120). Supported meter numerators are 1–32; denominators are 1,2,4,8,16,32.

Timing is musical and independent of practice speed. Notes occupy [startTick,startTick+durationTicks); lengthTicks includes all trailing silence. Rests are gaps. Simultaneous events represent chords/octaves; hands overlap independently. Ties become ONE sustained event with optional notation metadata preserving written tie segments. Sustain pedal is separate per-track down/up events; pedal release extends sounding time until up, or variant end. Copy a global piano pedal marking to every affected track, not just the staff where it is printed. At a note release exactly coincident with pedal change, the new pedal state applies. No duplicate pedal track/tick positions. Pedal may occur at lengthTicks; notes may end there but cannot start there.

Use 960 ticks per quarter normally: triplets 320, sixteenths 240, explicit triplet swing pairs 640/320. Choose another integer ticksPerQuarter when needed for exact tuplets. Store actual onset and duration; never ask the app to infer swing or apply it again. Include every sounded note in the selected variant. Expand repeats (including endings, D.C., D.S., coda and repeat-dependent tempo changes) into one linear playable timeline; preserve printed symbols only in notation metadata. Do not create hidden repeat instructions.

Tempo and time-signature maps must start at tick 0 and be strictly increasing, with ticks < lengthTicks. Time-signature changes occur on measure boundaries. Measures are ordered, adjacent, nonoverlapping and cover [0,lengthTicks); each has a unique ID and display label. A full measure has numerator * ticksPerQuarter * 4 / denominator ticks. Set incomplete:true explicitly for pickups, short final bars, or other incomplete measures. Never pad a pickup to a full measure. Give repeated printed measures distinct IDs and sensible display labels.

Subdivision regions are ordered, nonoverlapping [startTick,endTick), with positive integer stepTicks and a nonempty repeating labels array. For triplets, labels may be ["1","trip","LET"] per quarter or the complete counted phrase; labels are guidance only. Accents come ONLY from each note's boolean accent field, never from a label such as LET. Compound meter counting is separate from the quarter-note tempo unit: numerators greater than 3 and divisible by 3 group denominator units in threes. Thus 6/8, 9/8, 12/8 count dotted-quarter beats, and 6/4 counts dotted-half beats. Other meters count denominator beats.

Pitch is integer MIDI 0–127 (C4=60). Velocity is integer 1–127; imported velocity remains meaningful with zero practice accent strength. Fingering is optional string (e.g. "1", "3-1"); voice and pitchSpelling are optional strings. notation is an optional JSON object for source-specific details, ties, written repeats, clefs, articulations and future positional score mapping. scoreReferences optionally identify an attachmentId, measureId and 1-based PDF page. Attachments live outside the exercise JSON; a missing attachment does not invalidate playback. Reference track IDs, variant IDs and measure IDs must exist.

Practice preferences are NOT exercise content: speed, hand volume/mute, accent strength, metronome, count-in, loop range, gap and acceleration must not appear in exercise JSON. Only create alternate variants if explicitly requested; preserve printed musical facts in the written variant. Each alternate variant contains its own complete maps, measures and notes.

Before output, check every pitch/octave, accidental, rhythm, hand assignment and tie. Verify measure arithmetic, explicit incomplete flags, tuplets, note bounds, trailing silence, ordered maps, unique IDs and all references. Ensure every variant is complete and expands the written repeats. Check JSON syntax, integer ticks, booleans and required fields against this exact finalized schema:

{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://daily.local/piano/exercise-v1.schema.json",
  "title": "Daily piano exercise v1",
  "type": "object",
  "properties": {
    "schemaVersion": {
      "const": 1
    },
    "id": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    },
    "title": {
      "type": "string",
      "minLength": 1
    },
    "instructions": {
      "type": "string",
      "minLength": 1
    },
    "ticksPerQuarter": {
      "type": "integer",
      "minimum": 1,
      "maximum": 15360,
      "default": 960
    },
    "defaultVariantId": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200
    },
    "tracks": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/Track"
      },
      "minItems": 1
    },
    "variants": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/Variant"
      },
      "minItems": 1
    }
  },
  "required": [
    "schemaVersion",
    "id",
    "title",
    "defaultVariantId",
    "tracks",
    "variants"
  ],
  "additionalProperties": false,
  "$defs": {
    "Track": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "name": {
          "type": "string",
          "minLength": 1
        }
      },
      "required": [
        "id",
        "name"
      ],
      "additionalProperties": false
    },
    "Tempo": {
      "type": "object",
      "properties": {
        "tick": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "quarterBpm": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 1000
        }
      },
      "required": [
        "tick",
        "quarterBpm"
      ],
      "additionalProperties": false
    },
    "Meter": {
      "type": "object",
      "properties": {
        "tick": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "numerator": {
          "type": "integer",
          "minimum": 1,
          "maximum": 32
        },
        "denominator": {
          "enum": [
            1,
            2,
            4,
            8,
            16,
            32
          ]
        }
      },
      "required": [
        "tick",
        "numerator",
        "denominator"
      ],
      "additionalProperties": false
    },
    "Measure": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "label": {
          "type": "string",
          "minLength": 1
        },
        "startTick": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "endTick": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "incomplete": {
          "type": "boolean"
        }
      },
      "required": [
        "id",
        "label",
        "startTick",
        "endTick"
      ],
      "additionalProperties": false
    },
    "Subdivision": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "startTick": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "endTick": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "stepTicks": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "labels": {
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          },
          "minItems": 1
        }
      },
      "required": [
        "id",
        "startTick",
        "endTick",
        "stepTicks",
        "labels"
      ],
      "additionalProperties": false
    },
    "Note": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "trackId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "pitch": {
          "type": "integer",
          "minimum": 0,
          "maximum": 127
        },
        "startTick": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "durationTicks": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "velocity": {
          "type": "integer",
          "minimum": 1,
          "maximum": 127
        },
        "accent": {
          "type": "boolean"
        },
        "fingering": {
          "type": "string",
          "minLength": 1
        },
        "voice": {
          "type": "string",
          "minLength": 1
        },
        "pitchSpelling": {
          "type": "string",
          "minLength": 1
        },
        "notation": {
          "type": "object"
        }
      },
      "required": [
        "id",
        "trackId",
        "pitch",
        "startTick",
        "durationTicks",
        "velocity",
        "accent"
      ],
      "additionalProperties": false
    },
    "Pedal": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "trackId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "tick": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "down": {
          "type": "boolean"
        }
      },
      "required": [
        "id",
        "trackId",
        "tick",
        "down"
      ],
      "additionalProperties": false
    },
    "ScoreReference": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "attachmentId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "measureId": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "page": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "notation": {
          "type": "object"
        }
      },
      "required": [
        "id",
        "attachmentId"
      ],
      "additionalProperties": false
    },
    "Variant": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1,
          "maxLength": 200
        },
        "name": {
          "type": "string",
          "minLength": 1
        },
        "lengthTicks": {
          "type": "integer",
          "minimum": 1,
          "maximum": 9007199254740991
        },
        "tempoMap": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/Tempo"
          },
          "minItems": 1
        },
        "timeSignatureMap": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/Meter"
          },
          "minItems": 1
        },
        "measures": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/Measure"
          },
          "minItems": 1
        },
        "subdivisionRegions": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/Subdivision"
          },
          "minItems": 0
        },
        "notes": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/Note"
          },
          "minItems": 0
        },
        "pedalEvents": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/Pedal"
          },
          "minItems": 0
        },
        "scoreReferences": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/ScoreReference"
          },
          "minItems": 0
        },
        "notation": {
          "type": "object"
        }
      },
      "required": [
        "id",
        "name",
        "lengthTicks",
        "tempoMap",
        "timeSignatureMap",
        "measures",
        "notes"
      ],
      "additionalProperties": false
    }
  }
}
