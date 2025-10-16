import type { KOL, Hint } from "./types"

export function generateHints(guess: KOL, target: KOL): Hint[] {
  const hints: Hint[] = []

  // Association hint
  hints.push({
    attribute: "association",
    type: guess.attributes.association === target.attributes.association ? "correct" : "wrong",
  })

  // Ecosystem hint
  hints.push({
    attribute: "ecosystem",
    type: guess.attributes.ecosystem === target.attributes.ecosystem ? "correct" : "wrong",
  })

  // PFP Theme hint
  hints.push({
    attribute: "pfpTheme",
    type: guess.attributes.pfpTheme === target.attributes.pfpTheme ? "correct" : "wrong",
  })

  // Followers hint (numerical with direction)
  const followersDiff = Math.abs(guess.attributes.followers - target.attributes.followers)
  const followersThreshold = target.attributes.followers * 0.1 // 10% threshold

  if (guess.attributes.followers === target.attributes.followers) {
    hints.push({ attribute: "followers", type: "correct" })
  } else if (followersDiff <= followersThreshold) {
    hints.push({
      attribute: "followers",
      type: "close",
      direction: guess.attributes.followers < target.attributes.followers ? "higher" : "lower",
    })
  } else {
    hints.push({
      attribute: "followers",
      type: "wrong",
      direction: guess.attributes.followers < target.attributes.followers ? "higher" : "lower",
    })
  }

  // Age hint (numerical with direction)
  const ageDiff = Math.abs(guess.attributes.age - target.attributes.age)

  if (guess.attributes.age === target.attributes.age) {
    hints.push({ attribute: "age", type: "correct" })
  } else if (ageDiff <= 5) {
    hints.push({
      attribute: "age",
      type: "close",
      direction: guess.attributes.age < target.attributes.age ? "higher" : "lower",
    })
  } else {
    hints.push({
      attribute: "age",
      type: "wrong",
      direction: guess.attributes.age < target.attributes.age ? "higher" : "lower",
    })
  }

  return hints
}
