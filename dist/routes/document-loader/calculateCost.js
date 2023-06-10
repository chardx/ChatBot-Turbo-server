//// 3. Import Tiktoken for token counting
import { Tiktoken } from "@dqbd/tiktoken/lite";
import { load } from "@dqbd/tiktoken/load";
import registry from "@dqbd/tiktoken/registry.json" assert { type: "json" };
import models from "@dqbd/tiktoken/model_to_encoding.json" assert { type: "json" };
export const calculateCost = async (docs) => {
    const modelName = "text-embedding-ada-002";
    const modelKey = models[modelName];
    const model = await load(registry[modelKey]);
    const encoder = new Tiktoken(model.bpe_ranks, model.special_tokens, model.pat_str);
    const tokens = encoder.encode(JSON.stringify(docs));
    const tokenCount = tokens.length;
    const ratePerThousandTokens = 0.0004;
    const cost = (tokenCount / 1000) * ratePerThousandTokens;
    encoder.free();
    return cost;
};
//# sourceMappingURL=calculateCost.js.map