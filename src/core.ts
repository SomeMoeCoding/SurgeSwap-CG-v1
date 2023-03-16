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
    updateSurgeswapSold, updateSurgeswapTransferTo,updateSurgeswapTransferFrom,updatePair,updatePairBought,updateTickerFrom,updateTickerTo,updateTickerBought,updateTickerSold} from "./updates"

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
  updatePairBought()
  updateTickerBought(event)

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
updateTickerSold(event)
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
      updateTickerFrom(event.params.from,event)
      updatePair(event.params.from)
    }

    else if(checkValidToken(event.params.to) && !checkValidToken(event.params.from)){
      updateSurgeswapTransferTo(event)
      updateTickerTo(event.params.to,event)
      updatePair(event.params.to)

    }

    else if(checkValidToken(event.params.to) && checkValidToken(event.params.from)){

      updateTickerTo(event.params.to,event)
      updatePair(event.params.to)
      updatePair(event.params.from)

    }

  }

}
