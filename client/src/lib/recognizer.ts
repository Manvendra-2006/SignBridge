
export interface Recognizer {
  init(): Promise<void>;
  predict(
    frame: Float32Array
  ): Promise<{ label: string; confidence: number }>;
}

const API_URL = "http://127.0.0.1:8000/predict";

const SESSION_ID = `signbridge-${Date.now()}-${Math.random()
  .toString(36)
  .slice(2)}`;

class PythonRecognizer implements Recognizer {
  async init(): Promise<void> {
    // The Python API does not provide a GET / health-check endpoint.
    // The first prediction request will test the connection.
    return Promise.resolve();
  }

  async predict(
    frame: Float32Array
  ): Promise<{ label: string; confidence: number }> {
    if (frame.length !== 126) {
      throw new Error(
        `Expected 126 features, received ${frame.length}`
      );
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: SESSION_ID,
        features: Array.from(frame),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Python API returned HTTP ${response.status}`
      );
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return {
      label: result.label ?? "IDLE",
      confidence: Number(result.confidence ?? 0),
    };
  }
}

export function getRecognizer(): Recognizer {
  return new PythonRecognizer();
}
