import type { LexiconEntry } from '../../commands/lexicon'

/**
 * Russian command stems. Same `N` convention as English entries.
 */

export const RU_COMMAND_LEXICON_ENTRIES = [
  { kind: 'main_engine_set', id: 'ru.main.set.1', phrase: 'главный двигатель N' },
  { kind: 'main_engine_set', id: 'ru.main.set.2', phrase: 'главный двигатель N%' },
  { kind: 'main_engine_set', id: 'ru.main.set.3', phrase: 'тяга главного N' },
  { kind: 'main_engine_set', id: 'ru.main.set.4', phrase: 'тяга главного N%' },
  { kind: 'main_engine_set', id: 'ru.main.set.5', phrase: 'установить главный двигатель N%' },

  { kind: 'main_engine_stop', id: 'ru.main.stop.1', phrase: 'главный двигатель стоп' },
  { kind: 'main_engine_stop', id: 'ru.main.stop.2', phrase: 'стоп главный двигатель' },
  { kind: 'main_engine_stop', id: 'ru.main.stop.3', phrase: 'отключить главный двигатель' },

  { kind: 'rotate_left_set', id: 'ru.rot.left.1', phrase: 'вращение влево N' },
  { kind: 'rotate_left_set', id: 'ru.rot.left.2', phrase: 'поворот влево N' },
  { kind: 'rotate_left_set', id: 'ru.rot.left.3', phrase: 'влево N%' },

  { kind: 'rotate_right_set', id: 'ru.rot.right.1', phrase: 'вращение вправо N' },
  { kind: 'rotate_right_set', id: 'ru.rot.right.2', phrase: 'поворот вправо N' },
  { kind: 'rotate_right_set', id: 'ru.rot.right.3', phrase: 'вправо N%' },

  { kind: 'rotation_disable', id: 'ru.rot.dis.1', phrase: 'выключить вращение' },
  { kind: 'rotation_disable', id: 'ru.rot.dis.2', phrase: 'отключить вращение' },

  { kind: 'rotation_stop', id: 'ru.rot.stop.1', phrase: 'остановить вращение' },
  { kind: 'rotation_stop', id: 'ru.rot.stop.2', phrase: 'стоп вращение' },
  { kind: 'rotation_stop', id: 'ru.rot.stop.3', phrase: 'вращение стоп' },
  { kind: 'rotation_stop', id: 'ru.rot.stop.4', phrase: 'затормозить вращение' },

  { kind: 'repair_compartment_start', id: 'ru.rep.comp.start.1', phrase: 'ремонт отсека N' },
  { kind: 'repair_compartment_start', id: 'ru.rep.comp.start.2', phrase: 'начать ремонт отсека N' },
  { kind: 'repair_compartment_start', id: 'ru.rep.comp.start.3', phrase: 'начать ремонт секции N' },

  { kind: 'repair_compartment_cancel', id: 'ru.rep.comp.cancel.1', phrase: 'отмена ремонта отсека N' },
  { kind: 'repair_compartment_cancel', id: 'ru.rep.comp.cancel.2', phrase: 'отменить ремонт отсека N' },
  { kind: 'repair_compartment_cancel', id: 'ru.rep.comp.cancel.3', phrase: 'прервать ремонт отсека N' },

  { kind: 'repair_main_engine', id: 'ru.rep.main.1', phrase: 'ремонт главного двигателя' },
  { kind: 'repair_main_engine', id: 'ru.rep.main.2', phrase: 'починить главный двигатель' },

  { kind: 'repair_comms', id: 'ru.rep.comms.1', phrase: 'ремонт связи' },
  { kind: 'repair_comms', id: 'ru.rep.comms.2', phrase: 'починить связь' },
  { kind: 'repair_comms', id: 'ru.rep.comms.3', phrase: 'восстановить канал связи' },
  { kind: 'repair_comms', id: 'ru.rep.comms.4', phrase: 'восстановить радиолинк' },

  { kind: 'repair_main_fuel_line', id: 'ru.rep.mainfuel.1', phrase: 'ремонт магистрали главного двигателя' },
  { kind: 'repair_main_fuel_line', id: 'ru.rep.mainfuel.2', phrase: 'починить магистраль главного двигателя' },
  { kind: 'repair_main_fuel_line', id: 'ru.rep.mainfuel.3', phrase: 'ремонт топливной магистрали главного' },
  { kind: 'repair_main_fuel_line', id: 'ru.rep.mainfuel.4', phrase: 'восстановить линию топлива главного' },

  { kind: 'repair_maneuver_fuel_line', id: 'ru.rep.manfuel.1', phrase: 'ремонт маневровой магистрали' },
  { kind: 'repair_maneuver_fuel_line', id: 'ru.rep.manfuel.2', phrase: 'починить маневровую магистраль' },
  { kind: 'repair_maneuver_fuel_line', id: 'ru.rep.manfuel.3', phrase: 'ремонт линии маневрового топлива' },

  { kind: 'repair_maneuver_fuel', id: 'ru.rep.rcs.1', phrase: 'ремонт маневровых двигателей' },
  { kind: 'repair_maneuver_fuel', id: 'ru.rep.rcs.2', phrase: 'ремонт маневровых' },
  { kind: 'repair_maneuver_fuel', id: 'ru.rep.rcs.3', phrase: 'починить маневровые двигатели' },

  { kind: 'scan_nearest_planet', id: 'ru.scan.1', phrase: 'сканировать планету' },
  { kind: 'scan_nearest_planet', id: 'ru.scan.2', phrase: 'сканировать ближающую планету' },
  { kind: 'scan_nearest_planet', id: 'ru.scan.3', phrase: 'скан ресурсов' },
  { kind: 'scan_nearest_planet', id: 'ru.scan.4', phrase: 'скан планеты' },
] as const satisfies readonly LexiconEntry[]
