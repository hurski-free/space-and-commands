import type { LevelTask } from '../simulation/level-config'

export interface LevelTaskProgressEntry {
  readonly kind: LevelTask['kind']
  readonly target: number
  readonly current: number
  readonly complete: boolean
}

export interface LevelProgressView {
  readonly tasks: readonly LevelTaskProgressEntry[]
  readonly levelComplete: boolean
}

/**
 * Tracks unique planets scanned / visited for level objectives.
 */
export class LevelTaskTracker {
  private readonly tasks: readonly LevelTask[]
  private readonly scannedPlanetIds = new Set<string>()
  private readonly visitedPlanetIds = new Set<string>()
  private levelComplete = false

  constructor(tasks: readonly LevelTask[]) {
    this.tasks = tasks
  }

  recordScan(planetId: string): void {
    if (this.levelComplete) return
    this.scannedPlanetIds.add(planetId)
    this.refreshCompletion()
  }

  /** Counts once per planet id when the ship gains `planetAttachment`. */
  recordVisit(planetId: string): void {
    if (this.levelComplete) return
    this.visitedPlanetIds.add(planetId)
    this.refreshCompletion()
  }

  isLevelComplete(): boolean {
    return this.levelComplete
  }

  getProgress(): LevelProgressView {
    return {
      tasks: this.tasks.map((task) => {
        const current = this.currentForTask(task)
        const target = task.count
        return {
          kind: task.kind,
          target,
          current: Math.min(current, target),
          complete: current >= target,
        }
      }),
      levelComplete: this.levelComplete,
    }
  }

  private currentForTask(task: LevelTask): number {
    switch (task.kind) {
      case 'scan_planets':
        return this.scannedPlanetIds.size
      case 'visit_planets':
        return this.visitedPlanetIds.size
      default: {
        const _exhaustive: never = task
        void _exhaustive
        return 0
      }
    }
  }

  private refreshCompletion(): void {
    if (this.tasks.length === 0) {
      this.levelComplete = false
      return
    }
    this.levelComplete = this.tasks.every((task) => this.currentForTask(task) >= task.count)
  }
}
