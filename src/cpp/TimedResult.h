#ifndef TIMED_RESULT_H
#define TIMED_RESULT_H

template <typename T>
struct TimedResult {
    T value;
    int time;

    TimedResult(T c_value, int c_time) : value(c_value), time(c_time) {}
    TimedResult() {}
};

#endif