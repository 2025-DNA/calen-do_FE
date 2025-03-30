export const getColorByParticipantCount = (count, maxCount = 20) => {
    if (count === 0) return "transparent";

    const baseColor = { r: 234, g: 107, b: 107 }; // #EA6B6B (가장 진한색)
    const background = { r: 255, g: 255, b: 255 }; 

    const ratio = Math.pow(count / maxCount, 0.7); 

    const r = Math.round(background.r + (baseColor.r - background.r) * ratio);
    const g = Math.round(background.g + (baseColor.g - background.g) * ratio);
    const b = Math.round(background.b + (baseColor.b - background.b) * ratio);

    return `rgb(${r}, ${g}, ${b})`;
};