#ifndef LATTICE_ITEM_H
#define LATTICE_ITEM_H

#include <unordered_set>
#include <vector>

class LatticeItem {
public:
    LatticeItem() {}

    int getIndex() const { return index; }
    void setIndex(int value) { index = value; }

    std::unordered_set<int>& getSet() { return set; }
    std::unordered_set<int> getSetCopy() const { return set; }
    void setSet(std::unordered_set<int>& value) { set = value; }

private:
    int index;
    std::unordered_set<int> set;
};

class LatticeVecItem {
public:
    LatticeVecItem() {}

    int getIndex() const { return index; }
    void setIndex(int value) { index = value; }

    std::vector<int>& getSet() { return set; }
    std::vector<int> getSetCopy() const { return set; }
    void setSet(std::vector<int>& value) { set = value; }

private:
    int index;
    std::vector<int> set;
};

#endif