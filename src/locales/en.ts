export default {
  app: {
    devContact: 'Developer contact',
  },
  main: {
    title: 'Space & Commands',
    subtitle: 'Choose language, ship, and difficulty, then start the run.',
    panelLanguage: 'Language',
    panelDifficulty: 'Difficulty',
    panelLevel: 'Level',
    panelShip: 'Ship',
    ariaCommandLanguage: 'Command language',
    ariaDifficulty: 'Difficulty',
    ariaLevel: 'Level',
    ariaShipHull: 'Ship hull',
    ariaShipPreview: 'Ship preview',
    ariaShipPreviewCanvas: 'Selected ship preview',
    shipTodoLabel: 'TODO',
    shipTodoHint: 'More hulls',
    startGame: 'Start game',
    levelBadgeAria: 'Completed on {difficulty} difficulty',
    language: {
      en: { label: 'English', hint: 'Commands typed in English.' },
      ru: { label: 'Русский', hint: 'Команды на русском языке.' },
    },
    difficulty: {
      cadet: { label: 'Cadet', hint: 'Forgiving typos, no hazards.' },
      officer: { label: 'Officer', hint: 'Balanced challenge.' },
      captain: { label: 'Captain', hint: 'Exact commands, sharper pressure.' },
    },
    level: {
      sandbox: {
        label: 'Sandbox',
        hint: 'Home world + procedural rings; no objectives.',
      },
      'scan-tutorial': {
        label: 'Scan drill',
        hint: 'Three worlds thousands of units apart; scan any two.',
      },
      'visit-tutorial': {
        label: 'Docking drill',
        hint: 'Two distant worlds; dock on both with engines off.',
      },
      'mixed-tutorial': {
        label: 'Recon & dock',
        hint: 'Seven spread-out worlds; scan four and visit two.',
      },
    },
    ship: {
      'orca-hauler': {
        label: 'Orca hauler',
        hint: 'Wide cargo spine; heavier, slower feel.',
      },
    },
    commandsBtn: 'Commands',
    commandsTitle: 'Command phrases',
    commandsNote:
      'Same phrases as the game lexicon. Spaces and letter case are ignored.',
    close: 'Close',
    lexSearchLabel: 'Search',
    lexSearchPlaceholder: 'Filter by phrase or type…',
    lexSearchAria: 'Filter command list',
    lexSearchEmpty: 'No matching commands',
    infoBtn: 'Info',
    infoTitle: 'About this game',
    infoIntro:
      'Space & Commands is a top-down space simulation. You pilot the ship with text commands (typo tolerance depends on difficulty) and optional voice input. Pick language, hull, and difficulty in the lobby, then press Start game.',
    infoSecControls: 'Controls',
    infoControlsManual:
      'Manual mode: type a phrase in the command field and press Enter. Focus the game area first so the keyboard works.',
    infoControlsVoice:
      'Voice mode: hold the physical K key, speak the command, release K to send. Voice is disabled while comms are broken (repair with a command).',
    infoControlsLexicon:
      'The Commands button (lobby and in flight) lists every valid phrase for the selected language. Spaces and letter case are ignored; N in a phrase means a number (throttle %, compartment, etc.).',
    infoSecDifficulty: 'Difficulty',
    infoDiffCadet:
      'Cadet — more typo forgiveness on longer words; random equipment failures are disabled.',
    infoDiffOfficer:
      'Officer — moderate typo tolerance; random failures can break fuel lines, engines, compartments, or comms.',
    infoDiffCaptain:
      'Captain — commands must match exactly; failures occur more often than on Officer.',
    infoSecFuel: 'Fuel',
    infoFuelHud:
      'Fuel is shown in the HUD as tons with a progress bar. Each hull has its own tank capacity.',
    infoFuelBurn:
      'The main engine burns fuel every tick while thrusting; maneuver thrusters burn much less (about 5% of the main rate at the same power setting). With an empty tank, both main and RCS stop working.',
    infoSecPlanets: 'Planets, landing, and mining',
    infoPlanetsLanding:
      'Touching a planet at the wrong angle or too fast can destroy the ship. A controlled landing with engines off locks the hull to the surface (no bounce). Any thrust or RCS torque releases the lock.',
    infoPlanetsScan:
      'Resource scan: use a scan command while within range of a planet (roughly 300 units from the surface). Icons on scanned worlds show fuel and/or metal deposits.',
    infoPlanetsMine:
      'Mining: after a successful scan, land on that planet with all engines off. Fuel and metal are extracted each tick only if the scan reported that deposit type. Extraction rates depend on the hull.',
    infoSecHazards: 'Damage and repairs',
    infoHazards:
      'On Officer and Captain, random events may damage compartments, fuel lines, the main engine, maneuver thrusters, or comms. Use the matching repair commands from the lexicon. Broken fuel lines stop thrust even if the tank is full.',
    infoSecWorld: 'World',
    infoWorld:
      'New planetary rings appear as you travel farther from the origin. Distance and speed are shown in the HUD.',
  },
  game: {
    metaLanguage: 'Language',
    metaDifficulty: 'Difficulty',
    metaLevel: 'Level',
    hudTasks: 'Objectives',
    levelComplete: 'Level complete',
    task: {
      scan_planets: 'Scan planets',
      visit_planets: 'Visit planets',
    },
    langName: { en: 'English', ru: 'Русский' },
    difficultyName: {
      cadet: 'Cadet',
      officer: 'Officer',
      captain: 'Captain',
    },
    backToMenu: 'Back to menu',
    canvasAria: 'Space view',
    hudSpeed: 'Speed',
    hudDist: 'Distance',
    hudMain: 'Main',
    hudStop: 'STOP',
    hudRot: 'RCS',
    hudFuel: 'Fuel',
    hudFuelAria: 'Fuel reserve in metric tons',
    hudBodies: 'Bodies',
    faultMainLine: 'Main fuel line',
    faultManeuver: 'Maneuver line',
    faultMainEng: 'Main eng dmg',
    faultRcs: 'Maneuver eng dmg',
    faultComms: 'Comms down',
    commandLabel: 'Command',
    commandAria: 'Command input',
    modeManual: 'Manual',
    modeVoice: 'Voice',
    inputModeAria: 'Command input mode',
    voiceUnsupportedHint: 'Speech recognition is not available in this browser',
    voiceBlockedCommsHint:
      'Voice unavailable until comms are repaired (e.g. “repair comms”).',
    hintVoice:
      'Hold the K key (physical key, any keyboard layout). Speak into the mic; release K to send. N = number in the phrase.',
    hintManual:
      'Type in the field below (keyboard works when the game surface is focused). Enter to send. N = number (percent or compartment/module).',
    restart: 'Restart',
    restartAria: 'Restart current run',
    commandsBtn: 'Commands',
    commandsTitle: 'Command phrases',
    commandsNote:
      'Same phrases as the game lexicon. Spaces and letter case are ignored.',
    lexSearchLabel: 'Search',
    lexSearchPlaceholder: 'Filter by phrase or type…',
    lexSearchAria: 'Filter command list',
    lexSearchEmpty: 'No matching commands',
    close: 'Close',
    gameOverTitle: 'Hull breach: planetary impact',
    gameOverHint: 'Simulation halted. Return to the menu.',
    feedback: {
      ok: 'Command acknowledged.',
      empty: 'Empty input.',
      unknown: 'Unknown command.',
      ambiguous: 'Ambiguous command.',
      tooManyTypos: 'Too many typos.',
      invalidNumber: 'Number required.',
      outOfRange: 'Out of range.',
      generic: 'Error.',
    },
    speechMicBlocked: 'Microphone blocked (allow access).',
    speechError: 'Speech recognition error.',
    speechStartFailed: 'Could not start speech recognition.',
  },
}
