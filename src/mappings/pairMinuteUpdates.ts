import { Pair, PairMinuteData, Bundle, Mint } from '../types/schema'
import { ethereum, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { ZERO_BD } from "./helpers"


export function setPairPerMinutes(pair: Pair, event: ethereum.Event): void {
    let intervalInSec = 60 //value of period in sec

    let timestamp = event.block.timestamp.toI32()
    let intervalIndex = timestamp /  intervalInSec // get unique interval within unix history
    let intervalEntityID = pair.id
      .concat('-')
      .concat(BigInt.fromI32(intervalIndex).toString())
    let bundle = Bundle.load('1')
    let PriceLPTokenUSD = ZERO_BD
    let PriceLPTokenETH = ZERO_BD
    if (pair.totalSupply.gt(ZERO_BD)) {
      PriceLPTokenUSD = pair.reserveUSD.div(pair.totalSupply)
      PriceLPTokenETH = pair.reserveETH.div(pair.totalSupply)
    }
    let pairIntervalInstance = PairMinuteData.load(intervalEntityID)
    if (pairIntervalInstance === null) {
      pairIntervalInstance = new PairMinuteData(intervalEntityID)
      pairIntervalInstance.pair = pair.id
      pairIntervalInstance.reserve0 = pair.reserve0
      pairIntervalInstance.reserve1 = pair.reserve1
      pairIntervalInstance.totalMint = ZERO_BD
      pairIntervalInstance.totalBurn = ZERO_BD
      pairIntervalInstance.startTimestamp = timestamp
      pairIntervalInstance.endTimestamp = timestamp
      pairIntervalInstance.openPriceLPTokenUSD = PriceLPTokenUSD
      pairIntervalInstance.closePriceLPTokenUSD = PriceLPTokenUSD
      pairIntervalInstance.highPriceLPTokenUSD = PriceLPTokenUSD
      pairIntervalInstance.minPriceLPTokenUSD = PriceLPTokenUSD
      pairIntervalInstance.openPriceLPTokenETH = PriceLPTokenETH
      pairIntervalInstance.closePriceLPTokenETH = PriceLPTokenETH
      pairIntervalInstance.highPriceLPTokenETH = PriceLPTokenETH
      pairIntervalInstance.minPriceLPTokenETH = PriceLPTokenETH
    }

    if (timestamp > pairIntervalInstance.startTimestamp ){
        pairIntervalInstance.endTimestamp = timestamp
        pairIntervalInstance.closePriceLPTokenUSD = PriceLPTokenUSD
        pairIntervalInstance.closePriceLPTokenUSD = PriceLPTokenETH
    }
    pairIntervalInstance.highPriceLPTokenUSD = pairIntervalInstance.highPriceLPTokenUSD > PriceLPTokenUSD ?  pairIntervalInstance.highPriceLPTokenUSD : PriceLPTokenUSD
    pairIntervalInstance.minPriceLPTokenUSD = pairIntervalInstance.minPriceLPTokenUSD < PriceLPTokenUSD ?  pairIntervalInstance.minPriceLPTokenUSD : PriceLPTokenUSD
    pairIntervalInstance.highPriceLPTokenETH = pairIntervalInstance.highPriceLPTokenETH > PriceLPTokenETH ?  pairIntervalInstance.highPriceLPTokenETH : PriceLPTokenETH
    pairIntervalInstance.minPriceLPTokenETH = pairIntervalInstance.minPriceLPTokenETH < PriceLPTokenETH ?  pairIntervalInstance.minPriceLPTokenETH : PriceLPTokenETH

    pairIntervalInstance.save()
}