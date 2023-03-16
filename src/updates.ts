import { BigInt, Address, bigDecimal, bigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { Bought as boughtEvent, Sold as soldEvent, Transfer as transferEvent, SURGE as surgeContract } from '../generated/SURGE/SURGE'
import { SRG20 } from '../generated/SURGE/SRG20'
import { Token, TokenDayData, SurgeswapDayData, Surgeswap, pair,ticker } from '../generated/schema'
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
  let srg20Contract = SRG20.bind(Address.fromString(SRG20_ADDRESS))

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

  if (surgePair === null) {
    surgePair = new pair(address.toHexString().concat("_").concat(FACTORY_ADDRESS))
    surgePair.base = address.toHexString()
    surgePair.target = FACTORY_ADDRESS
    surgePair.pool_id = FACTORY_ADDRESS.concat("_").concat("0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c")
    surgePair.save()
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
  srgTicker.base_volume = ZERO_BD.plus(bigDecimal.fromString(event.params.tokens.toString()).div(bigDecimal.fromString('1000000000')))
  srgTicker.target_volume = ZERO_BD.plus(bigDecimal.fromString(event.params.beans.toString()).div(bigDecimal.fromString('1000000000000000000')))
  srgTicker.liquidity_in_usd = bigDecimal.fromString(srgContract.getLiquidity().toString())
  .minus(bigDecimal.fromString('20000000000000000000'))
  .div(bigDecimal.fromString('1000000000000000000'))
  .times(bigDecimal.fromString(srgContract.getBNBPrice().toString()))
  .div(bigDecimal.fromString('1000000000000000000'))
}

export function updateTicker(address: Address, event: transferEvent): void {
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
srg20Ticker.last_price = bigDecimal.fromString(srgContract.calculatePrice().toString()).div(bigDecimal.fromString("1000000000"))
srg20Ticker.base_volume =  srg20Ticker.base_volume.plus(bigDecimal.fromString(srgContract.getTokenAmountOut(event.params.value).toString()).div(bigDecimal.fromString('1'.concat('0'.repeat(srgContract.decimals())))))
srg20Ticker.target_volume = srg20Ticker.target_volume.plus(bigDecimal.fromString(event.params.value.toString()).div(bigDecimal.fromString('1000000000')))
srg20Ticker.liquidity_in_usd = bigDecimal.fromString(srgContract.getLiquidity().toString()).div(bigDecimal.fromString('1000000000')).times(bigDecimal.fromString(srgPrice.toString())).div(bigDecimal.fromString('1000000000000000000000000000'))
srg20Ticker.save()
}


// Token Updates
export function updateTokenBought(): void {
  let surgeToken = Token.load(FACTORY_ADDRESS)
  let srgContract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))

  if (surgeToken === null) {
    surgeToken = new Token(FACTORY_ADDRESS)
    surgeToken.symbol = srgContract.symbol()
    surgeToken.name = srgContract.name()
    surgeToken.decimals = bigInt.fromString(srgContract.decimals().toString())

    surgeToken.totalSupply = srgContract.totalSupply()

    surgeToken.txCount = ZERO_BI
    surgeToken.totalLiquiditySRG = ZERO_BD
    surgeToken.totalLiquidityETH = ZERO_BD
    surgeToken.liquidityUSD = ZERO_BD
    surgeToken.theoreticalLiquidity = bigDecimal.fromString('20')
  }

  surgeToken.tradeVolumeUSD = bigDecimal.fromString(srgContract.totalVolume().toString()).div(bigDecimal.fromString('1000000000000000000000000000000000000'))

  surgeToken.totalLiquidityETH = bigDecimal.fromString(srgContract.getLiquidity().toString())
    .minus(bigDecimal.fromString('20000000000000000000')).div(bigDecimal.fromString('1000000000000000000'))

  surgeToken.liquidityUSD = bigDecimal.fromString(srgContract.getLiquidity().toString())
    .minus(bigDecimal.fromString('20000000000000000000'))
    .div(bigDecimal.fromString('1000000000000000000'))
    .times(bigDecimal.fromString(srgContract.getBNBPrice().toString()))
    .div(bigDecimal.fromString('1000000000000000000'))

  surgeToken.txCount = surgeToken.txCount.plus(ONE_BI)
  surgeToken.save()
}

export function updateTokenSold(): void {
  let surgeToken = Token.load(FACTORY_ADDRESS)
  let srgContract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))

  if (surgeToken === null) {
    surgeToken = new Token(FACTORY_ADDRESS)
    surgeToken.symbol = srgContract.symbol()
    surgeToken.name = srgContract.name()
    surgeToken.decimals = bigInt.fromString(srgContract.decimals().toString())

    surgeToken.totalSupply = srgContract.totalSupply()

    surgeToken.txCount = ZERO_BI
    surgeToken.totalLiquiditySRG = ZERO_BD
    surgeToken.totalLiquidityETH = ZERO_BD
    surgeToken.liquidityUSD = ZERO_BD
    surgeToken.theoreticalLiquidity = bigDecimal.fromString('20000000000000000000')
  }

  surgeToken.tradeVolumeUSD = bigDecimal.fromString(srgContract.totalVolume().toString()).div(bigDecimal.fromString('1000000000000000000000000000000000000'))

  surgeToken.totalLiquidityETH = bigDecimal.fromString(srgContract.getLiquidity().toString())
    .minus(bigDecimal.fromString('20000000000000000000')).div(bigDecimal.fromString('1000000000000000000'))

  surgeToken.liquidityUSD = bigDecimal.fromString(srgContract.getLiquidity().toString())
    .minus(bigDecimal.fromString('20000000000000000000'))
    .div(bigDecimal.fromString('1000000000000000000'))
    .times(bigDecimal.fromString(srgContract.getBNBPrice().toString()))
    .div(bigDecimal.fromString('1000000000000000000'))

  surgeToken.txCount = surgeToken.txCount.plus(ONE_BI)
  surgeToken.save()
}

export function updateToken(address: Address, event: transferEvent): void {
  let srg20Token = Token.load(address.toHexString())
  let srgContract = SRG20.bind(address)
  let contract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))
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

  if (srg20Token === null) {
    srg20Token = new Token(address.toHexString())
    srg20Token.symbol = srgContract.symbol()
    srg20Token.name = srgContract.name()
    srg20Token.decimals = bigInt.fromString(srgContract.decimals().toString())

    srg20Token.totalSupply = srgContract.totalSupply()

    srg20Token.txCount = ZERO_BI
    srg20Token.totalLiquiditySRG = ZERO_BD
    srg20Token.totalLiquidityETH = ZERO_BD
    srg20Token.liquidityUSD = ZERO_BD

    let balance = contract.balanceOf(address)

    let taxBalance = srgContract.try_taxBalance()

    if (taxBalance.reverted) {
      srg20Token.theoreticalLiquidity = bigDecimal.fromString(srgContract.getLiquidity().toString()).minus(bigDecimal.fromString(balance.toString()))
    } 

    else {srg20Token.theoreticalLiquidity = bigDecimal.fromString(srgContract.getLiquidity().toString()).minus(bigDecimal.fromString(balance.toString())).plus(bigDecimal.fromString(taxBalance.value.toString()))
    }
    //update surgeswap pair count
    surgeswap.pairCount += 1
    surgeswap.save()
  }
  let srgPrice = contract.getBNBPrice().times(contract.calculatePrice())
  srg20Token.tradeVolumeUSD = bigDecimal.fromString(srgContract.totalVolume().toString()).div(bigDecimal.fromString('1000000000000000000000000000000000000'))

  srg20Token.totalLiquiditySRG = bigDecimal.fromString(srgContract.getLiquidity().toString())
    .minus(srg20Token.theoreticalLiquidity).div(bigDecimal.fromString('1000000000'))

  srg20Token.liquidityUSD = srg20Token.totalLiquiditySRG.times(bigDecimal.fromString(srgPrice.toString())).div(bigDecimal.fromString('1000000000000000000000000000'))

  srg20Token.txCount = srg20Token.txCount.plus(ONE_BI)
  srg20Token.save()
}

// SurgeswapDayData update
export function updateSurgeswapDayDataBought(event: boughtEvent): void {
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


  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let surgeswapDayData = SurgeswapDayData.load(dayID.toString())
  if (surgeswapDayData === null) {
    surgeswapDayData = new SurgeswapDayData(dayID.toString())
    surgeswapDayData.date = dayStartTimestamp
    surgeswapDayData.dailyVolumeUSD = ZERO_BD
    surgeswapDayData.totalLiquidityUSD = surgeswap.totalLiquidityUSD
    surgeswapDayData.txCount = ZERO_BI

  }

  surgeswapDayData.dailyVolumeUSD = surgeswapDayData.dailyVolumeUSD.plus(dollarToDecimal(bigDecimal.fromString(event.params.dollarBuy.toString())))
  surgeswapDayData.totalLiquidityUSD = surgeswap.totalLiquidityUSD
  surgeswapDayData.txCount = surgeswapDayData.txCount.plus(ONE_BI)

  surgeswapDayData.save()
}

export function updateSurgeswapDayDataSold(event: soldEvent): void {
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

  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let surgeswapDayData = SurgeswapDayData.load(dayID.toString())
  if (surgeswapDayData === null) {
    surgeswapDayData = new SurgeswapDayData(dayID.toString())
    surgeswapDayData.date = dayStartTimestamp
    surgeswapDayData.dailyVolumeUSD = ZERO_BD
    surgeswapDayData.totalLiquidityUSD = surgeswap.totalLiquidityUSD
    surgeswapDayData.txCount = ZERO_BI

  }

  surgeswapDayData.dailyVolumeUSD = surgeswapDayData.dailyVolumeUSD.plus(dollarToDecimal(bigDecimal.fromString(event.params.dollarSell.toString())))
  surgeswapDayData.totalLiquidityUSD = surgeswap.totalLiquidityUSD
  surgeswapDayData.txCount = surgeswapDayData.txCount.plus(ONE_BI)

  surgeswapDayData.save()

}

export function updateSurgeswapDayDataTransfer(event: transferEvent): void {
  let surgeswap = Surgeswap.load(FACTORY_ADDRESS)
  let contract = SRG20.bind(Address.fromString(SRG20_ADDRESS))

  let srgContract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))
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

  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let surgeswapDayData = SurgeswapDayData.load(dayID.toString())
  if (surgeswapDayData === null) {
    surgeswapDayData = new SurgeswapDayData(dayID.toString())
    surgeswapDayData.date = dayStartTimestamp
    surgeswapDayData.dailyVolumeUSD = ZERO_BD
    surgeswapDayData.totalLiquidityUSD = surgeswap.totalLiquidityUSD
    surgeswapDayData.txCount = ZERO_BI

  }

  let srgprice = srgContract.calculatePrice().times(srgContract.getBNBPrice())
  surgeswapDayData.dailyVolumeUSD = surgeswapDayData.dailyVolumeUSD.plus(dollarToDecimal(bigDecimal.fromString(srgprice.toString()).times(bigDecimal.fromString(event.params.value.toString()))))
  surgeswapDayData.totalLiquidityUSD = surgeswap.totalLiquidityUSD
  surgeswapDayData.txCount = surgeswapDayData.txCount.plus(ONE_BI)

  surgeswapDayData.save()
}


// TokenDayData Updates
export function updateTokenDayDataBought(event: boughtEvent): void {
  let token = Token.load(FACTORY_ADDRESS)
  let srgContract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))
  if (token === null) {
    token = new Token(FACTORY_ADDRESS)
    token.symbol = srgContract.symbol()
    token.name = srgContract.name()
    token.decimals = bigInt.fromString(srgContract.decimals().toString())

    token.totalSupply = srgContract.totalSupply()

    token.txCount = ZERO_BI
    token.totalLiquiditySRG = ZERO_BD
    token.totalLiquidityETH = ZERO_BD
    token.liquidityUSD = ZERO_BD
    token.theoreticalLiquidity = bigDecimal.fromString('20')
  }

  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let tokenDayID = token.id
    .toString()
    .concat('-')
    .concat(BigInt.fromI32(dayID).toString())

  let tokenDayData = TokenDayData.load(tokenDayID)
  if (tokenDayData === null) {
    tokenDayData = new TokenDayData(tokenDayID)
    tokenDayData.date = dayStartTimestamp
    tokenDayData.token = token.id
    tokenDayData.priceUSD = ZERO_BD
    tokenDayData.dailyVolumeUSD = ZERO_BD
    tokenDayData.dailyTxns = ZERO_BI
    tokenDayData.totalLiquidityUSD = token.liquidityUSD
  }
  tokenDayData.priceUSD = BigDecimal.fromString(srgContract.calculatePrice().times(srgContract.getBNBPrice()).toString()).div(BigDecimal.fromString('1000000000000000000000000000'))
  tokenDayData.totalLiquidityUSD = token.liquidityUSD
  tokenDayData.dailyTxns = tokenDayData.dailyTxns.plus(ONE_BI)
  tokenDayData.dailyVolumeUSD = tokenDayData.dailyVolumeUSD.plus(dollarToDecimal(bigDecimal.fromString(event.params.dollarBuy.toString())))

  tokenDayData.save()
}

export function updateTokenDayDataSold(event: soldEvent): void {
  let token = Token.load(FACTORY_ADDRESS)
  let srgContract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))
  if (token === null) {
    token = new Token(FACTORY_ADDRESS)
    token.symbol = srgContract.symbol()
    token.name = srgContract.name()
    token.decimals = bigInt.fromString(srgContract.decimals().toString())

    token.totalSupply = srgContract.totalSupply()

    token.txCount = ZERO_BI
    token.totalLiquiditySRG = ZERO_BD
    token.totalLiquidityETH = ZERO_BD
    token.liquidityUSD = ZERO_BD
    token.theoreticalLiquidity = bigDecimal.fromString('20')
  }

  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let tokenDayID = token.id
    .toString()
    .concat('-')
    .concat(BigInt.fromI32(dayID).toString())

  let tokenDayData = TokenDayData.load(tokenDayID)
  if (tokenDayData === null) {
    tokenDayData = new TokenDayData(tokenDayID)
    tokenDayData.date = dayStartTimestamp
    tokenDayData.token = token.id
    tokenDayData.priceUSD = ZERO_BD
    tokenDayData.dailyVolumeUSD = ZERO_BD
    tokenDayData.dailyTxns = ZERO_BI
    tokenDayData.totalLiquidityUSD = token.liquidityUSD
  }
  tokenDayData.priceUSD = BigDecimal.fromString(srgContract.calculatePrice().times(srgContract.getBNBPrice()).toString()).div(BigDecimal.fromString('1000000000000000000000000000'))
  tokenDayData.totalLiquidityUSD = token.liquidityUSD
  tokenDayData.dailyTxns = tokenDayData.dailyTxns.plus(ONE_BI)
  tokenDayData.dailyVolumeUSD = tokenDayData.dailyVolumeUSD.plus(dollarToDecimal(bigDecimal.fromString(event.params.dollarSell.toString())))

  tokenDayData.save()

}

export function updateTokenDayData(address: Address, event: transferEvent): void {
  let srg20Token = Token.load(address.toHexString())
  let srgContract = SRG20.bind(address)
  if (srg20Token === null) {
    srg20Token = new Token(address.toHexString())
    srg20Token.symbol = srgContract.symbol()
    srg20Token.name = srgContract.name()
    srg20Token.decimals = bigInt.fromString(srgContract.decimals().toString())

    srg20Token.totalSupply = srgContract.totalSupply()
    srg20Token.tradeVolumeUSD = bigDecimal.fromString(srgContract.totalVolume().toString()).div(bigDecimal.fromString('1000000000000000000000000000000000000'))

    srg20Token.txCount = ZERO_BI
    srg20Token.totalLiquiditySRG = ZERO_BD
    srg20Token.totalLiquidityETH = ZERO_BD
    srg20Token.liquidityUSD = ZERO_BD
    srg20Token.theoreticalLiquidity = bigDecimal.fromString(srgContract.getLiquidity().toString())
    srg20Token.save()
  }

  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let tokenDayID = srg20Token.id
    .toString()
    .concat('-')
    .concat(BigInt.fromI32(dayID).toString())

  let tokenDayData = TokenDayData.load(tokenDayID)
  if (tokenDayData === null) {
    tokenDayData = new TokenDayData(tokenDayID)
    tokenDayData.date = dayStartTimestamp
    tokenDayData.token = srg20Token.id
    tokenDayData.priceUSD = ZERO_BD
    tokenDayData.dailyVolumeUSD = ZERO_BD
    tokenDayData.dailyTxns = ZERO_BI
    tokenDayData.totalLiquidityUSD = srg20Token.liquidityUSD
  }
  let contract = surgeContract.bind(Address.fromString(FACTORY_ADDRESS))
  let srgPrice = contract.calculatePrice().times(contract.getBNBPrice())

  tokenDayData.priceUSD = BigDecimal.fromString(srgContract.calculatePrice().times(srgPrice).toString()).div(BigDecimal.fromString('1000000000000000000000000000000000000000000000'))
  tokenDayData.totalLiquidityUSD = srg20Token.liquidityUSD
  tokenDayData.dailyTxns = tokenDayData.dailyTxns.plus(ONE_BI)
  tokenDayData.dailyVolumeUSD = tokenDayData.dailyVolumeUSD.plus(dollarToDecimal(
    bigDecimal
      .fromString(event.params.value.toString())
      .times(bigDecimal.fromString(srgPrice
        .toString()))))

  tokenDayData.save()
}