import { GameDefinition } from '../types';

export const GAME_DEFINITIONS: Record<string, GameDefinition> = {
  schulte: {
    id: 'schulte',
    title: 'Schulte Grid',
    icon: '🔢',
    category: ['attention', 'speed'],
    difficulty: 'Medium',
    skillTag: 'Peripheral Vision & Search Velocity',
    shortDesc: 'Find scrambled numbers in sequential ascending order without shifting gaze from the center.',
    rules: [
      'Fixate your eyes gently on the center of the grid to engage peripheral vision.',
      'Tap each number in ascending sequence from 1 to the max.',
      'Mistakes trigger a subtle tactile cue and add time to your benchmark.',
      'Target under 30 seconds on 5x5 for Gold proficiency.'
    ],
    cognitiveBenefit: 'Expands effective visual field diameter and strengthens visual search saccades used in deep reading.'
  },
  stroop: {
    id: 'stroop',
    title: 'Stroop Color Interference',
    icon: '🎨',
    category: ['attention'],
    difficulty: 'Hard',
    skillTag: 'Executive Inhibitory Control',
    shortDesc: 'Overcome cognitive conflict: select the ink color instead of reading the written semantic word.',
    rules: [
      'A color word will flash on screen printed in a conflicting ink shade.',
      'Tap the button corresponding to the physical INK COLOR, not what the word reads.',
      'Suppress the automated impulse to read the textual word.',
      '20 rounds tested for speed and accuracy.'
    ],
    cognitiveBenefit: 'Engages the dorsolateral prefrontal cortex (DLPFC) to inhibit automated habitual reflexes.'
  },
  arrow: {
    id: 'arrow',
    title: 'Arrow Inversion',
    icon: '⇄',
    category: ['attention'],
    difficulty: 'Medium',
    skillTag: 'Cognitive Flexibility',
    shortDesc: 'Rapidly invert spatial reflexes: choose the OPPOSITE direction of the displayed arrow.',
    rules: [
      'An arrow will flash pointing UP, DOWN, LEFT, or RIGHT.',
      'Quickly tap the exact OPPOSITE direction on screen or keyboard arrows.',
      'Example: If arrow points UP, immediately select DOWN.',
      '20 rapid rounds assessing cognitive flexibility.'
    ],
    cognitiveBenefit: 'Trains rapid set-shifting and motor response inhibition under temporal pressure.'
  },
  reaction: {
    id: 'reaction',
    title: 'Reaction Velocity',
    icon: '⚡',
    category: ['speed'],
    difficulty: 'Easy',
    skillTag: 'Neuromuscular Speed',
    shortDesc: 'Wait for the gentle terracotta indicator to shift to soft leaf green and tap instantly.',
    rules: [
      'Tap the arena to prime the trial, then observe calmly.',
      'When the surface transitions to vibrant leaf green, tap as fast as possible.',
      'Tapping prematurely is recorded as a false start.',
      '5 trials are averaged and benchmarked against human normative percentiles.'
    ],
    cognitiveBenefit: 'Measures optic nerve conduction velocity and motor unit firing threshold.'
  },
  simon: {
    id: 'simon',
    title: 'Harmonic Sequence',
    icon: '🍃',
    category: ['memory'],
    difficulty: 'Medium',
    skillTag: 'Visuospatial Working Memory',
    shortDesc: 'Observe the growing sequence of calming nature tones and tiles, then reproduce it faithfully.',
    rules: [
      'Watch and listen as ceramic tiles illuminate with gentle harmonic frequencies.',
      'Repeat the exact sequence in identical order.',
      'The sequence lengthens by one note upon every successful completion.',
      'Aim for Level 9+ to achieve Gold benchmark.'
    ],
    cognitiveBenefit: 'Exercises the phonological loop and visuospatial sketchpad in working memory.'
  },
  number: {
    id: 'number',
    title: 'Digit Span Memory',
    icon: '🧠',
    category: ['memory'],
    difficulty: 'Hard',
    skillTag: 'Short-Term Digit Span',
    shortDesc: 'Memorize an expanding string of numerals displayed for a brief moment, then recall it.',
    rules: [
      'A sequence of digits will appear with a steady visual countdown timer.',
      'Once obscured, type the exact number from memory.',
      'Each correct entry advances you to a longer digit sequence.',
      'Standard human working memory capacity is 7 ± 2 items.'
    ],
    cognitiveBenefit: 'Enhances working memory retention buffer and internal verbal rehearsal efficiency.'
  },
  odd: {
    id: 'odd',
    title: 'Visual Discrimination',
    icon: '🔍',
    category: ['attention', 'speed'],
    difficulty: 'Medium',
    skillTag: 'Visual Search & Anomaly Detection',
    shortDesc: 'Detect the single subtle glyph anomaly among an expanding field of decoys across 10 rounds.',
    rules: [
      'Scan the grid of balanced symbols to identify the lone divergent glyph.',
      'Grid dimension increases from 3x3 to 6x6 as rounds progress.',
      'Faster identification awards higher cognitive focus points.',
      '10 total rounds testing visual pattern segmentation.'
    ],
    cognitiveBenefit: 'Exercises feature-integration attention and spatial discrimination within visual cortex.'
  },
  cpt: {
    id: 'cpt',
    title: 'Vigilance Index (CPT)',
    icon: '🎯',
    category: ['attention'],
    difficulty: 'Hard',
    skillTag: 'Sustained Vigilance (d-prime)',
    shortDesc: 'Continuous Performance Task: react exclusively when the letter "X" appears, ignoring distractors.',
    rules: [
      'Letters flash rapidly across a 60-second continuous session.',
      'Tap HIT TARGET (or SPACEBAR) ONLY when the letter "X" appears.',
      'Ignore all non-target letters; withholding response is as crucial as hitting.',
      'Calculates signal detection theory sensitivity (d-prime) and attentional drift.'
    ],
    cognitiveBenefit: 'Gold standard clinical paradigm for assessing sustained attention and resistance to mind-wandering.'
  }
};
