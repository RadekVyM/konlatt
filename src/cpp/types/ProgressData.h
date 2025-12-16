#ifndef PROGRESS_DATA_H
#define PROGRESS_DATA_H

#include <functional>

struct ProgressData {
    int totalBlocks;
    int currentBlock;
    double totalIterationsCount;
    double previousRecordedIteration;
    std::function<void(double)> onProgress;

    ProgressData(int totalBlocks, std::function<void(double)> onProgress) :
        totalBlocks(totalBlocks),
        onProgress(onProgress) {
        currentBlock = 0;
        totalIterationsCount = 0;
        previousRecordedIteration = 0;
    }

    void beginBlock(double totalIterationsCount) {
        this->totalIterationsCount = totalIterationsCount;
        previousRecordedIteration = 0;
    }

    void progress(double currentIteration) {
        double block = 100.0 / totalBlocks;
        double updatesPerPercent = totalIterationsCount / block;

        if (currentIteration - previousRecordedIteration >= updatesPerPercent) {
            onProgress(((double)currentBlock / totalBlocks) + ((currentIteration / totalIterationsCount) / totalBlocks));
            previousRecordedIteration = currentIteration;
        }
    }

    void finishBlock() {
        currentBlock++;

        if (totalIterationsCount != previousRecordedIteration) {
            onProgress((double)currentBlock / totalBlocks);
        }
    }
    
    void finishBlocks(int count) {
        currentBlock += count;
        onProgress((double)currentBlock / totalBlocks);
    }
};

#endif