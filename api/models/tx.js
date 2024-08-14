const { matchModelName } = require('../utils');
const defaultRate = 6;

/** AWS Bedrock pricing */
const bedrockValues = {
  'anthropic.claude-3-haiku-20240307-v1:0': { prompt: 0.25, completion: 1.25 },
  'anthropic.claude-3-sonnet-20240229-v1:0': { prompt: 3.0, completion: 15.0 },
  'anthropic.claude-3-opus-20240229-v1:0': { prompt: 15.0, completion: 75.0 },
  'anthropic.claude-3-5-sonnet-20240620-v1:0': { prompt: 3.0, completion: 15.0 },
  'anthropic.claude-v2:1': { prompt: 8.0, completion: 24.0 },
  'anthropic.claude-instant-v1': { prompt: 0.8, completion: 2.4 },
  'meta.llama2-13b-chat-v1': { prompt: 0.75, completion: 1.0 },
  'meta.llama2-70b-chat-v1': { prompt: 1.95, completion: 2.56 },
  'meta.llama3-8b-instruct-v1:0': { prompt: 0.3, completion: 0.6 },
  'meta.llama3-70b-instruct-v1:0': { prompt: 2.65, completion: 3.5 },
  'meta.llama3-1-8b-instruct-v1:0': { prompt: 0.3, completion: 0.6 },
  'meta.llama3-1-70b-instruct-v1:0': { prompt: 2.65, completion: 3.5 },
  'meta.llama3-1-405b-instruct-v1:0': { prompt: 5.32, completion: 16.0 },
  'mistral.mistral-7b-instruct-v0:2': { prompt: 0.15, completion: 0.2 },
  'mistral.mistral-small-2402-v1:0': { prompt: 0.15, completion: 0.2 },
  'mistral.mixtral-8x7b-instruct-v0:1': { prompt: 0.45, completion: 0.7 },
  'mistral.mistral-large-2402-v1:0': { prompt: 4.0, completion: 12.0 },
  'mistral.mistral-large-2407-v1:0': { prompt: 3.0, completion: 9.0 },
  'cohere.command-text-v14': { prompt: 1.5, completion: 2.0 },
  'cohere.command-light-text-v14': { prompt: 0.3, completion: 0.6 },
  'cohere.command-r-v1:0': { prompt: 0.5, completion: 1.5 },
  'cohere.command-r-plus-v1:0': { prompt: 3.0, completion: 15.0 },
  'ai21.j2-mid-v1': { prompt: 12.5, completion: 12.5 },
  'ai21.j2-ultra-v1': { prompt: 18.8, completion: 18.8 },
  'amazon.titan-text-lite-v1': { prompt: 0.15, completion: 0.2 },
  'amazon.titan-text-express-v1': { prompt: 0.2, completion: 0.6 },
};

for (const [key, value] of Object.entries(bedrockValues)) {
  bedrockValues[`bedrock/${key}`] = value;
}

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
  'gpt-3.5': { prompt: 0.5, completion: 1.5, ggTime: 9, type: 'tier-1' }, // Free Tier1
  'gpt-4o-mini': { prompt: 0.15, completion: 0.6, ggTime: 19, type: 'tier-1' }, // Free Tier1
  'gpt-4-dalle': { prompt: 0.5, completion: 200, ggTime: 1149 },
  'gpt-4o': { prompt: 5, completion: 15, ggTime: 599 },
  'gpt-4-gizmo': { prompt: 5, completion: 15, ggTime: 1149 },

  // Claude
  'claude-3-haiku': { prompt: 0.25, completion: 1.25, ggToken: 0.03, type: 'tier-1' }, // Free Tier1
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
  'gemini-1.5-flash': { prompt: 0.5, completion: 1.5, type: 'tier-1' }, // currently free
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
    case modelName.includes('gpt-4o-mini'):
      return 'gpt-4o-mini';
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

const isTier1 = ({ model, endpoint }) => {
  const _valueKey = getValueKey(model, endpoint);
  return tokenValues[_valueKey]?.type === 'tier-1';
};

module.exports = { tokenValues, getValueKey, getMultiplier, getMultiplierGG, defaultRate, isTier1 };
