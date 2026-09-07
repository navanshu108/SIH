import { mandi } from './mockServices';
/** Indicative mock market data; swap this service for a verified market-data integration. */
export async function getMandiPrices(_crop: string, _mandi: string) { return mandi; }
