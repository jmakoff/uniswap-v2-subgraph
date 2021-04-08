import { Token, SwapMinuteData, Pair, Swap } from '../types/schema'
import { ethereum, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { ZERO_BD } from "./helpers"


export function setSwapsPerMinutes(swap: Swap, event: ethereum.Event): void {
  let intervalInSec = 60 //value of period in sec
  let timestamp = event.block.timestamp.toI32()
  let intervalIndex = timestamp /  intervalInSec // get unique interval within unix history
  let intervalStartUnix = intervalIndex * intervalInSec // want the rounded effect
  let pair = Pair.load(swap.pair)
  let token = swap.amount0In.gt(ZERO_BD) ? pair.token0: pair.token1  // get token wich is sold 
  let intervalEntityID = token.toString()
    .concat('-')
    .concat(BigInt.fromI32(intervalIndex).toString())
    .concat('-')
    .concat(swap.sender.toHexString())

  let totalAmount = swap.amount0In.gt(ZERO_BD) ? swap.amount0In: swap.amount1In
  let swapPerMinute = SwapMinuteData.load(intervalEntityID)
  if (!swapPerMinute) {
    swapPerMinute = new SwapMinuteData(intervalEntityID)
    swapPerMinute.sender = swap.sender
    swapPerMinute.startTimestamp = timestamp
    swapPerMinute.endTimestamp = timestamp
    swapPerMinute.totalAmount = totalAmount
    swapPerMinute.token = token
  }  else {
    swapPerMinute.totalAmount = swapPerMinute.totalAmount + totalAmount
    swapPerMinute.endTimestamp = timestamp
  }
  swapPerMinute.save()

}