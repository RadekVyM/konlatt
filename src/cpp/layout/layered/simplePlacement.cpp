#include "../utils.h"
#include "placement.h"

#include <vector>

void simplePlacement(
    std::vector<float>& result,
    std::vector<std::vector<int>>& layers,
    int conceptsCount
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