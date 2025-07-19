#ifndef LAYOUT_UTILS_H
#define LAYOUT_UTILS_H

#include <vector>

#define COORDS_COUNT 3

float getX(std::vector<float>& layout, int index);
float getY(std::vector<float>& layout, int index);
float getZ(std::vector<float>& layout, int index);
void setX(std::vector<float>& layout, int index, float value);
void setY(std::vector<float>& layout, int index, float value);
void setZ(std::vector<float>& layout, int index, float value);

#endif