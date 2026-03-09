const express = require('express');
const router = express.Router();
const Calculation = require('../models/Calculation');

// POST /api/calculate
router.post('/calculate', async (req, res) => {

  try {

    console.log("--- START CALCULATION ---");

    const params = req.body;
    console.log("Received params:", params);

    // =============================
    // Validation
    // =============================

    if (params.fftSize < 64 || (params.fftSize & (params.fftSize - 1)) !== 0) {
      return res.status(400).json({
        error: 'FFT Size must be a power of 2 starting from 64.'
      });
    }

    if (params.subcarrierSpacing >= params.samplingRate) {
      return res.status(400).json({
        error: 'Subcarrier Spacing must be smaller than Sampling Rate.'
      });
    }

    // =============================
    // Derived Parameters
    // =============================

    const cpSizeSamples = params.fftSize / 4;
    const dcSubcarriers = 1;

    const totalUsedSubcarriers =
      Math.floor(params.fftSize * (161 / 256));

    const dataPlusPilot =
      totalUsedSubcarriers - dcSubcarriers;

    const ratioParts =
      params.dataPilotRatio
        ? params.dataPilotRatio.split(':')
        : ['3', '1'];

    const dataParts = parseInt(ratioParts[0]);
    const pilotParts = parseInt(ratioParts[1]);
    const totalParts = dataParts + pilotParts;

    const pilotSubcarriers =
      Math.floor(dataPlusPilot * (pilotParts / totalParts));

    const dataSubcarriers =
      dataPlusPilot - pilotSubcarriers;

    const nullSubcarriers =
      params.fftSize -
      dataSubcarriers -
      pilotSubcarriers -
      dcSubcarriers;

    // =============================
    // Modulation Bits
    // =============================

    let bitsPerSymbol = 2;

    if (params.modulation === 'BPSK') bitsPerSymbol = 1;
    if (params.modulation === '16QAM') bitsPerSymbol = 4;
    if (params.modulation === '64QAM') bitsPerSymbol = 6;
    if (params.modulation === '256QAM') bitsPerSymbol = 8;

    // =============================
    // Subframe
    // =============================

    const subframeDurationMs = 1;

    const subframeLengthSamples =
      (params.samplingRate * subframeDurationMs) / 1000;

    // =============================
    // OFDM Symbol Timing
    // =============================

    const totalSymbolLength =
      params.fftSize + cpSizeSamples;

    const symbolDurationUs =
      (totalSymbolLength / params.samplingRate) * 1e6;

    // =============================
    // Symbols Per Subframe
    // =============================

    const totalSymbolsPerSubframe =
      subframeLengthSamples / totalSymbolLength;

    if (totalSymbolsPerSubframe <= params.silenceSymbols) {

      return res.status(400).json({
        error:
          'Total OFDM symbols per subframe must be greater than silence symbols.'
      });

    }

    const dataSymbols =
      totalSymbolsPerSubframe - params.silenceSymbols;

    // =============================
    // Resource Elements
    // =============================

    const dataResPerSubframe =
      dataSubcarriers * dataSymbols;

    const totalBitsPerSubframe =
      dataResPerSubframe * bitsPerSymbol;

    // =============================
    // Data Rate
    // =============================

    const dataRateBps =
      totalBitsPerSubframe / (subframeDurationMs / 1000);

    const dataRateMbps =
      dataRateBps / 1e6;

    // =============================
    // Throughput
    // =============================

    const macThroughputMbps =
      dataRateMbps * params.fecRate;

    // =============================
    // Occupied Bandwidth
    // =============================

    const occupiedBandwidthHz =
      (dataSubcarriers +
        pilotSubcarriers +
        dcSubcarriers) *
      params.subcarrierSpacing;

    const occupiedBandwidthMHz =
      occupiedBandwidthHz / 1e6;

    // =============================
    // Delay Spread Calculation
    // =============================

    // 1. Calculate TCP (Cyclic Prefix Time)
    // TCP = Ncp / Fs
    const tcp = cpSizeSamples / params.samplingRate;
    const tcpUs = tcp * 1e6;

    // Retaining legacy naming for schema and frontend compatibility
    const cpDurationUs = tcpUs;
    const delaySpread = tcp;
    const delaySpreadUs = tcpUs;

    let delayWarning = "Safe: Maximum delay spread aligns with Cyclic Prefix Time (TCP)";

    // =============================
    // Computed Parameters
    // =============================

    const computedParams = {
      ...params,
      cpSizeSamples,
      dataSubcarriers,
      pilotSubcarriers,
      dcSubcarriers,
      nullSubcarriers,
      bitsPerSymbol,
      subframeLengthSamples,
      dataSymbols
    };

    console.log("Computed params:", computedParams);

    // =============================
    // Results Object
    // =============================

    const results = {

      totalSymbolLength,
      symbolDurationUs,
      totalSymbolsPerSubframe,
      dataResPerSubframe,
      totalBitsPerSubframe,
      subframeDurationMs,
      dataRateMbps,
      macThroughputMbps,
      occupiedBandwidthMHz,

      cpDurationUs,

      delaySpread: delaySpreadUs,   // REQUIRED BY SCHEMA
      delayWarning,

      derivedParams: {

        cpSizeSamples,
        dataSubcarriers,
        pilotSubcarriers,
        dcSubcarriers,
        nullSubcarriers,
        bitsPerSymbol,
        subframeLengthSamples,
        dataSymbols

      }

    };

    // =============================
    // Save to MongoDB
    // =============================

    const calculation = new Calculation({

      parameters: computedParams,
      results: results

    });

    const savedCalculation =
      await calculation.save();

    console.log("Successfully saved to DB");

    res.status(201).json(savedCalculation);

  } catch (error) {

    console.error('Calculation error details:', error);

    if (error.errors) {

      console.error(
        'Validation errors:',
        JSON.stringify(error.errors, null, 2)
      );

    }

    res.status(500).json({
      error: 'Failed to calculate and save results.',
      details: error.message
    });

  }

});


// =============================
// GET History
// =============================

router.get('/history', async (req, res) => {

  try {

    const history =
      await Calculation
        .find()
        .sort({ createdAt: -1 });

    res.json(history);

  } catch (error) {

    console.error('Fetch history error:', error);

    res.status(500).json({
      error: 'Failed to fetch calculation history.'
    });

  }

});


// =============================
// DELETE History
// =============================

router.delete('/history', async (req, res) => {

  try {

    await Calculation.deleteMany({});

    res.json({
      message: "History cleared successfully"
    });

  } catch (error) {

    console.error('Clear history error:', error);

    res.status(500).json({
      error: 'Failed to clear calculation history.'
    });

  }

});

module.exports = router;