import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  EmergencyWithdrawn,
  OwnershipTransferred,
  Paused,
  Recovered,
  RewardPaid,
  RewardRateUpdated,
  Staked,
  Unpaused,
  Withdrawn
} from "../generated/StakingVault/StakingVault"

export function createEmergencyWithdrawnEvent(
  user: Address,
  amount: BigInt
): EmergencyWithdrawn {
  let emergencyWithdrawnEvent = changetype<EmergencyWithdrawn>(newMockEvent())

  emergencyWithdrawnEvent.parameters = new Array()

  emergencyWithdrawnEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  emergencyWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return emergencyWithdrawnEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createRecoveredEvent(
  token: Address,
  amount: BigInt
): Recovered {
  let recoveredEvent = changetype<Recovered>(newMockEvent())

  recoveredEvent.parameters = new Array()

  recoveredEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  recoveredEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return recoveredEvent
}

export function createRewardPaidEvent(
  user: Address,
  reward: BigInt
): RewardPaid {
  let rewardPaidEvent = changetype<RewardPaid>(newMockEvent())

  rewardPaidEvent.parameters = new Array()

  rewardPaidEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  rewardPaidEvent.parameters.push(
    new ethereum.EventParam("reward", ethereum.Value.fromUnsignedBigInt(reward))
  )

  return rewardPaidEvent
}

export function createRewardRateUpdatedEvent(
  newRate: BigInt
): RewardRateUpdated {
  let rewardRateUpdatedEvent = changetype<RewardRateUpdated>(newMockEvent())

  rewardRateUpdatedEvent.parameters = new Array()

  rewardRateUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newRate",
      ethereum.Value.fromUnsignedBigInt(newRate)
    )
  )

  return rewardRateUpdatedEvent
}

export function createStakedEvent(user: Address, amount: BigInt): Staked {
  let stakedEvent = changetype<Staked>(newMockEvent())

  stakedEvent.parameters = new Array()

  stakedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  stakedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return stakedEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}

export function createWithdrawnEvent(user: Address, amount: BigInt): Withdrawn {
  let withdrawnEvent = changetype<Withdrawn>(newMockEvent())

  withdrawnEvent.parameters = new Array()

  withdrawnEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  withdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return withdrawnEvent
}
