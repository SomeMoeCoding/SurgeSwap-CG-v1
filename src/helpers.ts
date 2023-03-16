/* eslint-disable prefer-const */
import {  BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import {  Token} from '../generated/schema'

import {SRG20 } from '../generated/SURGE/SRG20'


export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'
export const FACTORY_ADDRESS = '0x9f19c8e321bD14345b797d43E01f0eED030F5Bff'
export const ADDRESS_DEAD = '0x000000000000000000000000000000000000dEaD'
export const SRG20_ADDRESS = '0x4ceaCF951294f78bde6B51863aF8fDC03d54728e'


export let ZERO_BI = BigInt.fromI32(0)
export let ONE_BI = BigInt.fromI32(1)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BD = BigDecimal.fromString('1')
export let BI_18 = BigInt.fromI32(18)


export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function dollarToDecimal(dollar: BigDecimal): BigDecimal {
  return dollar.div(exponentToBigDecimal(BigInt.fromString('36')))
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString('1000000000000000000')
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(BigInt.fromString('18')))
}

export function convertSRGToDecimal(srg: BigInt): BigDecimal {
  return srg.toBigDecimal().div(exponentToBigDecimal(BigInt.fromString('9')))
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString())
  const zero = parseFloat(ZERO_BD.toString())
  if (zero == formattedVal) {
    return true
  }
  return false
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}


export function checkValidToken(address: Address): boolean {
  // Bind the contract to the address that emitted the event
if (Token.load(address.toHexString()) != null) {
    return true
}

let contract = SRG20.bind(address)

let srgPrice = contract.try_getSRGPrice()
if(srgPrice.reverted) {return false}

let trySymbol = contract.try_symbol()
if(trySymbol.reverted) {return false}
let tryName = contract.try_name()
if(tryName.reverted) {return false}
let tryDecimals = contract.try_decimals()
if(tryDecimals.reverted) {return false}
let tryTotalSupply = contract.try_totalSupply()
if(tryTotalSupply.reverted) {return false}
let tryTotalTx = contract.try_totalTx()
if(tryTotalTx.reverted) {return false}
let tryTotalLiquidity = contract.try_getLiquidity()
if(tryTotalLiquidity.reverted) {return false}

return true}

