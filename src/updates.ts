import { BigInt, Address, bigDecimal, bigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { Bought as boughtEvent, Sold as soldEvent, Transfer as transferEvent, SURGE as surgeContract } from '../generated/SURGE/SURGE'
import { SRG20 } from '../generated/SURGE/SRG20'
import {  Surgeswap, pair,ticker } from '../generated/schema'
import { SRG20_ADDRESS, FACTORY_ADDRESS, ONE_BI, ZERO_BD, ZERO_BI, dollarToDecimal } from './helpers'


// SurgeSwap Updates
export function updateSurgeswapBought(event: boughtEvent): void {
  let surgeswap = Surgeswap.load(FACTORY_ADDRESS)
  let contract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))

  if (surgeswap === null) {
    surgeswap = new Surgeswap(FACTORY_ADDRESS)
    surgeswap.totalLiquidityUSD = ZERO_BD
    surgeswap.txCount = ZERO_BI
    surgeswap.totalVolumeUSD = ZERO_BD
    surgeswap.totalLiquidityETH = ZERO_BD
    surgeswap.totalLiquiditySRG = ZERO_BD
    surgeswap.pairCount = 1
    surgeswap.save()
  }
  let srgPrice = contract.getBNBPrice().times(contract.calculatePrice())
  let beansAdded = bigDecimal
  .fromString(event.params.beans.toString()).times(bigDecimal.fromString(contract.buyMul().toString())).div(bigDecimal.fromString("100")).div(bigDecimal.fromString('1000000000000000000'))
  surgeswap.totalLiquidityETH = bigDecimal.fromString(surgeswap.totalLiquidityETH.plus(bigDecimal.fromString(beansAdded.toString())).toString())

  let srgLiqUsd = surgeswap.totalLiquiditySRG.times(bigDecimal.fromString(srgPrice.toString())).div(bigDecimal.fromString('1000000000000000000000000000'))
  let ethLiqUsd = surgeswap.totalLiquidityETH.times(bigDecimal.fromString(contract.getBNBPrice().toString())).div(bigDecimal.fromString('1000000000000000000'))
  surgeswap.totalLiquidityUSD = srgLiqUsd.plus(ethLiqUsd)

  surgeswap.totalVolumeUSD = surgeswap.totalVolumeUSD.plus(dollarToDecimal(bigDecimal.fromString(event.params.dollarBuy.toString())))

  surgeswap.txCount = surgeswap.txCount.plus(ONE_BI)
  surgeswap.save()
}

export function updateSurgeswapSold(event: soldEvent): void {
  let surgeswap = Surgeswap.load(FACTORY_ADDRESS)
  let contract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))

  if (surgeswap === null) {
    surgeswap = new Surgeswap(FACTORY_ADDRESS)
    surgeswap.totalLiquidityUSD = ZERO_BD
    surgeswap.txCount = ZERO_BI
    surgeswap.totalVolumeUSD = ZERO_BD
    surgeswap.totalLiquidityETH = ZERO_BD
    surgeswap.totalLiquiditySRG = ZERO_BD
    surgeswap.pairCount = 1
    surgeswap.save()
  }
  let srgPrice = contract.getBNBPrice().times(contract.calculatePrice())
  let beansRemoved = bigDecimal.fromString(event.params.beans.toString()).div(bigDecimal.fromString('1000000000000000000'))
  surgeswap.totalLiquidityETH = surgeswap.totalLiquidityETH.minus(bigDecimal.fromString(beansRemoved.toString()))

  let srgLiqUsd = surgeswap.totalLiquiditySRG.times(bigDecimal.fromString(srgPrice.toString())).div(bigDecimal.fromString('1000000000000000000000000000'))
  let ethLiqUsd = surgeswap.totalLiquidityETH.times(bigDecimal.fromString(contract.getBNBPrice().toString())).div(bigDecimal.fromString('1000000000000000000'))
  surgeswap.totalLiquidityUSD = srgLiqUsd.plus(ethLiqUsd)

  surgeswap.totalVolumeUSD = surgeswap.totalVolumeUSD.plus(dollarToDecimal(bigDecimal.fromString(event.params.dollarSell.toString())))
  surgeswap.txCount = surgeswap.txCount.plus(ONE_BI)
  surgeswap.save()

}

export function updateSurgeswapTransferTo(event: transferEvent): void {
  let surgeswap = Surgeswap.load(FACTORY_ADDRESS)

  let contract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))
  if (surgeswap === null) {
    surgeswap = new Surgeswap(FACTORY_ADDRESS)
    surgeswap.totalLiquidityUSD = ZERO_BD
    surgeswap.txCount = ZERO_BI
    surgeswap.totalVolumeUSD = ZERO_BD
    surgeswap.totalLiquidityETH = ZERO_BD
    surgeswap.totalLiquiditySRG = ZERO_BD
    surgeswap.pairCount = 1
    surgeswap.save()
  }

  let srgPrice = contract.getBNBPrice().times(contract.calculatePrice())
  surgeswap.totalLiquiditySRG = surgeswap.totalLiquiditySRG.
    plus(bigDecimal.fromString(event.params.value.toString()).
      div(bigDecimal.fromString('1000000000')))

  let dollarTransfer = bigDecimal.fromString(event.params.value.toString()).times(bigDecimal.fromString(srgPrice.toString())).div(bigDecimal.fromString('1000000000000000000000000000000000000'))

  let srgLiqUsd = surgeswap.
    totalLiquiditySRG.
    times(bigDecimal.
      fromString(srgPrice.
        toString())).div(bigDecimal.fromString('1000000000000000000000000000'))

  let ethLiqUsd = surgeswap
    .totalLiquidityETH
    .times(bigDecimal.fromString(contract.getBNBPrice().toString()))
    .div(bigDecimal.fromString('1000000000000000000'))

  surgeswap.totalLiquidityUSD = srgLiqUsd.plus(ethLiqUsd)

  surgeswap.totalVolumeUSD = surgeswap.totalVolumeUSD
    .plus(bigDecimal.fromString(dollarTransfer.toString()))
  surgeswap.txCount = surgeswap.txCount.plus(ONE_BI)
  surgeswap.save()
}

export function updateSurgeswapTransferFrom(event: transferEvent): void {
  let surgeswap = Surgeswap.load(FACTORY_ADDRESS)

  let contract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))
  if (surgeswap === null) {
    surgeswap = new Surgeswap(FACTORY_ADDRESS)
    surgeswap.totalLiquidityUSD = ZERO_BD
    surgeswap.txCount = ZERO_BI
    surgeswap.totalVolumeUSD = ZERO_BD
    surgeswap.totalLiquidityETH = ZERO_BD
    surgeswap.totalLiquiditySRG = ZERO_BD
    surgeswap.pairCount = 1
    surgeswap.save()
  }

  surgeswap.totalLiquiditySRG = surgeswap.totalLiquiditySRG.
    minus(bigDecimal.fromString(event.params.value.toString()).
      div(bigDecimal.fromString('1000000000')))

  let srgPrice = contract.getBNBPrice().times(contract.calculatePrice())
  let dollarTransfer = bigDecimal.fromString(event.params.value.toString()).times(bigDecimal.fromString(srgPrice.toString())).div(bigDecimal.fromString('1000000000000000000000000000000000000'))

  let srgLiqUsd = surgeswap.
    totalLiquiditySRG.
    times(bigDecimal.
      fromString(srgPrice.
        toString())).div(bigDecimal.fromString('1000000000000000000000000000'))

  let ethLiqUsd = surgeswap
    .totalLiquidityETH
    .times(bigDecimal.fromString(contract.getBNBPrice().toString()))
    .div(bigDecimal.fromString('1000000000000000000'))

  surgeswap.totalLiquidityUSD = srgLiqUsd.plus(ethLiqUsd)

  surgeswap.totalVolumeUSD = surgeswap.totalVolumeUSD
    .plus(bigDecimal.fromString(dollarTransfer.toString()))
  surgeswap.txCount = surgeswap.txCount.plus(ONE_BI)
  surgeswap.save()
}

//pair updates
export function updatePairBought(): void {
  let surgePair = pair.load(FACTORY_ADDRESS.concat("_").concat("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"))

  if (surgePair === null) {
    surgePair = new pair(FACTORY_ADDRESS.concat("_").concat("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"))
    surgePair.base = FACTORY_ADDRESS
    surgePair.target = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
    surgePair.pool_id = FACTORY_ADDRESS.concat("_").concat("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c")
    surgePair.save()
  }
}

export function updatePair(address: Address):void{
  
  let surgePair = pair.load(address.toHexString().concat("_").concat(FACTORY_ADDRESS))

  let surgeswap = Surgeswap.load(FACTORY_ADDRESS)
  if (surgeswap === null) {
    surgeswap = new Surgeswap(FACTORY_ADDRESS)
    surgeswap.totalLiquidityUSD = ZERO_BD
    surgeswap.txCount = ZERO_BI
    surgeswap.totalVolumeUSD = ZERO_BD
    surgeswap.totalLiquidityETH = ZERO_BD
    surgeswap.totalLiquiditySRG = ZERO_BD
    surgeswap.pairCount = 1
    surgeswap.save()
  }

  if (surgePair === null) {
    surgePair = new pair(address.toHexString().concat("_").concat(FACTORY_ADDRESS))
    surgePair.base = address.toHexString()
    surgePair.target = FACTORY_ADDRESS
    surgePair.pool_id = FACTORY_ADDRESS.concat("_").concat("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c")
    surgePair.save()
    surgeswap.pairCount+=1
    surgeswap.save()
  }
}

// Ticker Updates

export function updateTickerBought(event: boughtEvent): void {
  let srgTicker = ticker.load(FACTORY_ADDRESS)
  let srgContract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))
  if (srgTicker === null) {
    srgTicker = new ticker(FACTORY_ADDRESS)
    srgTicker.base_currency = FACTORY_ADDRESS
    srgTicker.target_currency = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
    srgTicker.last_price = ZERO_BD
    srgTicker.base_volume = ZERO_BD
    srgTicker.target_volume = ZERO_BD
    srgTicker.pool_id = FACTORY_ADDRESS.concat("_").concat("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c")
    srgTicker.liquidity_in_usd = ZERO_BD
  }
  srgTicker.last_price = bigDecimal.fromString(srgContract.calculatePrice().toString()).div(bigDecimal.fromString("1000000000"))
  srgTicker.base_volume = srgTicker.base_volume.plus(bigDecimal.fromString(event.params.tokens.toString()).div(bigDecimal.fromString('1000000000')))
  srgTicker.target_volume = srgTicker.target_volume.plus(bigDecimal.fromString(event.params.beans.toString()).div(bigDecimal.fromString('1000000000000000000')))
  srgTicker.liquidity_in_usd = bigDecimal.fromString(srgContract.getLiquidity().toString())
  .div(bigDecimal.fromString('1000000000000000000'))
  .times(bigDecimal.fromString(srgContract.getBNBPrice().toString()))
  .div(bigDecimal.fromString('1000000000000000000'))
  srgTicker.save()
}

export function updateTickerSold(event: soldEvent): void {
  let srgTicker = ticker.load(FACTORY_ADDRESS)
  let srgContract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))
  if (srgTicker === null) {
    srgTicker = new ticker(FACTORY_ADDRESS)
    srgTicker.base_currency = FACTORY_ADDRESS
    srgTicker.target_currency = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
    srgTicker.last_price = ZERO_BD
    srgTicker.base_volume = ZERO_BD
    srgTicker.target_volume = ZERO_BD
    srgTicker.pool_id = FACTORY_ADDRESS.concat("_").concat("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c")
    srgTicker.liquidity_in_usd = ZERO_BD
  }
  srgTicker.last_price = bigDecimal.fromString(srgContract.calculatePrice().toString()).div(bigDecimal.fromString("1000000000"))
  srgTicker.base_volume = srgTicker.base_volume.plus(bigDecimal.fromString(event.params.tokens.toString()).div(bigDecimal.fromString('1000000000')))
  srgTicker.target_volume = srgTicker.target_volume.plus(bigDecimal.fromString(event.params.beans.toString()).div(bigDecimal.fromString('1000000000000000000')))
  srgTicker.liquidity_in_usd = bigDecimal.fromString(srgContract.getLiquidity().toString())
  .minus(bigDecimal.fromString('20000000000000000000'))
  .div(bigDecimal.fromString('1000000000000000000'))
  .times(bigDecimal.fromString(srgContract.getBNBPrice().toString()))
  .div(bigDecimal.fromString('1000000000000000000'))
  srgTicker.save()
}

export function updateTickerTo(address: Address, event: transferEvent): void {
let srg20Ticker = ticker.load(address.toHexString())
let srgContract = SRG20.bind(address)
let contract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))

if( srg20Ticker===null){
  srg20Ticker = new ticker(address.toHexString())
  srg20Ticker.base_currency = address.toHexString()
  srg20Ticker.target_currency = FACTORY_ADDRESS
  srg20Ticker.last_price = ZERO_BD
  srg20Ticker.base_volume = ZERO_BD
  srg20Ticker.target_volume = ZERO_BD
  srg20Ticker.pool_id = address.toHexString().concat("_").concat(FACTORY_ADDRESS)
  srg20Ticker.liquidity_in_usd = ZERO_BD
}
let srgPrice = contract.getBNBPrice().times(contract.calculatePrice())
let after = srgContract.liqConst().div(srgContract.getLiquidity())
let before = srgContract.liqConst().div(srgContract.getLiquidity().minus(event.params.value))
let newTargetVolume = before.minus(after)

srg20Ticker.last_price = bigDecimal.fromString(srgContract.getLiquidity.toString()).div(bigDecimal.fromString(srgContract.balanceOf(address).toString())).div(bigDecimal.fromString("1000000000")).times(bigDecimal.fromString(srgContract.decimals().toString()))
srg20Ticker.base_volume =  srg20Ticker.base_volume.plus(bigDecimal.fromString(newTargetVolume.toString()).div(bigDecimal.fromString('1'.concat('0'.repeat(srgContract.decimals())))))
srg20Ticker.target_volume = srg20Ticker.target_volume.plus(bigDecimal.fromString(event.params.value.toString()).div(bigDecimal.fromString('1000000000')))
srg20Ticker.liquidity_in_usd = bigDecimal.fromString(srgContract.getLiquidity().toString()).div(bigDecimal.fromString('1000000000')).times(bigDecimal.fromString(srgPrice.toString())).div(bigDecimal.fromString('1000000000000000000000000000'))
srg20Ticker.save()
}

export function updateTickerFrom(address: Address, event: transferEvent): void {
  let srg20Ticker = ticker.load(address.toHexString())
  let srgContract = SRG20.bind(address)
  let contract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))
  
  if( srg20Ticker===null){
    srg20Ticker = new ticker(address.toHexString())
    srg20Ticker.base_currency = address.toHexString()
    srg20Ticker.target_currency = FACTORY_ADDRESS
    srg20Ticker.last_price = ZERO_BD
    srg20Ticker.base_volume = ZERO_BD
    srg20Ticker.target_volume = ZERO_BD
    srg20Ticker.pool_id = address.toHexString().concat("_").concat(FACTORY_ADDRESS)
    srg20Ticker.liquidity_in_usd = ZERO_BD
  }
  let srgPrice = contract.getBNBPrice().times(contract.calculatePrice())
  let after = srgContract.liqConst().div(srgContract.getLiquidity())
  let before = srgContract.liqConst().div(srgContract.getLiquidity().plus(event.params.value))
  let newTargetVolume = after.minus(before)
  
  srg20Ticker.last_price = bigDecimal.fromString(srgContract.getLiquidity.toString()).div(bigDecimal.fromString(srgContract.balanceOf(address).toString())).div(bigDecimal.fromString("1000000000")).times(bigDecimal.fromString(srgContract.decimals().toString()))
  srg20Ticker.base_volume =  srg20Ticker.base_volume.plus(bigDecimal.fromString(newTargetVolume.toString()).div(bigDecimal.fromString('1'.concat('0'.repeat(srgContract.decimals())))))
  srg20Ticker.target_volume = srg20Ticker.target_volume.plus(bigDecimal.fromString(event.params.value.toString()).div(bigDecimal.fromString('1000000000')))
  srg20Ticker.liquidity_in_usd = bigDecimal.fromString(srgContract.getLiquidity().toString()).div(bigDecimal.fromString('1000000000')).times(bigDecimal.fromString(srgPrice.toString())).div(bigDecimal.fromString('1000000000000000000000000000'))
  srg20Ticker.save()
  }
