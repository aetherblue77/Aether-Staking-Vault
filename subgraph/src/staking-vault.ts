import {BigInt} from "@graphprotocol/graph-ts"
import {
  Staked as StakedEvent,
  Withdrawn as WithdrawnEvent
} from "../generated/StakingVault/StakingVault"
import {StakingStat, Staker} from "../generated/schema"

// Helper Function: For take or create global statistic (only 1 row)
function getOrCreateStats(): StakingStat {
  let stat = StakingStat.load("global")
  if (!stat) {
    stat = new StakingStat("global")
    stat.totalValueLocked = BigInt.fromI32(0)
    stat.totalActiveStakers = 0
    stat.save()
  }
  return stat
}

// Helper Function: For take or create user (Staker)
function getOrCreateStaker(id: string): Staker {
  let staker = Staker.load(id)
  if (!staker) {
    staker = new Staker(id)
    staker.totalStaked = BigInt.fromI32(0)
    staker.isActive = false
    staker.save()
  }
  return staker
}

// --------------------------------------------------
// MAIN LOGIC
// --------------------------------------------------

export function handleStaked(event: StakedEvent): void {
  // 1. Load Data
  let stat = getOrCreateStats()
  let staker = getOrCreateStaker(event.params.user.toHexString())
  let amount = event.params.amount

  // 2. Check if this is New Staker (Before the fund = 0, Now, the fund > 0)
  let isNewActiveStaker = !staker.isActive && staker.totalStaked.equals(BigInt.fromI32(0))

  if (isNewActiveStaker) {
    staker.isActive = true
    stat.totalActiveStakers++
  }

  // 3. Update Fund & TVL
  staker.totalStaked = staker.totalStaked.plus(amount)
  stat.totalValueLocked = stat.totalValueLocked.plus(amount)

  // 4. Save Changes
  staker.save()
  stat.save()
}

export function handleWithdrawn(event: WithdrawnEvent): void {
  // 1. Load Data
  let stat = getOrCreateStats()
  let staker = getOrCreateStaker(event.params.user.toHexString())
  let amount = event.params.amount

  // 2. Update Fund & TVL first
  staker.totalStaked = staker.totalStaked.minus(amount)
  stat.totalValueLocked = stat.totalValueLocked.minus(amount)

  // 3. Check if there is no fund left
  if (staker.totalStaked.equals(BigInt.fromI32(0))) {
    staker.isActive = false
    // Minus counter, but don't be negative
    if (stat.totalActiveStakers > 0) {
      stat.totalActiveStakers--
    }
  }

  // 4. Save Changes
  staker.save()
  stat.save()
}