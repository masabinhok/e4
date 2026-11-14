# Sounds

| File                | Source                                                |
| ------------------- | ----------------------------------------------------- |
| `move.mp3`          | Kenney Impact Sounds, `impactGeneric_light_000`       |
| `move-opponent.mp3` | Kenney Impact Sounds, `impactGeneric_light_002`       |
| `capture.mp3`       | Kenney Impact Sounds, `impactWood_light_000`          |
| `castle.mp3`        | `impactGeneric_light_000` then `_002` 120 ms later    |
| `check.mp3`         | `impactGeneric_light_004` over `impactWood_light_002` |
| everything else     | synthesised by `web/scripts/render-sounds.mjs`        |

Kenney's [Impact Sounds](https://kenney.nl/assets/impact-sounds) are CC0 (public domain). The clips are trimmed, faded and loudness-matched with ffmpeg (`loudnorm`, mono, 96 kbps).
