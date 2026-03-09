#ifndef TIMED_RESULT_H
#define TIMED_RESULT_H

/**
 * @brief A generic wrapper to pair a computation result with its execution time.
 * @tparam T The data type of the result value.
 */
template <typename T>
struct TimedResult {
    T value;
    int time;

    TimedResult(T value, int time) : value(value), time(time) {}
    TimedResult() {}
};

#endif