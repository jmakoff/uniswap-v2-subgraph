import { Token, TokenMinuteData, Bundle } from '../types/schema'
import { ethereum, BigInt, BigDecimal, log } from '@graphprotocol/graph-ts'

export function setTokenPerMinutes(token: Token, event: ethereum.Event): void {
    let intervalInSec = 60 //value of period in sec
    let timestamp = event.block.timestamp.toI32()
    log.debug('Token Per minute call at {}', [timestamp.toString()])
    let intervalIndex = timestamp /  intervalInSec // get unique interval within unix history
    let intervalStartUnix = intervalIndex * intervalInSec // want the rounded effect
    let intervalEntityID = token.id
      .concat('-')
      .concat(BigInt.fromI32(intervalIndex).toString())
    let bundle = Bundle.load('1')
    let tokenPriceUsd = token.derivedETH.times(bundle.ethPrice)
    let tokenPriceETH = token.derivedETH as BigDecimal
    let tokenIntevalInstance = TokenMinuteData.load(intervalEntityID)
    if (tokenIntevalInstance === null) {
      tokenIntevalInstance = new TokenMinuteData (intervalEntityID)
      tokenIntevalInstance.startTimestamp = timestamp
      tokenIntevalInstance.endTimestamp = timestamp
      tokenIntevalInstance.token =  token.id
      tokenIntevalInstance.openPriceUSD = tokenPriceUsd
      tokenIntevalInstance.closePriceUSD = tokenPriceUsd
      tokenIntevalInstance.highPriceUSD = tokenPriceUsd
      tokenIntevalInstance.minPriceUSD = tokenPriceUsd
      tokenIntevalInstance.openPriceETH = tokenPriceETH
      tokenIntevalInstance.closePriceETH = tokenPriceETH
      tokenIntevalInstance.highPriceETH = tokenPriceETH
      tokenIntevalInstance.minPriceETH = tokenPriceETH
    }

    if (timestamp > tokenIntevalInstance.startTimestamp ){
        tokenIntevalInstance.endTimestamp = timestamp
        tokenIntevalInstance.closePriceUSD = tokenPriceUsd
    }
    tokenIntevalInstance.highPriceUSD = tokenIntevalInstance.highPriceUSD > tokenPriceUsd ?  tokenIntevalInstance.highPriceUSD : tokenPriceUsd
    tokenIntevalInstance.minPriceUSD = tokenIntevalInstance.minPriceUSD < tokenPriceUsd ?  tokenIntevalInstance.minPriceUSD : tokenPriceUsd
    tokenIntevalInstance.save()
}