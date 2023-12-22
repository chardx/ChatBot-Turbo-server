class GeminiProcessingError extends Error {
    constructor(message) {
        super(message);
        this.name = "GeminiProcessingError";

    }
}

export default GeminiProcessingError