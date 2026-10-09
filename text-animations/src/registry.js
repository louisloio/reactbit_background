// Generated imports for every React Bits text animation, merged with adapters.
import ASCIIText from './components/ASCIIText/ASCIIText.jsx';
import BlurText from './components/BlurText/BlurText.jsx';
import CircularText from './components/CircularText/CircularText.jsx';
import CountUp from './components/CountUp/CountUp.jsx';
import CurvedLoop from './components/CurvedLoop/CurvedLoop.jsx';
import DecryptedText from './components/DecryptedText/DecryptedText.jsx';
import DepthText from './components/DepthText/DepthText.jsx';
import EchoText from './components/EchoText/EchoText.jsx';
import FallingText from './components/FallingText/FallingText.jsx';
import FoldText from './components/FoldText/FoldText.jsx';
import FuzzyText from './components/FuzzyText/FuzzyText.jsx';
import GlitchText from './components/GlitchText/GlitchText.jsx';
import GradientText from './components/GradientText/GradientText.jsx';
import MaskedHeading from './components/MaskedHeading/MaskedHeading.jsx';
import ParticleText from './components/ParticleText/ParticleText.jsx';
import RotatingText from './components/RotatingText/RotatingText.jsx';
import ScrambledText from './components/ScrambledText/ScrambledText.jsx';
import ScrollFloat from './components/ScrollFloat/ScrollFloat.jsx';
import ScrollReveal from './components/ScrollReveal/ScrollReveal.jsx';
import ScrollVelocity from './components/ScrollVelocity/ScrollVelocity.jsx';
import ShinyText from './components/ShinyText/ShinyText.jsx';
import Shuffle from './components/Shuffle/Shuffle.jsx';
import SplitFlapText from './components/SplitFlapText/SplitFlapText.jsx';
import SplitText from './components/SplitText/SplitText.jsx';
import StrokeText from './components/StrokeText/StrokeText.jsx';
import TechText from './components/TechText/TechText.jsx';
import TextCursor from './components/TextCursor/TextCursor.jsx';
import TextLoop from './components/TextLoop/TextLoop.jsx';
import TextPressure from './components/TextPressure/TextPressure.jsx';
import TextType from './components/TextType/TextType.jsx';
import TrueFocus from './components/TrueFocus/TrueFocus.jsx';
import VariableProximity from './components/VariableProximity/VariableProximity.jsx';
import WarpText from './components/WarpText/WarpText.jsx';

import GENERATED from './registry.generated.json';
import { ADAPTERS } from './adapters.jsx';

const COMPONENTS = {
  ASCIIText, BlurText, CircularText, CountUp, CurvedLoop, DecryptedText, DepthText, EchoText, FallingText,
  FoldText, FuzzyText, GlitchText, GradientText, MaskedHeading, ParticleText, RotatingText, ScrambledText,
  ScrollFloat, ScrollReveal, ScrollVelocity, ShinyText, Shuffle, SplitFlapText, SplitText, StrokeText, TechText,
  TextCursor, TextLoop, TextPressure, TextType, TrueFocus, VariableProximity, WarpText
};

const NAMES = { ASCIIText: 'ASCII Text', TextCursor: 'Text Cursor' };

export const TEXT_ANIMATIONS = GENERATED.map(entry => {
  const adapter = ADAPTERS[entry.id] ?? {};
  const drop = new Set(adapter.drop ?? []);
  const generated = entry.controls.filter(c => !drop.has(c.key) && !drop.has(`${c.key}:${c.type}`));
  const extra = adapter.controls ?? [];
  const defaults = { ...entry.defaults, ...adapter.defaults };

  // Adapter controls win over generated ones with the same key and type
  const controls = [...extra];
  for (const c of generated) if (!extra.some(e => e.key === c.key && e.type === c.type)) controls.push(c);
  // Any string "text"-like default without a control gets a text box
  for (const key of ['text', 'marqueeText', 'label', 'sentence'])
    if (typeof defaults[key] === 'string' && !controls.some(c => c.key === key))
      controls.unshift({ key, label: 'Text', type: 'text' });

  return {
    id: entry.id,
    name: NAMES[entry.id] ?? entry.name,
    slug: entry.id.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
    Component: COMPONENTS[entry.id],
    defaults,
    // What the component itself would use (for Copy JSX), before page-specific adjustments
    componentDefaults: entry.defaults,
    controls,
    adapter
  };
});
