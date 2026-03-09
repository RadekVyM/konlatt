#include "../utils.h"
#include "../../types/ProgressData.h"
#include "placement.h"

#include <vector>
#include <unordered_set>
#include <algorithm>
#include <utility>

/**
 * Calculates the squared semi-axes (a^2 and b^2) of an ellipse that circumscribes 
 * the rectangular bounds of the widest layer.
 */
std::pair<float, float> getEllipseSemiAxesPow(
    std::vector<std::vector<int>>& layers
) {
    int widestLayerIndex;
    float widestLayerWidth = FLOAT_MIN;

    // Find the layer with the maximum number of nodes to determine horizontal scale
    for (int i = 0; i < layers.size(); i++) {
        std::vector<int>& layer = layers[i];
        float width = layer.size() - 1; // Width is based on intervals between nodes

        if (width > widestLayerWidth) {
            widestLayerWidth = width;
            widestLayerIndex = i;
        }
    }

    float verticalAxis = layers.size() - 1;
    float semiVerticalAxis = verticalAxis / 2;
    // Vertical distance from the ellipse center to the widest layer
    float rectSemiHeight = std::abs(widestLayerIndex - semiVerticalAxis);
    float rectSemiWidth = widestLayerWidth / 2;

    float semiVerticalAxisPow = std::pow(semiVerticalAxis, 2);

    // Derived from the ellipse equation: (x^2 / a^2) + (y^2 / b^2) = 1
    // Solved for a^2: a^2 = (b^2 * x^2) / (b^2 - y^2)
    float semiHorizontalAxisPow = (semiVerticalAxisPow * std::pow(rectSemiWidth, 2)) /
        (semiVerticalAxisPow - std::pow(rectSemiHeight, 2));

    return { semiHorizontalAxisPow, semiVerticalAxisPow };
}

/**
 * Calculates the horizontal width of the ellipse at a specific vertical offset 'y'.
 */
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
 * Places the nodes such that they are evenly spaced within an elliptical boundary, maintaining the provided layer structure.
 * 
 * Layers need to be sorted from top to bottom.
 */
void ellipsePlacement(
    std::vector<float>& result,
    std::vector<std::vector<int>>& layers,
    std::vector<std::unordered_set<int>>& subconceptsRelation,
    std::vector<std::unordered_set<int>>& superconceptsRelation,
    int conceptsCount,
    ProgressData& progress
) {
    // Get the squared dimensions of the containing ellipse
    auto [semiHorizontalAxisPow, semiVerticalAxisPow] = getEllipseSemiAxesPow(layers);
    // Start at the top of the ellipse (negative offset from center)
    float top = (float)(layers.size() - 1) / -2;

    for (int i = 0; i < layers.size(); i++) {
        std::vector<int>& layer = layers[i];
        // Determine the available horizontal space for this specific layer
        float width = layerWidth(top, semiHorizontalAxisPow, semiVerticalAxisPow);
        float left = width / -2;
        // Calculate horizontal spacing between nodes in this layer
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