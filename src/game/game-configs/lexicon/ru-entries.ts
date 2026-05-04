import type { LexiconEntry } from '../../commands/lexicon'

/**
 * Russian command stems. Same `N` convention as English entries.
 */

export const RU_COMMAND_LEXICON_ENTRIES = [
  { kind: 'main_engine_set', id: 'ru.main.set.1', phrase: 'главный двигатель N' },
  { kind: 'main_engine_set', id: 'ru.main.set.2', phrase: 'главный двигатель N%' },
  { kind: 'main_engine_set', id: 'ru.main.set.3', phrase: 'тяга главного N' },
  { kind: 'main_engine_set', id: 'ru.main.set.4', phrase: 'тяга главного N%' },
  { kind: 'main_engine_set', id: 'ru.main.set.5', phrase: 'установить главный двигатель N процентов' },

  { kind: 'main_engine_stop', id: 'ru.main.stop.1', phrase: 'главный двигатель стоп' },
  { kind: 'main_engine_stop', id: 'ru.main.stop.2', phrase: 'стоп главный двигатель' },
  { kind: 'main_engine_stop', id: 'ru.main.stop.3', phrase: 'отключить главный двигатель' },

  { kind: 'rotate_left_set', id: 'ru.rot.left.1', phrase: 'вращение влево N' },
  { kind: 'rotate_left_set', id: 'ru.rot.left.2', phrase: 'поворот влево N' },
  { kind: 'rotate_left_set', id: 'ru.rot.left.3', phrase: 'влево N процентов' },

  { kind: 'rotate_right_set', id: 'ru.rot.right.1', phrase: 'вращение вправо N' },
  { kind: 'rotate_right_set', id: 'ru.rot.right.2', phrase: 'поворот вправо N' },
  { kind: 'rotate_right_set', id: 'ru.rot.right.3', phrase: 'вправо N процентов' },

  { kind: 'rotation_disable', id: 'ru.rot.dis.1', phrase: 'выключить вращение' },
  { kind: 'rotation_disable', id: 'ru.rot.dis.2', phrase: 'отключить вращение' },

  { kind: 'rotation_stop', id: 'ru.rot.stop.1', phrase: 'остановить вращение' },
  { kind: 'rotation_stop', id: 'ru.rot.stop.2', phrase: 'стоп вращение' },
  { kind: 'rotation_stop', id: 'ru.rot.stop.3', phrase: 'затормозить вращение' },

  { kind: 'repair_compartment_start', id: 'ru.rep.comp.start.1', phrase: 'ремонт отсека N' },
  { kind: 'repair_compartment_start', id: 'ru.rep.comp.start.2', phrase: 'начать ремонт отсека N' },
  { kind: 'repair_compartment_start', id: 'ru.rep.comp.start.3', phrase: 'начать ремонт секции N' },

  { kind: 'repair_compartment_cancel', id: 'ru.rep.comp.cancel.1', phrase: 'отмена ремонта отсека N' },
  { kind: 'repair_compartment_cancel', id: 'ru.rep.comp.cancel.2', phrase: 'отменить ремонт отсека N' },
  { kind: 'repair_compartment_cancel', id: 'ru.rep.comp.cancel.3', phrase: 'прервать ремонт отсека N' },

  { kind: 'repair_main_engine', id: 'ru.rep.main.1', phrase: 'ремонт главного двигателя' },
  { kind: 'repair_main_engine', id: 'ru.rep.main.2', phrase: 'починить главный двигатель' },

  { kind: 'repair_maneuver_fuel', id: 'ru.rep.rcs.1', phrase: 'ремонт маневровых двигателей' },
  { kind: 'repair_maneuver_fuel', id: 'ru.rep.rcs.2', phrase: 'ремонт маневровых' },
  { kind: 'repair_maneuver_fuel', id: 'ru.rep.rcs.3', phrase: 'починить маневровые двигатели' },

  { kind: 'module_send_nearest_planet', id: 'ru.mod.planet.1', phrase: 'отправить модуль N на ближайшую планету' },
  { kind: 'module_send_nearest_planet', id: 'ru.mod.planet.2', phrase: 'модуль N к ближайшей планете' },
  { kind: 'module_send_nearest_planet', id: 'ru.mod.planet.3', phrase: 'модуль N на ближайшую планету' },

  { kind: 'module_order_mine_fuel', id: 'ru.mod.fuel.1', phrase: 'приказ добыть топливо для модуля N' },
  { kind: 'module_order_mine_fuel', id: 'ru.mod.fuel.2', phrase: 'модуль N добыть топливо' },
  { kind: 'module_order_mine_fuel', id: 'ru.mod.fuel.3', phrase: 'добыча топлива модуль N' },

  { kind: 'module_order_mine_metal', id: 'ru.mod.metal.1', phrase: 'приказ добывать металл для модуля N' },
  { kind: 'module_order_mine_metal', id: 'ru.mod.metal.2', phrase: 'модуль N добывать металл' },
  { kind: 'module_order_mine_metal', id: 'ru.mod.metal.3', phrase: 'добыча металла модуль N' },

  { kind: 'module_return', id: 'ru.mod.ret.1', phrase: 'вернуть модуль N' },
  { kind: 'module_return', id: 'ru.mod.ret.2', phrase: 'отозвать модуль N' },
  { kind: 'module_return', id: 'ru.mod.ret.3', phrase: 'возврат модуля N' },

  { kind: 'scan_nearest_planet_resources', id: 'ru.scan.1', phrase: 'сканировать планету на наличие ресурсов' },
  { kind: 'scan_nearest_planet_resources', id: 'ru.scan.2', phrase: 'сканировать планету на ресурсы' },
  { kind: 'scan_nearest_planet_resources', id: 'ru.scan.3', phrase: 'скан ресурсов планеты' },
] as const satisfies readonly LexiconEntry[]
