const { matchModelName } = require('../utils');
const defaultRate = 6;

/**
 * Mapping of model token sizes to their respective multipliers for prompt and completion.
 * The rates are 1 USD per 1M tokens.
 * @type {Object.<string, {prompt: number, completion: number}>}
 */
const tokenValues = {
  // '8k': { prompt: 30, completion: 60 },
  // '32k': { prompt: 60, completion: 120 },
  // '4k': { prompt: 1.5, completion: 2 },
  // '16k': { prompt: 3, completion: 4 },

  //GPT
  'gpt-4-dalle': { prompt: 0.5, completion: 200, ggTime: 1149 },
  'gpt-4o': { prompt: 5, completion: 15, ggTime: 599 },
  // 'gpt-3.5': { prompt: 0.5, completion: 1.5, ggTime: 9 },
  'gpt-3.5': { prompt: 0, completion: 0, ggTime: 9 }, // Free Tier1
  'gpt-4-gizmo': { prompt: 5, completion: 15, ggTime: 1149 },

  // Claude
  // 'claude-3-haiku': { prompt: 0.25, completion: 1.25, ggToken: 0.03 },
  'claude-3-haiku': { prompt: 0, completion: 0, ggToken: 0.03 }, // Free Tier1
  'claude-3-sonnet': { prompt: 3, completion: 15, ggToken: 0.3 },
  'claude-3-opus': { prompt: 15, completion: 75, ggToken: 1 },
  'claude-3-5-sonnet': { prompt: 3, completion: 15, ggToken: 0.3 },

  /* cohere doesn't have rates for the older command models,
  so this was from https://artificialanalysis.ai/models/command-light/providers */
  command: { prompt: 0.38, completion: 0.38 },
  'command-r-plus': { prompt: 3, completion: 15 },
  'command-r': { prompt: 0.5, completion: 1.5 },

  // Gemini

  // 'gemini-1.5': { prompt: 7, completion: 21 }, // May 2nd, 2024 pricing
  // 'gemini': { prompt: 0.5, completion: 1.5 }, // May 2nd, 2024 pricing
  'gemini-1.5-flash': { prompt: 0.5, completion: 1.5 }, // currently free
  'gemini-1.5-pro': { prompt: 5, completion: 15 }, // currently free
  'gemini-1.0-pro': { prompt: 0.5, completion: 1.5 }, // currently free
  // gemini: { prompt: 0, completion: 0 }, // currently free
};

/**
 * Retrieves the key associated with a given model name.
 *
 * @param {string} model - The model name to match.
 * @param {string} endpoint - The endpoint name to match.
 * @returns {string|undefined} The key corresponding to the model name, or undefined if no match is found.
 */
const getValueKey = (model, endpoint) => {
  const modelName = matchModelName(model, endpoint);
  if (!modelName) {
    return undefined;
  }

  switch (true) {
    case tokenValues[modelName]:
      return modelName;
    case modelName.includes('dall'):
      console.log('dall-e');
      return 'dall';
    case modelName.includes('gpt-3.5'):
      return 'gpt-3.5';
    case modelName.includes('gpt-4-gizmo'):
      return 'gpt-4-gizmo';
    case modelName.includes('gpt-4'):
      return 'gpt-4o';
    case modelName.includes('3-haiku'):
      return 'claude-3-haiku';
    case modelName.includes('3-sonnet'):
      return 'claude-3-sonnet';
    case modelName.includes('3-opus'):
      return 'claude-3-opus';
    case modelName.includes('3-5-sonnet') || modelName.includes('3.5-sonnet'):
      return 'claude-3-5-sonnet';
    case modelName.includes('gemini') && modelName.includes('flash'):
      return 'gemini-1.5-flash';
    case modelName.includes('gemini') &&
      modelName.includes('pro') &&
      (modelName.includes('1.5') || modelName.includes('1-5')):
      return 'gemini-1.5-pro';
    case modelName.includes('gemini') &&
      modelName.includes('pro') &&
      (modelName.includes('1.0') || modelName.includes('1-0')):
      return 'gemini-1.0-pro';
  }

  return undefined;
};

/**
 * Retrieves the multiplier for a given value key and token type. If no value key is provided,
 * it attempts to derive it from the model name.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} [params.valueKey] - The key corresponding to the model name.
 * @param {string} [params.tokenType] - The type of token (e.g., 'prompt' or 'completion').
 * @param {string} [params.model] - The model name to derive the value key from if not provided.
 * @param {string} [params.endpoint] - The endpoint name to derive the value key from if not provided.
 * @param {EndpointTokenConfig} [params.endpointTokenConfig] - The token configuration for the endpoint.
 * @returns {number} The multiplier for the given parameters, or a default value if not found.
 */
const getMultiplier = ({ valueKey, tokenType, model, endpoint, endpointTokenConfig }) => {
  if (endpointTokenConfig) {
    return endpointTokenConfig?.[model]?.[tokenType] ?? defaultRate;
  }

  if (valueKey && tokenType) {
    return tokenValues[valueKey][tokenType] ?? defaultRate;
  }

  if (!tokenType || !model) {
    return 1;
  }

  valueKey = getValueKey(model, endpoint);
  if (!valueKey) {
    return defaultRate;
  }

  // If we got this far, and values[tokenType] is undefined somehow, return a rough average of default multipliers
  return tokenValues[valueKey][tokenType] ?? defaultRate;
};

const getMultiplierGG = ({ tokenType, model, endpoint }) => {
  if (tokenType === 'prompt') {
    return {
      per: 'time',
      value: 1,
    };
  }

  const _valueKey = getValueKey(model, endpoint);

  return tokenValues[_valueKey]?.ggTime
    ? {
        per: 'time',
        value: tokenValues[_valueKey]?.ggTime,
      }
    : {
        per: 'token',
        value: tokenValues[_valueKey]?.ggToken,
      };
};

module.exports = { tokenValues, getValueKey, getMultiplier, getMultiplierGG, defaultRate };
