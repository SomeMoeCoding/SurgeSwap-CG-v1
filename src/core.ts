import {
  Bought as BoughtEvent,
  Sold as SoldEvent,
  Transfer as TransferEvent,
} from "../generated/SURGE/SURGE"
import {
  Bought,
  Sold,
  Transfer
} from "../generated/schema"

import { FACTORY_ADDRESS,ADDRESS_DEAD,ADDRESS_ZERO, checkValidToken } from "./helpers"

import{updateSurgeswapBought,
    updateSurgeswapSold, updateSurgeswapTransferTo,updateSurgeswapTransferFrom,updatePair,updatePairBought,updateTicker,updateTickerBought,updateTickerSold} from "./updates"

export function handleBought(event: BoughtEvent): void {

  // handles surge bought event
  let entity = new Bought(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokens = event.params.tokens
  entity.beans = event.params.beans
  entity.dollarBuy = event.params.dollarBuy

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  updateSurgeswapBought(event)
  updateSurgeswapDayDataBought(event)
  updateTokenBought()
  updateTokenDayDataBought(event)

}

export function handleSold(event: SoldEvent): void {
  let entity = new Sold(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokens = event.params.tokens
  entity.beans = event.params.beans
  entity.dollarSell = event.params.dollarSell

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

updateSurgeswapSold(event)
updateSurgeswapDayDataSold(event)

updateTokenSold()
updateTokenDayDataSold(event)
}


export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

let addressTo = event.params.to.toHexString()
let addressFrom = event.params.from.toHexString()

if(addressFrom != ADDRESS_DEAD.toLowerCase() && addressFrom != ADDRESS_ZERO.toLowerCase() && addressFrom != FACTORY_ADDRESS.toLowerCase()
  && addressTo != ADDRESS_DEAD.toLowerCase() && addressTo != ADDRESS_ZERO.toLowerCase() && addressTo != FACTORY_ADDRESS.toLowerCase()){
    if(checkValidToken(event.params.from)&& !checkValidToken(event.params.to)){
      updateSurgeswapTransferFrom(event)
      updateToken(event.params.from,event)
      updateSurgeswapDayDataTransfer(event)
      updateTokenDayData(event.params.from,event)
      
    }

    else if(checkValidToken(event.params.to)&& !checkValidToken(event.params.from)){
      updateSurgeswapTransferTo(event)
      updateToken(event.params.to,event)
      updateSurgeswapDayDataTransfer(event)
      updateTokenDayData(event.params.to,event)

    }

    else if(checkValidToken(event.params.to)&& checkValidToken(event.params.from)){
      updateSurgeswapDayDataTransfer(event)
      updateToken(event.params.from,event)
      updateToken(event.params.to,event)
      updateTokenDayData(event.params.to,event)
      updateTokenDayData(event.params.from,event)

    }

  }

}
