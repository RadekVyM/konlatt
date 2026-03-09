#ifndef PROGRESS_DATA_H
#define PROGRESS_DATA_H

#include <functional>

/**
 * Manages progress tracking across multiple sequential "blocks" of work.
 */
struct ProgressData {
    /** Total number of major tasks */
    int totalBlocks;
    int currentBlock;
    /** Total sub-steps in the current block */
    double totalIterationsCount;
    /** Last iteration count that triggered a callback */
    double previousRecordedIteration;
    std::function<void(double)> onProgress;

    /** Initializes with the total block count and the output callback */
    ProgressData(int totalBlocks, std::function<void(double)> onProgress) :
        totalBlocks(totalBlocks),
        onProgress(onProgress) {
        currentBlock = 0;
        totalIterationsCount = 0;
        previousRecordedIteration = 0;
    }

    /** Resets counters for a new block with a specific size */
    void beginBlock(double totalIterationsCount) {
        this->totalIterationsCount = totalIterationsCount;
        previousRecordedIteration = 0;
    }

    /** Updates progress within the current block, throttling calls to roughly 1% increments */
    void progress(double currentIteration) {
        double block = 100.0 / totalBlocks;
        double updatesPerPercent = totalIterationsCount / block;

        if (currentIteration - previousRecordedIteration >= updatesPerPercent) {
            onProgress(((double)currentBlock / totalBlocks) + ((currentIteration / totalIterationsCount) / totalBlocks));
            previousRecordedIteration = currentIteration;
        }
    }

    /** Marks the current block as done and ensures the progress hits the full block mark */
    void finishBlock() {
        currentBlock++;

        // Ensure the final 100% of this specific block is reported
        if (totalIterationsCount != previousRecordedIteration) {
            onProgress((double)currentBlock / totalBlocks);
        }
    }

    /** Skips/finishes multiple blocks at once */
    void finishBlocks(int count) {
        currentBlock += count;
        onProgress((double)currentBlock / totalBlocks);
    }
};

#endif