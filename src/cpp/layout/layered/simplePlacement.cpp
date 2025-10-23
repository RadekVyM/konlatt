#include "../utils.h"
#include "../../types/ProgressData.h"
#include "placement.h"

#include <vector>
#include <unordered_set>

/**
 * Places the nodes so they are evenly spaced and the layers are horizontally aligned to the center.
 * 
 * Layers need to be sorted from top to bottom.
 */
void simplePlacement(
    std::vector<float>& result,
    std::vector<std::vector<int>>& layers,
    std::vector<std::unordered_set<int>>& subconceptsMapping,
    std::vector<std::unordered_set<int>>& superconceptsMapping,
    int conceptsCount,
    ProgressData& progress
) {
    float top = (float)(layers.size() - 1) / -2;

    for (int i = 0; i < layers.size(); i++) {
        std::vector<int>& layer = layers[i];
        float left = (float)(layer.size() - 1) / -2;

        for (int node : layer) {
            if (node < conceptsCount) {
                setX(result, node, left);
                setY(result, node, -top);
                setZ(result, node, 0);
            }
            left += 1;
        }

        top += 1;
    }
}