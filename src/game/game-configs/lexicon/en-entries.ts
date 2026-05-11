import type { LexiconEntry } from '../../commands/lexicon'

/**
 * English command stems. Parser treats `N` as a numeric slot (percent, compartment 1–5).
 */

export const EN_COMMAND_LEXICON_ENTRIES = [
  { kind: 'main_engine_set', id: 'en.main.set.1', phrase: 'main engine N' },
  { kind: 'main_engine_set', id: 'en.main.set.2', phrase: 'main engine N%' },
  { kind: 'main_engine_set', id: 'en.main.set.3', phrase: 'main thrust N' },
  { kind: 'main_engine_set', id: 'en.main.set.4', phrase: 'main thrust N%' },
  { kind: 'main_engine_set', id: 'en.main.set.5', phrase: 'set main engine N percent' },

  { kind: 'main_engine_stop', id: 'en.main.stop.1', phrase: 'main engine stop' },
  { kind: 'main_engine_stop', id: 'en.main.stop.2', phrase: 'main engine off' },
  { kind: 'main_engine_stop', id: 'en.main.stop.3', phrase: 'full stop thrust' },
  { kind: 'main_engine_stop', id: 'en.main.stop.4', phrase: 'cut main engine' },

  { kind: 'rotate_left_set', id: 'en.rot.left.1', phrase: 'rotate left N' },
  { kind: 'rotate_left_set', id: 'en.rot.left.2', phrase: 'rotation left N' },
  { kind: 'rotate_left_set', id: 'en.rot.left.3', phrase: 'yaw left N' },
  { kind: 'rotate_left_set', id: 'en.rot.left.4', phrase: 'turn left N percent' },

  { kind: 'rotate_right_set', id: 'en.rot.right.1', phrase: 'rotate right N' },
  { kind: 'rotate_right_set', id: 'en.rot.right.2', phrase: 'rotation right N' },
  { kind: 'rotate_right_set', id: 'en.rot.right.3', phrase: 'yaw right N' },
  { kind: 'rotate_right_set', id: 'en.rot.right.4', phrase: 'turn right N percent' },

  { kind: 'rotation_disable', id: 'en.rot.dis.1', phrase: 'disable rotation' },
  { kind: 'rotation_disable', id: 'en.rot.dis.2', phrase: 'rotation disable' },
  { kind: 'rotation_disable', id: 'en.rot.dis.3', phrase: 'attitude hold off' },

  { kind: 'rotation_stop', id: 'en.rot.stop.1', phrase: 'stop rotation' },
  { kind: 'rotation_stop', id: 'en.rot.stop.2', phrase: 'halt rotation' },
  { kind: 'rotation_stop', id: 'en.rot.stop.3', phrase: 'zero rotation rate' },

  { kind: 'repair_compartment_start', id: 'en.rep.comp.start.1', phrase: 'repair compartment N' },
  { kind: 'repair_compartment_start', id: 'en.rep.comp.start.2', phrase: 'repair section N' },
  { kind: 'repair_compartment_start', id: 'en.rep.comp.start.3', phrase: 'start repair compartment N' },

  { kind: 'repair_compartment_cancel', id: 'en.rep.comp.cancel.1', phrase: 'cancel repair compartment N' },
  { kind: 'repair_compartment_cancel', id: 'en.rep.comp.cancel.2', phrase: 'abort repair compartment N' },
  { kind: 'repair_compartment_cancel', id: 'en.rep.comp.cancel.3', phrase: 'stop repair compartment N' },

  { kind: 'repair_main_engine', id: 'en.rep.main.1', phrase: 'repair main engine' },
  { kind: 'repair_main_engine', id: 'en.rep.main.2', phrase: 'fix main engine' },

  { kind: 'repair_comms', id: 'en.rep.comms.1', phrase: 'repair comms' },
  { kind: 'repair_comms', id: 'en.rep.comms.2', phrase: 'repair communications' },
  { kind: 'repair_comms', id: 'en.rep.comms.3', phrase: 'restore datalink' },
  { kind: 'repair_comms', id: 'en.rep.comms.4', phrase: 'fix radio link' },

  { kind: 'repair_main_fuel_line', id: 'en.rep.mainfuel.1', phrase: 'repair main fuel line' },
  { kind: 'repair_main_fuel_line', id: 'en.rep.mainfuel.2', phrase: 'fix main fuel line' },
  { kind: 'repair_main_fuel_line', id: 'en.rep.mainfuel.3', phrase: 'repair main propellant line' },
  { kind: 'repair_main_fuel_line', id: 'en.rep.mainfuel.4', phrase: 'patch main engine fuel line' },

  { kind: 'repair_maneuver_fuel_line', id: 'en.rep.manfuel.1', phrase: 'repair maneuver fuel line' },
  { kind: 'repair_maneuver_fuel_line', id: 'en.rep.manfuel.2', phrase: 'fix maneuver fuel line' },
  { kind: 'repair_maneuver_fuel_line', id: 'en.rep.manfuel.3', phrase: 'repair rcs fuel line' },

  { kind: 'repair_maneuver_fuel', id: 'en.rep.rcs.1', phrase: 'repair maneuver thrusters' },
  { kind: 'repair_maneuver_fuel', id: 'en.rep.rcs.2', phrase: 'repair rcs' },
  { kind: 'repair_maneuver_fuel', id: 'en.rep.rcs.3', phrase: 'repair attitude thrusters' },

  { kind: 'scan_nearest_planet_resources', id: 'en.scan.1', phrase: 'scan nearest planet' },
  { kind: 'scan_nearest_planet_resources', id: 'en.scan.2', phrase: 'scan planet resources' },
  { kind: 'scan_nearest_planet_resources', id: 'en.scan.3', phrase: 'resource scan planet' },
] as const satisfies readonly LexiconEntry[]
