#include "utils.h"

float getX(std::vector<float>& layout, int index) {
    return layout[index * COORDS_COUNT];
}
float getY(std::vector<float>& layout, int index) {
    return layout[index * COORDS_COUNT + 1];
}
float getZ(std::vector<float>& layout, int index) {
    return layout[index * COORDS_COUNT + 2];
}

void setX(std::vector<float>& layout, int index, float value) {
    layout[index * COORDS_COUNT] = value;
}
void setY(std::vector<float>& layout, int index, float value) {
    layout[index * COORDS_COUNT + 1] = value;
}
void setZ(std::vector<float>& layout, int index, float value) {
    layout[index * COORDS_COUNT + 2] = value;
}