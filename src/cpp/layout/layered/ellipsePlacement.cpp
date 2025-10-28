#include "../utils.h"
#include "../../types/ProgressData.h"
#include "placement.h"

#include <vector>
#include <unordered_set>
#include <algorithm>
#include <utility>

std::pair<float, float> getEllipseSemiAxesPow(
    std::vector<std::vector<int>>& layers
) {
    int widestLayerIndex;
    float widestLayerWidth = FLOAT_MIN;

    for (int i = 0; i < layers.size(); i++) {
        std::vector<int>& layer = layers[i];
        float width = layer.size() - 1;

        if (width > widestLayerWidth) {
            widestLayerWidth = width;
            widestLayerIndex = i;
        }
    }

    float verticalAxis = layers.size() - 1;
    float semiVerticalAxis = verticalAxis / 2;
    float rectSemiHeight = std::abs(widestLayerIndex - semiVerticalAxis);
    float rectSemiWidth = widestLayerWidth / 2;

    float semiVerticalAxisPow = std::pow(semiVerticalAxis, 2);

    float semiHorizontalAxisPow = (semiVerticalAxisPow * std::pow(rectSemiWidth, 2)) /
        (semiVerticalAxisPow - std::pow(rectSemiHeight, 2));

    return { semiHorizontalAxisPow, semiVerticalAxisPow };
}

float layerWidth(
    float y,
    float semiHorizontalAxisPow,
    float semiVerticalAxisPow
) {
    float xPow = ((semiHorizontalAxisPow * semiVerticalAxisPow) - (semiHorizontalAxisPow * std::pow(y, 2))) /
        semiVerticalAxisPow;

    if (xPow <= 0) {
        return 0;
    }

    return std::sqrt(xPow) * 2;
}

/**
 * Places the nodes so they are evenly spaced and are filling an ellipse.
 * 
 * Layers need to be sorted from top to bottom.
 */
void ellipsePlacement(
    std::vector<float>& result,
    std::vector<std::vector<int>>& layers,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    int conceptsCount,
    ProgressData& progress
) {
    auto [semiHorizontalAxisPow, semiVerticalAxisPow] = getEllipseSemiAxesPow(layers);
    float top = (float)(layers.size() - 1) / -2;

    for (int i = 0; i < layers.size(); i++) {
        std::vector<int>& layer = layers[i];
        float width = layerWidth(top, semiHorizontalAxisPow, semiVerticalAxisPow);
        float left = width / -2;
        float step = width / (layer.size() - 1);

        for (int node : layer) {
            if (node < conceptsCount) {
                setX(result, node, left);
                setY(result, node, -top);
                setZ(result, node, 0);
            }
            left += step;
        }

        top += 1;
    }
}