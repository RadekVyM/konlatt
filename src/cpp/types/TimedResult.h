#ifndef TIMED_RESULT_H
#define TIMED_RESULT_H

template <typename T>
struct TimedResult {
    T value;
    int time;

    TimedResult(T value, int time) : value(value), time(time) {}
    TimedResult() {}
};

#endif