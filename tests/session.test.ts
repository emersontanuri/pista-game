import { describe, expect, it } from 'vitest'
import { createSessionContext } from '../server/utils/session'
import { selectCardParameters } from '../server/utils/cardSelection'

describe('session context', () => {
  it('isolates and reproduces random streams', () => {
    const first = createSessionContext('session-a', 'seed-a')
    const second = createSessionContext('session-b', 'seed-b')
    const replay = createSessionContext('session-a', 'seed-a')
    expect([first.random(), first.random()]).not.toEqual([second.random(), second.random()])
    const replayExpected = createSessionContext('session-a', 'seed-a')
    expect([replay.random(), replay.random()]).toEqual([replayExpected.random(), replayExpected.random()])
  })

  it('uses the session stream for card parameters', () => {
    const parameters = selectCardParameters(createSessionContext('a', 'a').random)
    expect(parameters).toEqual(selectCardParameters(createSessionContext('a', 'a').random))
    expect(parameters.subcategory).toBeTruthy()
  })
})
