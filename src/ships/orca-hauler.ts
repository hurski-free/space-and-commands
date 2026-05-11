import type { ShipMeshTemplate } from './ship-mesh-types'

/**
 * Max ‖(x,y)‖ of the previous unnormalized hull — multiply normalized coords by this for world meters.
 */
const ORCA_LOCAL_UNITS_TO_WORLD_METERS = 60

/**
 * Wide hauler — long cargo slab, four stern bells.
 * Vertices/nozzles: unit hull (max radius 1); UVs unchanged (nose top low v, port → +u; 8%/84% PNG margins).
 */
export const orcaHaulerMesh: ShipMeshTemplate = {
  id: 'orca-hauler',
  displayName: 'Orca hauler',
  /** Tuned vs default mass (~11t) and typical approach speeds. */
  structuralStrength: 500_000,
  /** Nose along local horizon; tail/engine end is the reference end of the longitudinal axis. */
  landingNominalRadialToNoseDeg: 0,
  landingMaxDeviationDeg: 17,
  localUnitsToWorldMeters: ORCA_LOCAL_UNITS_TO_WORLD_METERS,
  vertices: [
    { x: 0.573568, y: 0, u: 0.5, v: 0.08 },
    { x: 0.462041, y: 0.170967, u: 0.6122, v: 0.1471 },
    { x: 0.318649, y: 0.319874, u: 0.71, v: 0.2334 },
    { x: 0.175257, y: 0.452236, u: 0.7969, v: 0.3197 },
    { x: 0.031865, y: 0.584598, u: 0.8838, v: 0.406 },
    { x: -0.175257, y: 0.617688, u: 0.9055, v: 0.5307 },
    { x: -0.382378, y: 0.639749, u: 0.92, v: 0.6553 },
    { x: -0.573568, y: 0.496357, u: 0.8259, v: 0.7704 },
    { x: -0.701027, y: 0.319874, u: 0.71, v: 0.8471 },
    { x: -0.790249, y: 0.612786, u: 0.9023, v: 0.9008 },
    { x: -0.822114, y: 0, u: 0.5, v: 0.92 },
    { x: -0.790249, y: -0.612786, u: 0.0977, v: 0.9008 },
    { x: -0.701027, y: -0.319874, u: 0.29, v: 0.8471 },
    { x: -0.573568, y: -0.496357, u: 0.1741, v: 0.7704 },
    { x: -0.382378, y: -0.639749, u: 0.08, v: 0.6553 },
    { x: -0.175257, y: -0.617688, u: 0.0945, v: 0.5307 },
    { x: 0.031865, y: -0.584598, u: 0.1162, v: 0.406 },
    { x: 0.175257, y: -0.452236, u: 0.2031, v: 0.3197 },
    { x: 0.318649, y: -0.319874, u: 0.29, v: 0.2334 },
    { x: 0.462041, y: -0.170967, u: 0.3878, v: 0.1471 },
    { x: -0.175894, y: 0, u: 0.5, v: 0.5311 },
  ],
  indices: [
    [20, 0, 1],
    [20, 1, 2],
    [20, 2, 3],
    [20, 3, 4],
    [20, 4, 5],
    [20, 5, 6],
    [20, 6, 7],
    [20, 7, 8],
    [20, 8, 9],
    [20, 9, 10],
    [20, 10, 11],
    [20, 11, 12],
    [20, 12, 13],
    [20, 13, 14],
    [20, 14, 15],
    [20, 15, 16],
    [20, 16, 17],
    [20, 17, 18],
    [20, 18, 19],
    [20, 19, 0],
  ],
  hullLoop: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  nozzlePositions: [
    { x: -0.832995, y: 0.196731 },
    { x: -0.832995, y: 0.059662 },
    { x: -0.832995, y: -0.059662 },
    { x: -0.832995, y: -0.196731 },
  ],
}
