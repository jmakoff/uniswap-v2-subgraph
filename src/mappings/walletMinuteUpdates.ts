import { Token, SwapMinuteData, Pair, Swap , Mint, Burn, BurnMinuteData, MintMinuteData, Bundle } from '../types/schema'
import { ethereum, BigInt, BigDecimal, Bytes } from '@graphprotocol/graph-ts'
import { ZERO_BD } from "./helpers"


export function setSwapsPerMinutes(swap: Swap, event: ethereum.Event): void {
  let intervalInSec = 60 //value of period in sec
  let timestamp = event.block.timestamp.toI32()
  let intervalIndex = timestamp /  intervalInSec // get unique interval within unix history
  let intervalStartUnix = intervalIndex * intervalInSec // want the rounded effect
  let pair = Pair.load(swap.pair)
  let token = swap.amount0In.gt(ZERO_BD) ? pair.token0: pair.token1  // get token wich is sold 
  let tokenInfo = Token.load(token)
  let bundle = Bundle.load('1')
  let intervalEntityID = token.toString()
    .concat('-')
    .concat(BigInt.fromI32(intervalIndex).toString())
    .concat('-')
    .concat(swap.sender.toHexString())

  let totalAmount = swap.amount0In.gt(ZERO_BD) ? swap.amount0In: swap.amount1In
  let swapPerMinute = SwapMinuteData.load(intervalEntityID)
  if (!swapPerMinute) {
    swapPerMinute = new SwapMinuteData(intervalEntityID)
    swapPerMinute.sender = swap.from
    swapPerMinute.startTimestamp = timestamp
    swapPerMinute.endTimestamp = timestamp
    swapPerMinute.totalAmount = totalAmount
    swapPerMinute.token = token
  }  else {
    swapPerMinute.totalAmount = swapPerMinute.totalAmount + totalAmount
    swapPerMinute.endTimestamp = timestamp
  }
  swapPerMinute.totalAmountETH = totalAmount.times(tokenInfo.derivedETH as BigDecimal)
  swapPerMinute.totalAmountUSD = swapPerMinute.totalAmountETH.times(bundle.ethPrice)
  swapPerMinute.save()
}


export function setMintsPerMinutes(mint: Mint, event: ethereum.Event): void {
  let intervalInSec = 60 //value of period in sec
  let timestamp = event.block.timestamp.toI32()
  let intervalIndex = timestamp /  intervalInSec // get unique interval within unix history
  let intervalStartUnix = intervalIndex * intervalInSec // want the rounded effect
  let pair = Pair.load(mint.pair)
  let token = mint.amount0.gt(ZERO_BD) ? pair.token0: pair.token1  // get token wich is sold 
  let tokenInfo = Token.load(token)
  let bundle = Bundle.load('1')
  let intervalEntityID = token.toString()
    .concat('-')
    .concat(BigInt.fromI32(intervalIndex).toString())
    .concat('-')
    .concat(mint.to.toHexString())

  let totalAmount = mint.amount0.gt(ZERO_BD) ? mint.amount0: mint.amount1
  let mintPerMinute = MintMinuteData.load(intervalEntityID)
  if (!mintPerMinute) {
    mintPerMinute = new MintMinuteData(intervalEntityID)
    mintPerMinute.receiver = mint.to
    mintPerMinute.startTimestamp = timestamp
    mintPerMinute.endTimestamp = timestamp
    mintPerMinute.totalAmount = totalAmount as BigDecimal
    mintPerMinute.token = token
  }  else {
    mintPerMinute.totalAmount = mintPerMinute.totalAmount.plus(totalAmount as BigDecimal)
    mintPerMinute.endTimestamp = timestamp
  }
  mintPerMinute.totalAmountETH = totalAmount.times(tokenInfo.derivedETH as BigDecimal)
  mintPerMinute.totalAmountUSD = mintPerMinute.totalAmountETH.times(bundle.ethPrice)
  mintPerMinute.save()
}

export function setBurnsPerMinutes(burn: Burn, event: ethereum.Event): void {
  let intervalInSec = 60 //value of period in sec
  let timestamp = event.block.timestamp.toI32()
  let intervalIndex = timestamp /  intervalInSec // get unique interval within unix history
  let intervalStartUnix = intervalIndex * intervalInSec // want the rounded effect
  let pair = Pair.load(burn.pair)
  let token = burn.amount0.gt(ZERO_BD) ? pair.token0: pair.token1  // get token wich is sold 
  let tokenInfo = Token.load(token)
  let bundle = Bundle.load('1')
  let intervalEntityID = token.toString()
    .concat('-')
    .concat(BigInt.fromI32(intervalIndex).toString())
    .concat('-')
    .concat(burn.sender.toHexString())

  let totalAmount = burn.amount0.gt(ZERO_BD) ? burn.amount0: burn.amount1
  let burnPerMinute = BurnMinuteData.load(intervalEntityID)
  if (!burnPerMinute) {
    burnPerMinute = new BurnMinuteData(intervalEntityID)
    burnPerMinute.sender = burn.sender as Bytes
    burnPerMinute.startTimestamp = timestamp
    burnPerMinute.endTimestamp = timestamp
    burnPerMinute.totalAmount = totalAmount as BigDecimal
    burnPerMinute.token = token
  }  else {
    burnPerMinute.totalAmount = burnPerMinute.totalAmount.plus(totalAmount as BigDecimal)
    burnPerMinute.endTimestamp = timestamp
  }
  burnPerMinute.totalAmountETH = totalAmount.times(tokenInfo.derivedETH as BigDecimal)
  burnPerMinute.totalAmountUSD = burnPerMinute.totalAmountETH.times(bundle.ethPrice)
  burnPerMinute.save()
}