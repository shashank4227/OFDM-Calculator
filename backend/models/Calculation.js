const mongoose = require('mongoose');

const calculationSchema = new mongoose.Schema({
  parameters: {
    fftSize: { type: Number, required: true },
    samplingRate: { type: Number, required: true },
    subcarrierSpacing: { type: Number, required: true },
    silenceSymbols: { type: Number, required: true },
    dataPilotRatio: { type: String, required: true },
    modulation: { type: String, required: true },
    fecRate: { type: Number, required: true },
    // Derived parameters saved for completeness
    cpSizeSamples: { type: Number },
    dataSubcarriers: { type: Number },
    pilotSubcarriers: { type: Number },
    dcSubcarriers: { type: Number },
    nullSubcarriers: { type: Number },
    bitsPerSymbol: { type: Number },
    subframeLengthSamples: { type: Number },
    dataSymbols: { type: Number }
  },
  results: {
    totalSymbolLength: { type: Number, required: true },
    symbolDurationUs: { type: Number, required: true },
    totalSymbolsPerSubframe: { type: Number, required: true },
    dataResPerSubframe: { type: Number, required: true },
    totalBitsPerSubframe: { type: Number, required: true },
    subframeDurationMs: { type: Number, required: true },
    dataRateMbps: { type: Number, required: true },
    macThroughputMbps: { type: Number, required: true },
    occupiedBandwidthMHz: { type: Number, required: true },
    derivedParams: { type: Object }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Calculation', calculationSchema);
