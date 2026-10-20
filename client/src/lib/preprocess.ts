
type Landmark = { x: number; y: number; z: number };

type DetectedHand = {
  landmarks: readonly Landmark[];
  handedness: string;
};

export function preprocessHands(
  hands: readonly DetectedHand[]
): Float32Array {
  const features = new Float32Array(126);

  for (const hand of hands) {
    if (!hand.landmarks || hand.landmarks.length < 21) continue;

    const handIndex =
      hand.handedness.toLowerCase() === "left" ? 0 : 1;
    const offset = handIndex * 63;
    const wrist = hand.landmarks[0];
    const reference = hand.landmarks[9];

    const scale = Math.sqrt(
      (reference.x - wrist.x) ** 2 +
      (reference.y - wrist.y) ** 2 +
      (reference.z - wrist.z) ** 2
    );

    if (scale < 1e-6) continue;

    for (let i = 0; i < 21; i++) {
      const point = hand.landmarks[i];
      features[offset + i * 3] = (point.x - wrist.x) / scale;
      features[offset + i * 3 + 1] = (point.y - wrist.y) / scale;
      features[offset + i * 3 + 2] = (point.z - wrist.z) / scale;
    }
  }

  return features;
}
