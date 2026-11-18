# ☕ Dialed

**Your coffee dial-in journal for iPhone.** Track every bean on your shelf, log each
extraction, and let the dial-in coach tell you exactly what to change next: grind,
water temperature, dose or ratio. Over time it learns the sweet spot for every coffee.

Built with **React Native + Expo** (SDK 58), so it runs as a real native iPhone app
without needing a Mac.

## What it does

| | |
|---|---|
| **Beans** | Each bag gets a card in its roast colour, with freshness (*Day 12 · Peak*) and how much is left in the bag. |
| **Log an extraction** | Espresso, pour-over, AeroPress and immersion. Big thumb-friendly dials for grind, temperature, dose and yield; a built-in shot timer that buzzes when you enter the target window. |
| **Taste** | Cup score (1–5 beans), balance from sour to bitter, strength, and the flavours you tasted. |
| **Dial-in coach** | Reads how it tasted against how it was brewed and suggests **one** change for the next brew, e.g. *"Sour and quick: grind one step finer, 13 → 12"*. One tap applies it. |
| **Your recipe** | The best brew for each bean and method, ready to repeat. |
| **Dial-in map** | Every brew of a bean plotted by grind × temperature and shaded by cup score, so you can *see* the sweet spot. |
| **Private** | Everything is stored on the phone. No account, no sign-in. |

### How the coach thinks

The coach follows the way baristas dial in: change one variable at a time, and let
time tell you whether grind is the problem.

| Taste | Brew time | Suggestion |
|---|---|---|
| Sour | Too fast | Grind finer |
| Sour | On target | Raise the temperature (or a longer shot at max temp) |
| Bitter | Too slow | Grind coarser |
| Bitter | On target | Lower the temperature (or a shorter shot at min temp) |
| Balanced, weak | – | Tighter ratio / more coffee |
| Balanced, strong | – | Longer ratio / more water |
| Balanced, loved (4–5) | – | **Dialed in.** Repeat it |

It speaks in *your* grinder's numbers: set the grind step and whether lower means
finer in **Settings**.

## Run it on your iPhone

1. Install **Expo Go** from the App Store on your iPhone (free).
2. On any computer (Windows, Mac or Linux) with [Node.js](https://nodejs.org) installed:

   ```bash
   npm install
   npx expo start --tunnel
   ```

3. Scan the QR code with your iPhone's Camera app. Dialed opens in Expo Go.
4. On first launch, tap **Explore with sample beans** to try it with realistic data.

No computer? The app can be published to Expo's servers with `eas update` and opened
straight from Expo Go on the phone. That is the next stage.

### Preview in a browser

```bash
npx expo start --web
```

## Development

```bash
npm test           # dial-in coach + recipe logic unit tests
npm run typecheck  # TypeScript
npm run lint       # ESLint (Expo + React Compiler rules)
```

### Project structure

```
src/
  app/                 Screens (Expo Router: every file is a route)
    (tabs)/            Today · Beans · Journal
    bean/[id].tsx      Bean detail: recipe, dial-in map, history
    bean/edit.tsx      Add / edit a bean
    brew/new.tsx       Log an extraction (+ coach verdict after saving)
    brew/[id].tsx      Extraction detail
    settings.tsx       Grinder setup, sample data, erase
  components/          UI building blocks (stepper, shot timer, dial-in map…)
  data/                Types, persistent store (zustand + AsyncStorage), sample data
  lib/                 Dial-in coach, smart starting recipes, freshness, formatting
  theme/               Colour palettes (light + dark), type, spacing
```

## Roadmap

- [x] **Stage 1:** Beans, extractions, dial-in coach, recipes, dial-in map, light & dark mode
- [ ] **Stage 2:** Run from the cloud on iPhone (EAS Update), app icon & splash
- [ ] **Stage 3:** Equipment: several grinders and brewers, °F support
- [ ] **Stage 4:** Insights: which origins, processes and roasters you love most
- [ ] **Stage 5:** Scan a bag label with the camera to add a bean; bean photos
- [ ] **Stage 6:** Backup & sync across devices; CSV export
- [ ] **Stage 7:** Home-screen widget, Live Activity shot timer, Siri "log a shot"
- [ ] **Stage 8:** TestFlight & App Store
