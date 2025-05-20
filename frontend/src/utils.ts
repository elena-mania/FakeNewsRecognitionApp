type PredictionType = "fake_news" | "misinformation" | "propaganda" | "real_news" | "satire" | "unknown";

export const predictionLabels: { [key: number]: PredictionType } = {
    0: "fake_news",
    1: "misinformation",
    2: "propaganda",
    3: "real_news",
    4: "satire"
};

export const romanianLabels: { [key in PredictionType]: string } = {
    "fake_news": "Știre Falsă",
    "misinformation": "Dezinformare",
    "propaganda": "Propagandă",
    "real_news": "Știre Adevărată",
    "satire": "Satiră",
    "unknown": "Necunoscut"
};

export const getPredictionLabel = (prediction: number): string => {
    const label = predictionLabels[prediction] || "unknown";
    return romanianLabels[label];
}; 